import React from 'react';

function Room() {
    /* ------ Données obligatoires ------- */
    sessionStorage.setItem('idRound', 5);
    sessionStorage.setItem("duration", 10);
    sessionStorage.getItem("id");
    if(sessionStorage.getItem("id") == 8) {
        sessionStorage.setItem("isAdmin", true);
    } else {
        sessionStorage.setItem("isAdmin", false);
    }
    sessionStorage.setItem("isMulti", true);

    /* ----------- Données si partie local ---------- */
    if(!JSON.parse(sessionStorage.getItem("isMulti"))) {
        sessionStorage.setItem('numberPlayer', 6);
        sessionStorage.setItem("effectifPlayer", 5);
        sessionStorage.setItem("bets", JSON.stringify([{pseudo: "john", bet:3, horse:'Gerard'}, {pseudo: "Laura", bet:4, horse:'Roger'}]));
    }
    return (
        <h1>Room</h1>
    );
}

export default Room;