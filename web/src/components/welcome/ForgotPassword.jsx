import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

function ForgotPassword({ showPopup, closePopup }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/mailSender`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: email }),
    });
    const data = await response.json();

    if (data.errorCode) {
      switch (data.errorCode) {
        case 7000:
          enqueueSnackbar(
            "Une erreur est survenue lors de l'envoi de l'email",
            {
              variant: "error",
            }
          );
          break;
        case 7001:
          enqueueSnackbar("Adresse mail invalide", {
            variant: "error",
          });
          break;
        case 7002:
          enqueueSnackbar("Aucun compte n'existe avec cet email", {
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
      enqueueSnackbar(
        "Un email pour réinitialiser votre mot de passe a été envoyé",
        {
          variant: "success",
        }
      );
      navigate("/");
    }
  };

  return (
    <div className={`modal${showPopup ? "" : " hidden"}`}>
      {showPopup && (
        <>
          <div className="forgotpassword">
            <button className="close-btn" onClick={closePopup}>
              X
            </button>
            <h2>REINITIALISER LE MOT DE PASSE</h2>
            <form onSubmit={handleSubmit}>
              <label className="textField">
                <p className="label">Adresse mail:</p>
                <input
                  type="email"
                  name="email"
                  className="inputText"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <input
                type="submit"
                value="Réinitialiser"
                className="primaryButton"
              />
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default ForgotPassword;
