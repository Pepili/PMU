import React, { useState, useEffect, useContext } from 'react';
import Chat from "../components/Chat";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { SocketIOContext } from '../components/App';
import {useMediaQuery} from 'react-responsive';
import { useSnackbar } from "notistack";
// Données des cartes
const cardsData = [
    { id: 1, type: 'Roger', img: '/media/roger.png', logo: '/media/logo.png', color:'#B10E1D' },
    { id: 2, type: 'Gerard', img: '/media/gerard.png', logo: '/media/logo.png', color:'#209BE0' },
    { id: 3, type: 'Jean-Jacques', img: '/media/jean-jacques.png', logo: '/media/logo.png', color:'green' },
    { id: 4, type: 'Marcel', img: '/media/marcel.png', logo: '/media/logo.png', color:'#9747FF'}
];

function Results() {
    const [numberPlayer, setNumberPlayer] = useState(0);
    const [effectifPlayer, setEffectifPlayer] = useState(0);
    const [idRoom, setIdRoom] = useState(0);
    const [bets, setBets] = useState([]);
    const [listPlayers, setListPlayers] = useState([]);
    const socket = useContext(SocketIOContext);
    const isSmallScreen = useMediaQuery({ query: '(max-width: 1120px)' });
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const idRound = sessionStorage.getItem("idRound");
    const token = sessionStorage.getItem('token');
    const winner = sessionStorage.getItem('winner');
    const idUser = sessionStorage.getItem('id');
    const isAdmin = sessionStorage.getItem("isAdmin");
    const isMulti = sessionStorage.getItem("isMulti");
    useEffect(() => {
        const id = sessionStorage.getItem("id");
        const token = sessionStorage.getItem("token");
        if (!token || !id) {
          navigate("/");
          return;
        }
    }, [navigate]);

    const fetchData = async () => {
        //room id
        const lengthParty = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/round/${idRound}`,{
        headers: {
            'Authorization': `Bearer ${token}`
            }
        }
        );
        const length = await lengthParty.json();
        if(length.errorCode && length.errorCode === 5020) {
            return enqueueSnackbar('La manche n\'a pas pu être récupéré', {
              variant: "error",
          });
          }
        const roomId = length.roomId;
        setIdRoom(roomId);

        //Nombre de joueurs max
        const numberPlayer = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/room/${roomId}`,{
            headers: {
                'Authorization': `Bearer ${token}`
                }
            }
        );
        const players = await numberPlayer.json();
        if(players.errorCode && players.errorCode === 2070) {
            return enqueueSnackbar('La partie n\'a pas pu être récupéré...', {
              variant: "error",
          });
          }
        setNumberPlayer(players.maxNbPlayers);
        
        //Nombre de joueur dans la partie
        const effectifPlayer = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/room/players/${roomId}`,{
            headers: {
                'Authorization': `Bearer ${token}`
                }
            }
        );
        const playerEffectif = await effectifPlayer.json();
        const arrayPlayers = [];
        if(playerEffectif.errorCode) {
            switch (playerEffectif.errorCode) {
                case 2020:
                    navigate('/menu');
                    sessionStorage.removeItem('idRound');
                    break;
                case 2025:
                    enqueueSnackbar("La partie n'existe pas...", {
                    variant: "error",
                    });
                    break;
                case 2024:
                  console.log('Problème serveur...');
                  break;
                default:
                    enqueueSnackbar("Une erreur inconnue est survenue", {
                    variant: "error",
                    });
                };
            return;
            };
        arrayPlayers.push(playerEffectif.admin.pseudo);
        playerEffectif.users.map((user) => {
            arrayPlayers.push(user.pseudo);
        });
        setListPlayers(arrayPlayers);
        setEffectifPlayer(arrayPlayers.length);
        
        //Paris de la manche
        const betsArray = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/round/bet/${idRound}`,{
            headers: {
                'Authorization': `Bearer ${token}`
                }
            }
        );
        const betsResponse = await betsArray.json();
        if(betsResponse.errorCode) {
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
                  console.log('Problème serveur...');
                  break;
                default:
                    enqueueSnackbar("Une erreur inconnue est survenue", {
                    variant: "error",
                    });
                };
            return;
        };
        const arrayBet = [];
        betsResponse.bets.map((bet) => {
            arrayBet.push({
            pseudo: bet.pseudo,
            bet: bet.sips_number,
            horse: cardsData.find(horse => horse.id === bet.horse_id).type,
            user_id: bet.user_id
            })
        })
        setBets(arrayBet);
    }

    useEffect(() => { 
        fetchData();    
      }, []);
    
    const handleRelance = () => {
        if(idRoom) {
            sessionStorage.removeItem('idRound');
            navigate(`/room/${idRoom}`);
            socket.emit('playerRelance', {roomId: idRoom});
        }
    };
    const fetchDeleteAdmin = async () => {
        const disableRoom = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/room/disable/${idRoom}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
          });
          const responseDisable = await disableRoom.json();
          if(responseDisable.errorCode) {
            switch (responseDisable.errorCode) {
                case 2041:
                  console.log("probleme d'id...");
                    break;
                case 2040:
                  console.log('Problème serveur...');
                  break;
                default:
                    enqueueSnackbar("Une erreur inconnue est survenue", {
                    variant: "error",
                    });
                };
            return;
            };
    };

    const fetchDeleteUser = async () => {
        const deleteUser = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/room/user?roomId=${idRoom}&userId=${idUser}`,{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const responseDelete = await deleteUser.json();
        if(responseDelete.errorCode) {
            switch (responseDelete.errorCode) {
                case 2050:
                  console.log("probleme d'id...");
                    break;
                case 2052:
                    enqueueSnackbar("L'utilisateur n'existe pas...", {
                        variant: "error",
                    });
                    break;
                case 2051:
                  console.log('Problème serveur...');
                  break;
                default:
                    enqueueSnackbar("Une erreur inconnue est survenue", {
                    variant: "error",
                    });
                };
            return;
            };
    };

    const fetchVerifyNumberPlayer = async () => {
        const effectifPlayer = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/room/players/${idRoom}`,{
            headers: {
                'Authorization': `Bearer ${token}`
                }
            }
        );
        const playerEffectif = await effectifPlayer.json();
        if(playerEffectif.errorCode) {
            switch (playerEffectif.errorCode) {
                case 2020:
                    socket.emit('redirectToMenu', {roomId: idRoom});
                    break;
                case 2025:
                    enqueueSnackbar("La partie n'existe pas...", {
                    variant: "error",
                    });
                    break;
                case 2024:
                  console.log('Problème serveur...');
                  break;
                default:
                    enqueueSnackbar("Une erreur inconnue est survenue", {
                    variant: "error",
                    });
                };
            return;
        } else {
            const arrayPlayers = [];
            arrayPlayers.push(playerEffectif.admin.pseudo);
            playerEffectif.users.map((user) => {
                arrayPlayers.push(user.pseudo);
            });
            setListPlayers(arrayPlayers);
            setEffectifPlayer(arrayPlayers.length);
            socket.emit('playerExit', {data: arrayPlayers, roomId: idRoom});
        }
    };

    const handleExit = () => {
        if(JSON.parse(isAdmin)) {
            fetchDeleteAdmin();
            socket.emit('redirectToMenu', {roomId: idRoom});
            sessionStorage.removeItem('idRound');
            navigate(`/menu`);            
        } else {
            fetchVerifyNumberPlayer();
            fetchDeleteUser();
            sessionStorage.removeItem('idRound');
            navigate(`/menu`);
        }
    };

    useEffect(() => {
        if (socket) {
          socket.on('playerRelance', (room) => {
            sessionStorage.removeItem('idRound');
            console.log('playerRelance');
            navigate(`/room/${room}`);
          });

          socket.on('playerExit', (newList) => {
            setEffectifPlayer(newList.length);
            setListPlayers(newList);
          });

          socket.on('redirectToMenu', () => {
            sessionStorage.removeItem('idRound');
            navigate(`/menu`);
        });

          return () => {
            socket.off('playerExit');
            socket.off('redirectToMenu');
            socket.off('playerRelance');
          };
        }
      }, [socket, navigate]);

    return (
        <div className='pageResults'>
            <div className='resultsBlock'>
                <div className='result'>
                    <h1>RESULTATS</h1>
                    <div className='listResults'>
                    {bets.sort((a, b) => a.user_id == idUser ? -1 : 0).map((bet, index) => (
                        <p key={index} style={bet.user_id == idUser ? { color: '#F8CC46', fontWeight:"bold"} : {color:'inherit'}}>
                        {bet.horse == winner ? `${bet.pseudo} doit donner ${bet.bet} gorgées` : `${bet.pseudo} doit boire ${bet.bet} gorgées`}
                        </p>
                    ))}
                    </div>
                </div>
                <div className='buttonResults'>
                    {JSON.parse(isAdmin) ? <button className='buttonRelance' onClick={handleRelance}>Relancer une partie</button> : <Loader divResult={"divResult"} msgLoader={"En attente de l'admin..."}/>}
                    <button className='buttonExit' onClick={handleExit}>Quitter</button>
                </div>
            </div>
            <div className='resultChatPlayer'>
                <div className='listPlayer'>
                    <h2>LISTE DES JOUEURS</h2>
                    <div className='listUlPlayers'>
                        <p>Nombre de joueurs: {effectifPlayer}/{numberPlayer}</p>
                        <ul>
                            {listPlayers.map((player, index) => {
                                return (
                                <li key={index}><div className='imgPseudo' style={{backgroundImage: "url(/media/image2.png)"}}></div> {player}</li>
                                );
                            })}
                        </ul>  
                    </div>                  
                </div>
                {JSON.parse(isMulti) && !isSmallScreen ? <Chat socket={socket}/> : null}
            </div>
        </div>
    );
}

export default Results;