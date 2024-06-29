import React, { useState, useEffect, useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlagCheckered } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Card from "../components/party/Card";
import Racetrack from "../components/party/Racetrack";
import PlayerChat from "../components/party/PlayerChat";
import ListPlayer from "../components/party/ListPlayer";
import { SocketIOContext } from "../components/App";
import { useSnackbar } from "notistack";
// Données des cartes
const cardsData = [
  {
    id: 1,
    type: "Roger",
    img: "/media/roger.png",
    logo: "/media/logo.png",
    color: "#B10E1D",
  },
  {
    id: 2,
    type: "Gerard",
    img: "/media/gerard.png",
    logo: "/media/logo.png",
    color: "#209BE0",
  },
  {
    id: 3,
    type: "Jean-Jacques",
    img: "/media/jean-jacques.png",
    logo: "/media/logo.png",
    color: "green",
  },
  {
    id: 4,
    type: "Marcel",
    img: "/media/marcel.png",
    logo: "/media/logo.png",
    color: "#9747FF",
  },
];

const idRound = sessionStorage.getItem("idRound");
const token = sessionStorage.getItem("token");
const lengthRun = Number(sessionStorage.getItem("duration"));
const isAdmin = Number(sessionStorage.getItem("id"));
const isMulti = JSON.parse(sessionStorage.getItem("isMulti"));

