import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Login({ onLogin }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch(
      `${process.env.REACT_APP_PMU_API_URL}/api/user?email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`
    );
    const data = await response.json();

    if (data.errorCode) {
      switch (data.errorCode) {
        case 1010:
          enqueueSnackbar("Aucun compte n'existe avec cet email", {
            variant: "error",
          });
          break;
        case 1011:
          enqueueSnackbar("Mot de passe incorrect", {
            variant: "error",
          });
          break;
        case 1012:
          enqueueSnackbar("Une erreur est survenue", {
            variant: "error",
          });
          break;
        case 1013:
          enqueueSnackbar("Veuillez remplir tous les champs", {
            variant: "error",
          });
          break;
        case 1014:
          enqueueSnackbar(
            "Le mail et le mot de passe doivent être des chaînes de caractère",
            {
              variant: "error",
            }
          );
          break;
        default:
          enqueueSnackbar("Une erreur inconnue est survenue", {
            variant: "error",
          });
      }
      return;
    } else {
      onLogin(data.id, data.token);
      sessionStorage.setItem("pseudo", data.pseudo);
      enqueueSnackbar("Connecté avec succès", {
        variant: "success",
      });
      navigate("/menu");
    }
  };
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login">
      <h2>CONNEXION</h2>
      <form onSubmit={handleSubmit}>
        <label className="textField">
          <p className="label">Adresse mail:</p>
          <input
            type="email"
            name="email"
            className="inputText"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
          />
        </label>
        <label className="textField">
          <p className="label">Mot de passe:</p>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="inputText"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            required
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="btn-pwd"
          >
            {showPassword ? (
              <FontAwesomeIcon icon={faEyeSlash} className="eye-icon" />
            ) : (
              <FontAwesomeIcon icon={faEye} className="eye-icon" />
            )}
          </button>
        </label>
        <input type="submit" value="Se connecter" className="primaryButton" />
      </form>
    </div>
  );
}

export default Login;
