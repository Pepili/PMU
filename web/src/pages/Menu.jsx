import React from "react";
import { useNavigate } from "react-router-dom";

function Menu() {
  const navigate = useNavigate();
  const handleJoin = () => {
    navigate("/join"); // Redirection vers la page '/joinParty'
  };
  const handleCreate = () => {
    navigate("/creation"); // Redirection vers la page '/joinParty'
  };

  return (
    <section className="menu">
      <div className="row">
        <button className="btn-menu" onClick={handleCreate}>
          Créer une partie
        </button>
        <button className="btn-menu" onClick={handleJoin}>
          Rejoindre une parie
        </button>
      </div>
    </section>
  );
}

export default Menu;
