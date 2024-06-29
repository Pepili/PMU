import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";

function CreationParty() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showFormOnline, setShowFormOnline] = useState(true);
  const [showFormLocal, setShowFormLocal] = useState(false);
  const [duration, setDuration] = useState();

  const token = sessionStorage.getItem("token");
  const idUser = Number(sessionStorage.getItem("id"));
  const pseudo = sessionStorage.getItem("pseudo");

  const handleSubmitOnline = (event) => {
    event.preventDefault();
    // Traitez les données du formulaire ici
    sessionStorage.setItem("isMulti", true);

    //navigate("/room");
  };

  const fetchCreateLocal = async (duration) => {
    const createRoom = await fetch(
      `${process.env.REACT_APP_PMU_API_URL}/api/room`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxNbPlayers: 1,
          userIds: [],
          adminId: idUser,
        }),
      }
    );
    const response = await createRoom.json();
    if (response.errorCode) {
      switch (response.errorCode) {
        case 2003:
          console.log("Problème serveur...");
          break;
        case 2005:
          console.log("Can't get the room object");
          break;
        case 2022:
          console.log("id must be a number");
          break;
        default:
          enqueueSnackbar("Une erreur inconnue est survenue", {
            variant: "error",
          });
      }
      return;
    }
    sessionStorage.setItem("roomId", Number(1));
    const createRound = await fetch(
      `${process.env.REACT_APP_PMU_API_URL}/api/round`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: duration,
          roomId: response.roomId,
        }),
      }
    );
    const responseRound = await createRound.json();
    if (response.errorCode) {
      switch (response.errorCode) {
        case 2003:
          console.log("Problème serveur...");
          break;
        case 2005:
          console.log("Can't get the room object");
          break;
        case 2022:
          console.log("id must be a number");
          break;
        default:
          enqueueSnackbar("Une erreur inconnue est survenue", {
            variant: "error",
          });
      }
      return;
    }
    sessionStorage.setItem("idRound", Number(responseRound.roundId));
  };

  const handleSubmitLocal = (event) => {
    event.preventDefault();
    // Traitez les données du formulaire ici
    let count = 0;
    infos.map((item) => {
      if (item.bet && item.bet > 0) {
        count += 1;
      }
    });
    fetchCreateLocal(Number(duration));

    sessionStorage.setItem("isMulti", false);
    sessionStorage.setItem("numberPlayer", infos.length);
    sessionStorage.setItem("effectifPLayer", count);
    sessionStorage.setItem("bets", JSON.stringify(infos));
    sessionStorage.setItem("duration", duration);
    navigate("/party");
  };

  const [rangeval, setRangeval] = useState(2);

  const [number, setNumber] = useState(2);

  const [infos, setInfos] = useState([
    { pseudo: pseudo, bet: 0, horse: "" },
    { pseudo: "", bet: 0, horse: "" },
  ]);

  const [FormData, setFormData] = useState({
    users: [],
  });

  const handleAddPseudo = (e, index) => {
    const copyInfos = [...infos];
    copyInfos[index]["pseudo"] = e.target.value;
    setInfos(copyInfos);
  };

  const handleAddInfos = (e, index) => {
    const copyInfos = [...infos];
    copyInfos[index]["bet"] = e.target.value;
    setInfos(copyInfos);
  };

  const handleAddHorse = (e, index) => {
    const copyInfos = [...infos];
    copyInfos[index]["horse"] = e.target.value;
    setInfos(copyInfos);
  };
  const handleUserChange = (e, index) => {
    const updatedUsers = [...FormData.users];
    updatedUsers[index][e.target.name] = e.target.value;
    setFormData({ ...FormData, users: updatedUsers });
  };

  const handlePlus = () => {
    const maxPlayer = 12;
    if (FormData.users.length < maxPlayer - 2) {
      const newPlayer = { pseudo: "" };
      setFormData({ ...FormData, users: [...FormData.users, newPlayer] });
      setNumber((prevState) => {
        if (prevState < maxPlayer) {
          return prevState + 1;
        } else {
          return prevState;
        }
      });
      setInfos((prevState) => [
        ...prevState,
        { pseudo: "", bet: 0, horse: "" },
      ]);
    } else {
      alert(`Vous ne pouvez pas ajouter plus de ${maxPlayer} joueurs.`);
    }
  };
  const handleMoins = (index) => {
    if (FormData.users.length > 0) {
      const updatedUsers = [...FormData.users];
      updatedUsers.pop(index, 1);

      const updatedinfos = [...infos];
      updatedinfos.pop(index, 1);

      setFormData({ ...FormData, users: updatedUsers });
      setInfos(updatedinfos);

      setNumber((prevState) => {
        if (prevState > 2) {
          return prevState - 1;
        } else {
          return prevState;
        }
      });
    } else {
      alert("Il doit y avoir au moins deux joueurs.");
    }
  };

  return (
    <div className="accordeon">
      <button
        className="btn-crea"
        onClick={() => setShowFormOnline(true) & setShowFormLocal(false)}
      >
        Mode en ligne
      </button>

      {showFormOnline && (
        <form className="form" onSubmit={handleSubmitOnline}>
          <label>
            <p>Difficultés:</p>
            <select>
              <option value="7">Shot (7)</option>
              <option value="9">Pinte (9)</option>
              <option value="10">Girafe (10)</option>
            </select>
          </label>
          <label>
            <p>Nombre de joueur:</p>
            <div className="range">
              <p>{rangeval}</p>
              <input
                type="range"
                className="range-input"
                min="2"
                max="12"
                value={rangeval}
                onChange={(event) => setRangeval(event.target.value)}
              />
            </div>
          </label>
          <button type="submit">Créer</button>
        </form>
      )}

      <button
        className="btn-crea"
        onClick={() => setShowFormLocal(true) & setShowFormOnline(false)}
      >
        Mode local
      </button>

      {showFormLocal && (
        <form className="form" onSubmit={(event) => handleSubmitLocal(event)}>
          <label>
            <p>Difficultés:</p>
            <select onChange={(e) => setDuration(e.target.value)}>
              <option value="">Choisissez</option>
              <option value="7">Shot (7)</option>
              <option value="9">Pinte (9)</option>
              <option value="10">Girafe (10)</option>
            </select>
          </label>
          <label>
            <p>Ajouter un joueur:</p>
            <div className="btn-nb-joueur">
              <button className="remove" type="button">
                <FontAwesomeIcon icon={faMinus} onClick={handleMoins} />
              </button>
              <div className="number">{number}</div>
              <button className="add" type="button">
                <FontAwesomeIcon icon={faPlus} onClick={handlePlus} />
              </button>
            </div>
            <div className="result-mode-local">
              <div className="nom">
                <p>Pseudo</p>
                <p>Parie</p>
                <p>Cheval</p>
              </div>
              {infos.map((item, index) => (
                <div className="param" key={index}>
                  <input
                    type="text"
                    name="pseudo"
                    className="pseudo"
                    onChange={(e) => handleAddPseudo(e, index)}
                    value={
                      index === 0
                        ? sessionStorage.getItem("pseudo") + " (admin)"
                        : item.pseudo
                    }
                    disabled={index === 0}
                    style={index === 0 ? { color: "white" } : {}}
                  ></input>
                  <input
                    className="parie"
                    type="number"
                    min="1"
                    onChange={(e) => handleAddInfos(e, index)}
                  ></input>
                  <select onChange={(e) => handleAddHorse(e, index)}>
                    <option value="">Choisissez</option>
                    <option value="Roger">Roger</option>
                    <option value="Marcel">Marcel</option>
                    <option value="Gerard">Gérard</option>
                    <option value="Jean-Jacques">Jean-Jacques</option>
                  </select>
                </div>
              ))}
            </div>
          </label>
          <button type="submit">Lancer la partie</button>
        </form>
      )}
    </div>
  );
}

export default CreationParty;
