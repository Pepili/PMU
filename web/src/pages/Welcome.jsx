import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/welcome/Login";
import Signup from "../components/welcome/Signup";
import ForgotPassword from "../components/welcome/ForgotPassword";

function Welcome({ onLogin }) {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem("id");
    const token = sessionStorage.getItem("token");

    if (id && token) {
      navigate("/menu");
    }
  }, [navigate]);

  const toggleForgotPasswordModal = () => {
    setShowForgotPasswordModal(!showForgotPasswordModal);
  };

  return (
    <div className="welcome">
      {showLogin ? (
        <Login onLogin={onLogin} />
      ) : (
        <Signup setShowLogin={setShowLogin} />
      )}
      <div className="btnContainer">
        <button
          className="secondaryButton"
          onClick={() => setShowLogin(!showLogin)}
        >
          {showLogin ? "S'inscrire" : "Se connecter"}
        </button>
        {showLogin && (
          <button onClick={toggleForgotPasswordModal} className="linkButton">
            Mot de passe oublié ? Par ici
          </button>
        )}
      </div>
      {showForgotPasswordModal && (
        <ForgotPassword
          showPopup={showForgotPasswordModal}
          closePopup={() => setShowForgotPasswordModal(false)}
        />
      )}
    </div>
  );
}

export default Welcome;
