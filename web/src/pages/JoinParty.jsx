import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useSnackbar } from "notistack";

function JoinParty() {
    const [codeRoom, setCodeRoom] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const id = sessionStorage.getItem("id");
        const token = sessionStorage.getItem("token");
        if (!token || !id) {
          navigate("/");
          return;
        }
    }, [navigate]);
    
    const handleInputChange = (e) => {
        setCodeRoom(e.target.value);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Vérification de la valeur de l'entrée ici
        if (codeRoom.trim() === '') {
            enqueueSnackbar('Veuillez entrer un code', {
                variant: "error",
            });
            return;
        } else if (codeRoom.length !== 6) {
            enqueueSnackbar('Le format du code est incorrect', {
                variant: "error",
            });
            return;
        }
        const token = sessionStorage.getItem('token');
        console.log(codeRoom);
        const fetchData = async () => {
            const response = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/room/code/${codeRoom}`,{
            headers: {
                'Authorization': `Bearer ${token}`
                } 
            }
            );
            const data = await response.json();
            if(data.errorCode) {
            switch (data.errorCode) {
                case 2010:
                    enqueueSnackbar('Ce code n\'existe pas...', {
                        variant: "error",
                    });
                    break;
                case 2011:
                    enqueueSnackbar("La valeur est vide", {
                    variant: "error",
                    });
                    break;
                default:
                    enqueueSnackbar("Une erreur inconnue est survenue", {
                    variant: "error",
                    });
                };
            return;
            };
            if(data.maxNbPlayers == 1) {
                return enqueueSnackbar('Ce code n\'existe pas...', {
                    variant: "error",
                });
            }
            const roomId = data.id;
            const userId = parseInt(sessionStorage.getItem("id"));

            const addUser = await fetch(`${process.env.REACT_APP_PMU_API_URL}/api/room/join`,{
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "roomId": roomId,
                        "userId": userId
                    })
                }
            );
            const responseAddUser = await addUser.json();

            if(responseAddUser.errorCode === 2061) {
                enqueueSnackbar("Vous avez rejoins une partie!", {
                    variant: "success",
                });
                navigate(`/room/${data.id}`);
            } else if (responseAddUser.errorCode) {
                enqueueSnackbar("Une erreur est survenue", {
                    variant: "error",
                });
                return;
            } else {
                enqueueSnackbar("Vous avez rejoins une partie!", {
                    variant: "success",
                    });
                navigate(`/room/${data.id}`);
            }
        };
      
        fetchData();
        // Réinitialisation de l'état
        setCodeRoom('');
        setError('');
    };

    const handleArrowClick = () => {
        navigate('/menu'); // Redirection vers la page '/menu' lors du clic sur le bouton fléché
    };

    return (
        <div className='join'>
             <button className='arrow' onClick={handleArrowClick}><FontAwesomeIcon icon={faArrowLeft} /></button>
            <div className='formJoin'>
                <h2>REJOINS UNE PARTIE !!</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={codeRoom}
                        onChange={handleInputChange}
                        className={`codeRoom ${error && 'error'}`}
                        name="codeRoom"
                        placeholder="Code de la room"
                    />
                    <button type='submit'>Envoyer</button>
                    {error && <p className='errorForm'>{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default JoinParty;
