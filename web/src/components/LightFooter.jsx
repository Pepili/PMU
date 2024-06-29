import React from "react";
import {useMediaQuery} from 'react-responsive';

function LightFooter() {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 1120px)' });

  return (
    <footer className="footerLight">
      {isSmallScreen ? (
        <div className="divFooterLight">
          <p>Auteurs: Lisa, Hugo, Eve-Anne</p>
        </div>
      ):(
      <div className="divFooterLight">
        <p>Auteurs: Lisa, Hugo, Eve-Anne</p>
        <p>Catégories associées: Card Game, Drinking game, Party game</p>
      </div>
    )}
    </footer>
  );
}

export default LightFooter;