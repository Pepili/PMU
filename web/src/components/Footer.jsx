import React from "react";
import { useNavigate } from "react-router-dom";
import {useMediaQuery} from 'react-responsive';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function Footer({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery({ query: '(max-width: 1120px)' });

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <footer className="footer">
      {isSmallScreen ? (
        <div className="divFooter">
          {isLoggedIn && (
            <button className="negativeButton" onClick={handleLogout}>
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="iconExit"/>
            </button>
          )}
        </div>
      ):(
      <div className="divFooter">
        <p>Auteurs: Lisa, Hugo, Eve-Anne</p>
        <p>Catégories associées: Card Game, Drinking game, Party game</p>
        {isLoggedIn && (
          <button className="negativeButton" onClick={handleLogout}>
            Déconnexion
          </button>
        )}
      </div>
    )}
    </footer>
  );
}

export default Footer;
