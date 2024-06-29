import React, { useEffect } from "react";

export default function Card({
  FontAwesomeIcon,
  socket,
  isAdmin,
  faFlagCheckered,
  stateInconvenient,
  useState,
  deck,
  setDeck,
  discard,
  setDiscard,
  positionHorse,
  setPositionHorse,
  modifyCurrentGame,
  lengthRun,
  finishParty,
  setFinishParty,
  inconvenientCard,
  roomId,
  isMulti,
}) {
  const [showPopup, setShowPopup] = useState(false); // État pour contrôler l'affichage de la popup

  useEffect(() => {
    if (socket) {
      // Gestionnaire d'événement pour deckChange
      socket.on("deckChange", (updatedDeck) => {
        // Mettre à jour l'état local avec le nouveau deck
        setDeck(updatedDeck);
      });

      socket.on("showPopup", (show) => {
        setShowPopup(show);
      });

      // Gestionnaire d'événement pour discardChange
      socket.on("discardChange", (updatedDiscard) => {
        // Mettre à jour l'état local avec le nouveau discard
        setDiscard(updatedDiscard);
      });

      socket.on("mettreAJourPosition", (updatedPosition) => {
        // Mettre à jour l'état local avec la nouvelle position du pion
        setPositionHorse(updatedPosition);
      });

      socket.on("finishParty", (updatedFinishParty) => {
        // Mettre à jour l'état local avec la nouvelle position du pion
        setFinishParty(updatedFinishParty);
      });
      // Fonction de nettoyage pour détacher les gestionnaires d'événements
      return () => {
        socket.off("deckChange");
        socket.off("discardChange");
        socket.off("showPopup");
        socket.off("mettreAJourPosition");
        socket.off("finishParty");
      };
    }
  }, [socket]);

  const handleCardClick = () => {
    if (finishParty === false) {
      if (deck.length > 0) {
        const horseIndex = positionHorse.findIndex(
          (el) => el.type === deck[0].type
        );
        if (horseIndex !== -1) {
          const updatedPositionHorse = [...positionHorse];
          updatedPositionHorse[horseIndex].position += 1;
          setPositionHorse(updatedPositionHorse);
          socket.emit("mettreAJourPositionPion", {
            isMulti,
            roomId,
            data: updatedPositionHorse,
          });
        }
        const newDeck = deck.slice(1); // Créer une copie de `deck` sans le premier élément
        const newDiscard = [deck[0], ...discard];
        setDiscard(newDiscard);
        setDeck(newDeck); // Mettre à jour `deck` avec la nouvelle valeur
        modifyCurrentGame(newDeck, newDiscard, inconvenientCard); // Passer la nouvelle valeur de `deck` à `modifyCurrentGame`

        socket.emit("deckChange", { roomId, data: newDeck });
        socket.emit("discardChange", { roomId, data: newDiscard });
        socket.emit("showPopup", { roomId, data: true });
      }
      setShowPopup(true); // Afficher la popup lors du clic sur une carte

      for (let i = 0; i < positionHorse.length; i++) {
        if (positionHorse[i].position === lengthRun - 1) {
          setFinishParty(true);
          socket.emit("finishParty", { roomId, data: true });
        }
      }
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    // Émettre un événement au serveur pour masquer la popup
    socket.emit("showPopup", { roomId, data: false });
  };

  if (!roomId) {
    return <></>;
  }

  return (
    <>
      <div className="cards">
        {deck.length > 0 && (
          <div
            className="card"
            onClick={!stateInconvenient && isAdmin ? handleCardClick : null}
            style={
              !stateInconvenient && isAdmin
                ? { cursor: "pointer" }
                : { cursor: "auto" }
            }
          >
            <div className="drawCard">
              <img src={deck[0].logo} alt="Logo" className="logo" />
            </div>
          </div>
        )}
        <div className="discard">
          {discard.length > 0 && (
            <div className="card" style={{ cursor: "auto" }}>
              <div className="discardCard">
                <img src={discard[0].img} alt="Card" className="img-bottom" />
                <p className="type">{discard[0].type}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPopup &&
        finishParty === false && ( // Affichage conditionnel de la popup
          <div
            className="popup"
            style={isAdmin ? { cursor: "pointer" } : { cursor: "auto" }}
            onClick={isAdmin ? handlePopupClose : null}
          >
            <div
              className="popupContent"
              onClick={isAdmin ? handlePopupClose : null}
              style={isAdmin ? { cursor: "pointer" } : { cursor: "auto" }}
            >
              <img src={discard.length > 0 ? discard[0].img : ""} alt="Card" />
              <p>
                <FontAwesomeIcon
                  icon={faFlagCheckered}
                  style={{ fontSize: "20px" }}
                />{" "}
                {discard.length > 0 ? discard[0].type : ""} titube jusqu'au
                prochain palier{" "}
                <FontAwesomeIcon
                  icon={faFlagCheckered}
                  style={{ fontSize: "20px" }}
                />
              </p>
            </div>
          </div>
        )}
    </>
  );
}