function Party() {
  const [numberPlayer, setNumberPlayer] = useState(0);
  const [effectifPlayer, setEffectifPlayer] = useState(0);
  const [bets, setBets] = useState([]);
  const [positionHorse, setPositionHorse] = useState([]);
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [inconvenientCard, setInconvenientCard] = useState([]);
  const [finishParty, setFinishParty] = useState(false);
  const [showFadeIn, setShowFadeIn] = useState(false);
  const [stateInconvenient, setStateInconvenient] = useState(false);
  const socket = useContext(SocketIOContext);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 1120px)" });
  const [activeTab, setActiveTab] = useState("jeu");
  const { enqueueSnackbar } = useSnackbar();
  const [roomId, setRoomId] = useState(null);
  const beerRef = useRef(null);
  const winnerRef = useRef(null);
  useEffect(() => {
    const id = sessionStorage.getItem("id");
    const token = sessionStorage.getItem("token");
    if (!token || !id) {
      navigate("/");
      return;
    }
  }, [navigate]);

  const fetchData = async () => {
    if (isMulti) {
      //RoomId
      const roomIdFetch = await fetch(
        `${process.env.REACT_APP_PMU_API_URL}/api/round/${idRound}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const resultRoomId = await roomIdFetch.json();
      if (resultRoomId.errorCode && resultRoomId.errorCode === 5020) {
        return enqueueSnackbar("La manche n'a pas pu être récupéré", {
          variant: "error",
        });
      }
      const idRoom = resultRoomId.roomId;
      setRoomId(idRoom);

      //Nombre de joueurs max
      const numberPlayer = await fetch(
        `${process.env.REACT_APP_PMU_API_URL}/api/room/${idRoom}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const players = await numberPlayer.json();
      if (players.errorCode && players.errorCode === 2070) {
        return enqueueSnackbar("La partie n'a pas pu être récupéré...", {
          variant: "error",
        });
      }
      setNumberPlayer(players.maxNbPlayers);

      //Nombre de joueur dans la partie
      const effectifPlayer = await fetch(
        `${process.env.REACT_APP_PMU_API_URL}/api/room/players/${idRoom}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const playerEffectif = await effectifPlayer.json();
      if (playerEffectif.errorCode) {
        switch (playerEffectif.errorCode) {
          case 2020:
            console.log("Les joueurs n'ont pas pu être récupéré...");
            break;
          case 2025:
            enqueueSnackbar("La partie n'existe pas...", {
              variant: "error",
            });
            break;
          case 2024:
            console.log("Problème serveur...");
            break;
          default:
            enqueueSnackbar("Une erreur inconnue est survenue", {
              variant: "error",
            });
        }
        return;
      }
      setEffectifPlayer(playerEffectif.users.length + 1);

      //Paris de la manche
      const betsArray = await fetch(
        `${process.env.REACT_APP_PMU_API_URL}/api/round/bet/${idRound}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const betsResponse = await betsArray.json();
      if (betsResponse.errorCode) {
        switch (betsResponse.errorCode) {
          case 5032:
            console.log("probleme d'id...");
            break;
          case 5031:
            enqueueSnackbar("La manche n'existe pas...", {
              variant: "error",
            });
            break;
          case 5030:
            console.log("Problème serveur...");
            break;
          default:
            enqueueSnackbar("Une erreur inconnue est survenue", {
              variant: "error",
            });
        }
        return;
      }
      const arrayBet = [];
      betsResponse.bets.map((bet) => {
        arrayBet.push({
          pseudo: bet.pseudo,
          bet: bet.sips_number,
          horse: cardsData.find((horse) => horse.id === bet.horse_id).type,
        });
      });
      setBets(arrayBet);
    } else {
      setNumberPlayer(Number(sessionStorage.getItem("numberPlayer")));
      setEffectifPlayer(Number(sessionStorage.getItem("effectifPlayer") + 1));
      setBets(JSON.parse(sessionStorage.getItem("bets")));
      setRoomId(sessionStorage.getItem("roomId"));
    }
  };

  // Création du paquet de 52 cartes
  const createDeck = () => {
    let deck = [];
    for (let i = 0; i < 13; i++) {
      // Dupliquer chaque type de carte 13 fois
      cardsData.forEach((card) => {
        deck.push({
          id: `${card.type}_${i + 1}`, // Identifier unique
          type: card.type,
          img: card.img,
          logo: card.logo,
        });
      });
    }
    return deck;
  };

  // Mélange aléatoire du paquet de cartes
  const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  useEffect(() => {
    fetchData();
    // Il met à jour le paquet de cartes dans le composant parent
    const initialDeck = shuffleDeck(createDeck()).slice(lengthRun - 2);
    const initialInconvenient = initialDeck
      .slice(0, lengthRun - 2)
      .map((card) => ({
        ...card,
        use: false,
      }));
    // Cet effet s'exécute une seule fois après le premier rendu
    const fetchCurrentGame = async () => {
      const currentGame = await fetch(
        `${process.env.REACT_APP_PMU_API_URL}/api/currentGames/${idRound}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roundId: parseInt(idRound),
            deck: initialDeck,
            discard: [],
            inconvenientCard: initialInconvenient,
            positionHorse: [
              { type: "Roger", position: 0 },
              { type: "Marcel", position: 0 },
              { type: "Jean-Jacques", position: 0 },
              { type: "Gerard", position: 0 },
            ],
          }),
        }
      );
      const response = await currentGame.json();
      if (response.errorCode) {
        switch (response.errorCode) {
          case 6000:
            console.log("probleme d'id...");
            break;
          case 6002:
            enqueueSnackbar("La manche n'existe pas ou est déjà terminée...", {
              variant: "error",
            });
            break;
          case 6001:
            console.log("Problème serveur...");
            break;
          default:
            enqueueSnackbar("Une erreur inconnue est survenue", {
              variant: "error",
            });
        }
        return;
      }
      if (response) {
        const getCurrentGame = async () => {
          const currentGame = await fetch(
            `${process.env.REACT_APP_PMU_API_URL}/api/currentGames/${idRound}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const responseCurrent = await currentGame.json();
          if (responseCurrent.errorCode) {
            switch (responseCurrent.errorCode) {
              case 6030:
                console.log("probleme d'id...");
                break;
              case 6032:
                enqueueSnackbar("Il n'y a pas de donnée pour cette manche...", {
                  variant: "error",
                });
                break;
              case 6031:
                console.log("Problème serveur...");
                break;
              default:
                enqueueSnackbar("Une erreur inconnue est survenue", {
                  variant: "error",
                });
            }
            return;
          }
          setPositionHorse(responseCurrent.positionHorse);
          setDeck(responseCurrent.deck);
          setDiscard(responseCurrent.discard);
          setInconvenientCard(responseCurrent.inconvenientCard);
        };
        getCurrentGame();
      }
    };
    fetchCurrentGame();
  }, []);

  const modifyCurrentGame = async (
    newDeck,
    newDiscard,
    updatedInconvenientCard
  ) => {
    const modifyCurrent = await fetch(
      `${process.env.REACT_APP_PMU_API_URL}/api/currentGames/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundId: parseInt(idRound),
          deck: newDeck,
          discard: newDiscard,
          inconvenientCard: updatedInconvenientCard,
          positionHorse: positionHorse,
        }),
      }
    );
    const responseCurrent = await modifyCurrent.json();
    if (responseCurrent.errorCode) {
      switch (responseCurrent.errorCode) {
        case 6012:
          enqueueSnackbar("Il n'y a pas de donnée pour cette manche...", {
            variant: "error",
          });
          break;
        case 6011:
          console.log("Problème serveur...");
          break;
        default:
          enqueueSnackbar("Une erreur inconnue est survenue", {
            variant: "error",
          });
      }
      return;
    }
    // Faites quelque chose avec les données récupérées si nécessaire
  };

  const deleteCurrentGame = async () => {
    const deleteCurrent = await fetch(
      `${process.env.REACT_APP_PMU_API_URL}/api/currentGames/${idRound}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const responseCurrent = await deleteCurrent.json();
    if (responseCurrent.errorCode) {
      switch (responseCurrent.errorCode) {
        case 6020:
          console.log("probleme d'id...");
          break;
        case 6022:
          enqueueSnackbar("Il n'y a pas de donnée pour cette manche...", {
            variant: "error",
          });
          break;
        case 6021:
          console.log("Problème serveur...");
          break;
        default:
          enqueueSnackbar("Une erreur inconnue est survenue", {
            variant: "error",
          });
      }
      return;
    }
  };

  const handleResultClick = () => {
    deleteCurrentGame();
    socket.emit("navigate", { roomId, data: "/results" });
    navigate("/results");
  };

  useEffect(() => {
    if (finishParty) {
      beerRef.current.play();
    }
    const timeout = setTimeout(() => {
      if (finishParty) {
        winnerRef.current.play();
      }
      setShowFadeIn(finishParty);
    }, 3500); // Délai correspondant à la durée de la transition de l'overlay
    return () => clearTimeout(timeout);
  }, [finishParty]);

  useEffect(() => {
    if (socket) {
      socket.on("navigate", (data) => {
        navigate(data);
      });
      return () => {
        socket.off("navigate");
      };
    }
  }, [socket, navigate]);

  const [winnerHorse, setWinnerHorse] = useState("");

  useEffect(() => {
    if (positionHorse.length !== 0) {
      const highestPositionHorse = positionHorse.reduce((acc, curr) => {
        return acc.position > curr.position ? acc : curr;
      });
      if (highestPositionHorse.position === lengthRun - 1) {
        setWinnerHorse(
          cardsData.find((card) => card.type === highestPositionHorse.type)
        );
        sessionStorage.setItem("winner", highestPositionHorse.type);
      }
    }
  }, [positionHorse]);

  return (
    <div className="party">
      {isSmallScreen ? (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === "jeu" ? "active" : ""}`}
              onClick={() => setActiveTab("jeu")}
            >
              JEU
            </button>
            <button
              className={`tab ${activeTab === "paris" ? "active" : ""}`}
              onClick={() => setActiveTab("paris")}
            >
              PARIS
            </button>
          </div>
          <div className="tab-content">
            {activeTab === "jeu" ? (
              <>
                <Racetrack
                  roomId={roomId}
                  lengthRun={lengthRun}
                  cardsData={cardsData}
                  inconvenientCard={inconvenientCard}
                  setInconvenientCard={setInconvenientCard}
                  deck={deck}
                  discard={discard}
                  setStateInconvenient={setStateInconvenient}
                  positionHorse={positionHorse}
                  setPositionHorse={setPositionHorse}
                  modifyCurrentGame={(
                    newDeck,
                    newDiscard,
                    updatedInconvenientCard
                  ) =>
                    modifyCurrentGame(
                      newDeck,
                      newDiscard,
                      updatedInconvenientCard
                    )
                  }
                  finishParty={finishParty}
                  FontAwesomeIcon={FontAwesomeIcon}
                  faFlagCheckered={faFlagCheckered}
                  socket={socket}
                  isAdmin={isAdmin}
                />
                <Card
                  roomId={roomId}
                  cardsData={cardsData}
                  FontAwesomeIcon={FontAwesomeIcon}
                  faFlagCheckered={faFlagCheckered}
                  useState={useState}
                  useEffect={useEffect}
                  deck={deck}
                  setDeck={setDeck}
                  discard={discard}
                  stateInconvenient={stateInconvenient}
                  setDiscard={setDiscard}
                  positionHorse={positionHorse}
                  setPositionHorse={setPositionHorse}
                  inconvenientCard={inconvenientCard}
                  modifyCurrentGame={(
                    newDeck,
                    newDiscard,
                    updatedInconvenientCard
                  ) =>
                    modifyCurrentGame(
                      newDeck,
                      newDiscard,
                      updatedInconvenientCard
                    )
                  }
                  lengthRun={lengthRun}
                  finishParty={finishParty}
                  setFinishParty={setFinishParty}
                  socket={socket}
                  isAdmin={isAdmin}
                  isMulti={isMulti}
                />
              </>
            ) : (
              <ListPlayer
                effectifPlayer={effectifPlayer}
                numberPlayer={numberPlayer}
                bets={bets}
                cardsData={cardsData}
              />
            )}
          </div>
          <div
            className={`finish-overlay ${finishParty ? "show" : ""}`}
            onClick={finishParty && isAdmin ? handleResultClick : null}
            style={
              finishParty && isAdmin
                ? { cursor: "pointer", backgroundImage: "url(/media/beer.png)" }
                : { backgroundImage: "url(/media/beer.png)" }
            }
          ></div>
          <div
            className={`fade-in ${showFadeIn ? "show" : ""}`}
            onClick={finishParty && isAdmin ? handleResultClick : null}
            style={finishParty && isAdmin ? { cursor: "pointer" } : null}
          >
            <img src={winnerHorse.img} alt="winner" />
            <p>Le grand gagnant est {winnerHorse.type} !!</p>
          </div>
        </>
      ) : (
        <>
          <Card
            roomId={roomId}
            cardsData={cardsData}
            FontAwesomeIcon={FontAwesomeIcon}
            faFlagCheckered={faFlagCheckered}
            useState={useState}
            useEffect={useEffect}
            deck={deck}
            setDeck={setDeck}
            discard={discard}
            stateInconvenient={stateInconvenient}
            setDiscard={setDiscard}
            positionHorse={positionHorse}
            setPositionHorse={setPositionHorse}
            inconvenientCard={inconvenientCard}
            modifyCurrentGame={(newDeck, newDiscard, updatedInconvenientCard) =>
              modifyCurrentGame(newDeck, newDiscard, updatedInconvenientCard)
            }
            lengthRun={lengthRun}
            finishParty={finishParty}
            setFinishParty={setFinishParty}
            socket={socket}
            isAdmin={isAdmin}
            isMulti={isMulti}
          />
          <Racetrack
            roomId={roomId}
            lengthRun={lengthRun}
            cardsData={cardsData}
            inconvenientCard={inconvenientCard}
            setInconvenientCard={setInconvenientCard}
            deck={deck}
            discard={discard}
            setStateInconvenient={setStateInconvenient}
            positionHorse={positionHorse}
            setPositionHorse={setPositionHorse}
            modifyCurrentGame={(newDeck, newDiscard, updatedInconvenientCard) =>
              modifyCurrentGame(newDeck, newDiscard, updatedInconvenientCard)
            }
            finishParty={finishParty}
            FontAwesomeIcon={FontAwesomeIcon}
            faFlagCheckered={faFlagCheckered}
            socket={socket}
            isAdmin={isAdmin}
          />
          <PlayerChat
            effectifPlayer={effectifPlayer}
            numberPlayer={numberPlayer}
            bets={bets}
            cardsData={cardsData}
            socket={socket}
            isMulti={isMulti}
          />
          <div
            className={`finish-overlay ${finishParty ? "show" : ""}`}
            onClick={finishParty && isAdmin ? handleResultClick : null}
            style={finishParty && isAdmin ? { cursor: "pointer" } : null}
          >
            <img src="/media/beer.png" alt="Finish" />
          </div>
          <div
            className={`fade-in ${showFadeIn ? "show" : ""}`}
            onClick={finishParty && isAdmin ? handleResultClick : null}
            style={finishParty && isAdmin ? { cursor: "pointer" } : null}
          >
            <img src={winnerHorse.img} alt="winner" />
            <p>Le grand gagnant est {winnerHorse.type} !!</p>
          </div>
        </>
      )}
      <audio ref={beerRef} src="/media/beer.mp3" />
      <audio ref={winnerRef} src="/media/horse.mp3" />
    </div>
  );
}

export default Party;
