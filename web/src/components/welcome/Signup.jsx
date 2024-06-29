import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Signup({ setShowLogin }) {
  const { enqueueSnackbar } = useSnackbar();
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch(
      `${process.env.REACT_APP_PMU_API_URL}/api/user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pseudo, email, password }),
      }
    );
    const data = await response.json();

    if (data.errorCode) {
      switch (data.errorCode) {
        case 1001:
          enqueueSnackbar(
            "Votre mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial",
            {
              variant: "error",
            }
          );
          break;
        case 1002:
          enqueueSnackbar("Un compte existe déjà avec cet email", {
            variant: "error",
          });
          break;
        case 1003:
          enqueueSnackbar("Une erreur est survenue", {
            variant: "error",
          });
          break;
        case 1004:
          enqueueSnackbar("Veuillez remplir tous les champs", {
            variant: "error",
          });
          break;
        case 1005:
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
      enqueueSnackbar("Inscrit avec succès", {
        variant: "success",
      });
      setShowLogin(true);
    }
  };
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signup">
      <h2>INSCRIPTION</h2>
      <form onSubmit={handleSubmit}>
        <label className="textField">
          <p className="label">Pseudo:</p>
          <input
            type="pseudo"
            name="pseudo"
            className="inputText"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            autoComplete="off"
            required
          />
        </label>
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
        <input type="submit" value="S'inscrire" className="primaryButton" />
      </form>
    </div>
  );
}

export default Signup;
