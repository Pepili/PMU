import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [decodedToken, setDecodedToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      setDecodedToken(jwtDecode(token));
    } catch (err) {
      enqueueSnackbar("Token invalide", { variant: "error" });
      navigate("/");
    }
  }, [location, navigate, enqueueSnackbar]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      enqueueSnackbar("Les mots de passe ne correspondent pas", {
        variant: "error",
      });
      return;
    }
    const response = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: decodedToken.user_id,
        pseudo: decodedToken.pseudo,
        email: decodedToken.email,
        password: password,
      }),
    });
    const data = await response.json();

    if (data.errorCode) {
      switch (data.errorCode) {
        case 1026:
          enqueueSnackbar("Une erreur est survenue", {
            variant: "error",
          });
          break;
        case 1020:
          enqueueSnackbar(
            "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et doit être d'au moins 8 caractères",
            {
              variant: "error",
            }
          );
          break;
        case 1022:
          enqueueSnackbar("Utilisateur introuvable", {
            variant: "error",
          });
          break;
        case 1023:
          enqueueSnackbar("Données invalides", {
            variant: "error",
          });
          break;
        case 1024:
          enqueueSnackbar("Données manquantes", {
            variant: "error",
          });
          break;
        case 1025:
          enqueueSnackbar("Email déjà existant", {
            variant: "error",
          });
          break;
        default:
          enqueueSnackbar("Une erreur inconnue est survenue", {
            variant: "error",
          });
      }
      return;
    } else {
      enqueueSnackbar("Mot de passe réinitialisé avec succès", {
        variant: "success",
      });
      navigate("/");
    }
  };

  return (
    <div className="welcome">
      <div className="login">
        <h2>REINITIALISER LE MOT DE PASSE</h2>
        <form onSubmit={handleSubmit}>
          <label className="textField">
            <p className="label">Nouveau mot de passe:</p>
            <input
              type="password"
              name="password"
              className="inputText"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <label className="textField">
            <p className="label">Confirmer le mot passe:</p>
            <input
              type="password"
              name="password"
              className="inputText"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <input
            type="submit"
            value="Réinitialiser"
            className="primaryButton"
          />
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
