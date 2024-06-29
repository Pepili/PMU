import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFlagCheckered } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Card from '../components/party/Card';
import Racetrack from '../components/party/Racetrack';
import ListPlayer from '../components/party/ListPlayer';
import { SocketIOContext } from "../../SocketContext";
import { Audio } from 'expo-av';
import { Snackbar } from 'react-native-paper';
import axios from "axios";
import styles from "../styles/pages/party";
// Données des cartes
const cardsData = [
  { id: 1, type: 'Roger', img: require('../../media/roger.png'), logo: require('../../media/logo.png'), color:'#B10E1D' },
  { id: 2, type: 'Gerard', img: require('../../media/gerard.png'), logo: require('../../media/logo.png'), color:'#209BE0' },
  { id: 3, type: 'Jean-Jacques', img: require('../../media/jean-jacques.png'), logo: require('../../media/logo.png'), color:'green' },
  { id: 4, type: 'Marcel', img: require('../../media/marcel.png'), logo: require('../../media/logo.png'), color:'#9747FF'}
];

function Party() {
  const [idRound, setIdRound] = useState(null);
  const [token, setToken] = useState(null);
  const [lengthRun, setLengthRun] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [isMulti, setIsMulti] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVariant, setSnackbarVariant] = useState('error');
  const navigation = useNavigation();

  const showSnackbar = (message, variant) => {
    setSnackbarMessage(message);
    setSnackbarVariant(variant);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    const getDataFromStorage = async () => {
      try {
        const idRoundFromStorage = await AsyncStorage.getItem("idRound");
        const tokenFromStorage = await AsyncStorage.getItem('token');
        const lengthRunFromStorage = Number(await AsyncStorage.getItem("duration"));
        const isAdminFromStorage = JSON.parse(await AsyncStorage.getItem("isAdmin"));
        const isMultiFromStorage = JSON.parse(await AsyncStorage.getItem("isMulti"));
        
        setIdRound(idRoundFromStorage);
        setToken(tokenFromStorage);
        setLengthRun(lengthRunFromStorage);
        setIsAdmin(isAdminFromStorage);
        setIsMulti(isMultiFromStorage);
        if (!tokenFromStorage || !idRoundFromStorage) {
          navigation.navigate("Welcome");
          return;
        }
      } catch (error) {
        console.error('Error retrieving data:', error);
      }
    };
    getDataFromStorage();
  }, []);
  
  const [numberPlayer, setNumberPlayer] = useState(0);
  const [effectifPlayer, setEffectifPlayer] = useState(0);
  const [bets, setBets] = useState([]);
  const [positionHorse, setPositionHorse] = useState([])
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [inconvenientCard, setInconvenientCard] = useState([]);
  const [finishParty, setFinishParty] = useState(false);
  const [showFadeIn, setShowFadeIn] = useState(false);
  const [stateInconvenient, setStateInconvenient] = useState(false);
  const socket = useContext(SocketIOContext);
  const [activeTab, setActiveTab] = useState('jeu');
  const [roomId, setRoomId] = useState(null);
  const [beerSound, setBeerSound] = useState(null);
  const [winnerSound, setWinnerSound] = useState(null);

  const fetchData = async () => {
    if(isMulti) {
      console.log(token);
      //RoomId
      const roomIdFetch = await axios.get(
          `${process.env.EXPO_PUBLIC_PMU_API_URL}/api/round/${idRound}`,
          {
            headers: {
                'Authorization': `Bearer ${token}`
            }
          }
      );
      const resultRoomId = roomIdFetch.data;
      if(resultRoomId.errorCode && resultRoomId.errorCode === 5020) {
        return showSnackbar('La manche n\'a pas pu être récupéré', 'error');
      }
      const idRoom = resultRoomId.roomId;
      setRoomId(idRoom);

      //Nombre de joueurs max
      const numberPlayer = await axios.get(`${process.env.EXPO_PUBLIC_PMU_API_URL}/api/room/${idRoom}`,{
        headers: {
            'Authorization': `Bearer ${token}`
            }
        }
      );
      const players = numberPlayer.data;
      if(players.errorCode && players.errorCode === 2070) {
        return showSnackbar('La partie n\'a pas pu être récupéré...', 'error');
      }
      setNumberPlayer(players.maxNbPlayers);

      //Nombre de joueur dans la partie
      const effectifPlayer = await axios.get(`${process.env.EXPO_PUBLIC_PMU_API_URL}/api/room/players/${idRoom}`,{
        headers: {
            'Authorization': `Bearer ${token}`
            }
        }
      );
      const playerEffectif = effectifPlayer.data;
      if(playerEffectif.errorCode) {
        switch (playerEffectif.errorCode) {
            case 2020:
              console.log("Les joueurs n'ont pas pu être récupéré...")
                break;
            case 2025:
                showSnackbar('La partie n\'existe pas...', 'error');
                break;
            case 2024:
              console.log('Problème serveur...');
              break;
            default:
                showSnackbar('Une erreur inconnue est survenue', 'error');
            };
        return;
        };
        setEffectifPlayer(playerEffectif.users.length + 1);

        //Paris de la manche
        const betsArray = await axios.get(`${process.env.EXPO_PUBLIC_PMU_API_URL}/api/round/bet/${idRound}`,{
          headers: {
              'Authorization': `Bearer ${token}`
              }
          }
        );
        const betsResponse = betsArray.data;
        if(betsResponse.errorCode) {
          switch (betsResponse.errorCode) {
              case 5032:
                console.log("probleme d'id...");
                  break;
              case 5031:
                  showSnackbar("La manche n'existe pas...", 'error');
                  break;
              case 5030:
                console.log('Problème serveur...');
                break;
              default:
                  showSnackbar("Une erreur inconnue est survenue", 'error');
              };
          return;
          };
        const arrayBet = [];
        betsResponse.bets.map((bet) => {
          arrayBet.push({
            pseudo: bet.pseudo,
            bet: bet.sips_number,
            horse: cardsData.find(horse => horse.id === bet.horse_id).type
          })
        })
        setBets(arrayBet);
    } else {
      const getDataFromStorage = async () => {
          const numberPlayerFromStorage = Number(await AsyncStorage.getItem("numberPlayer"));
          const effectifPlayerFromStorage = Number(await AsyncStorage.getItem("effectifPlayer") + 1);
          const betsFromStorage = JSON.parse(await AsyncStorage.getItem("bets"));
          
          setNumberPlayer(numberPlayerFromStorage);
          setEffectifPlayer(effectifPlayerFromStorage);
          setBets(betsFromStorage);
      };
      getDataFromStorage();
    }   
  }

  // Création du paquet de 52 cartes
  const createDeck = () => {
    let deck = [];
    for (let i = 0; i < 13; i++) { // Dupliquer chaque type de carte 13 fois
      cardsData.forEach(card => {
        deck.push({
          id: `${card.type}_${i + 1}`, // Identifier unique
          type: card.type,
          img: card.img,
          logo: card.logo
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
    const initialDeck = shuffleDeck(createDeck()).slice(lengthRun -2);
    const initialInconvenient = initialDeck.slice(0,lengthRun -2).map(card => ({
      ...card,
      use: false
    }));
    // Cet effet s'exécute une seule fois après le premier rendu
    const fetchCurrentGame = async () => {
      const currentGame = await axios.post(
        `${process.env.EXPO_PUBLIC_PMU_API_URL}/api/currentGames/${idRound}`, 
        {
          roundId: parseInt(idRound),
          deck: initialDeck,
          discard: [],
          inconvenientCard: initialInconvenient,
          positionHorse: [
            { type: "Roger", position: 0},
            { type: "Marcel", position: 0},
            { type: "Jean-Jacques", position: 0},
            { type: "Gerard", position: 0}
          ]
        },
        {
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const response = currentGame.data;
      if(response.errorCode) {
        switch (response.errorCode) {
            case 6000:
              console.log("probleme d'id...");
                break;
            case 6002:
                showSnackbar("La manche n'existe pas ou est déjà terminée...", 'error');
                break;
            case 6001:
              console.log('Problème serveur...');
              break;
            default:
                showSnackbar("Une erreur inconnue est survenue", 'error');
            };
        return;
        };
      if(response) {
        const getCurrentGame = async () => {
          const currentGame = await axios.get(`${process.env.EXPO_PUBLIC_PMU_API_URL}/api/currentGames/${idRound}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const responseCurrent = currentGame.data;
          if(responseCurrent.errorCode) {
            switch (responseCurrent.errorCode) {
                case 6030:
                  console.log("probleme d'id...");
                    break;
                case 6032:
                    showSnackbar("Il n'y a pas de donnée pour cette manche...", 'error');
                    break;
                case 6031:
                  console.log('Problème serveur...');
                  break;
                default:
                    showSnackbar("Une erreur inconnue est survenue", 'error');
                };
            return;
            };
          setPositionHorse(responseCurrent.positionHorse);
          setDeck(responseCurrent.deck);
          setDiscard(responseCurrent.discard);
          setInconvenientCard(responseCurrent.inconvenientCard);
        }
        getCurrentGame();
      }
    };
    fetchCurrentGame();

    const loadAudio = async () => {
      const beerSoundObject = new Audio.Sound();
      const winnerSoundObject = new Audio.Sound();

      try {
        await beerSoundObject.loadAsync(require('../../media/beer.mp3'));
        await winnerSoundObject.loadAsync(require('../../media/horse.mp3'));

        // Stocker les objets de son dans le state une fois qu'ils sont chargés
        setBeerSound(beerSoundObject);
        setWinnerSound(winnerSoundObject);
      } catch (error) {
        console.error('Erreur lors du chargement des fichiers audio:', error);
      }
    };

    loadAudio();

    // Nettoyer les ressources audio lors du démontage du composant
    return () => {
      if (beerSound !== null) {
        beerSound.unloadAsync();
      }
      if (winnerSound !== null) {
        winnerSound.unloadAsync();
      }
    };

  }, []);

   // Fonction pour jouer le son de la bière
   const playBeerSound = async () => {
    if (beerSound !== null) {
      try {
        await beerSound.playAsync();
      } catch (error) {
        console.error('Erreur lors de la lecture du son de la bière:', error);
      }
    }
  };

  // Fonction pour jouer le son du gagnant
  const playWinnerSound = async () => {
    if (winnerSound !== null) {
      try {
        await winnerSound.playAsync();
      } catch (error) {
        console.error('Erreur lors de la lecture du son du gagnant:', error);
      }
    }
  };

  const modifyCurrentGame = async (newDeck, newDiscard, updatedInconvenientCard) => {
      const modifyCurrent = await axios.put(`${process.env.EXPO_PUBLIC_PMU_API_URL}/api/currentGames/`, 
      {
        roundId: parseInt(idRound),
        deck: newDeck,
        discard: newDiscard,
        inconvenientCard:updatedInconvenientCard,
        positionHorse: positionHorse
      }, {
        headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
        }
      });
      const responseCurrent = modifyCurrent.data;
      if(responseCurrent.errorCode) {
        switch (responseCurrent.errorCode) {
            case 6012:
                showSnackbar("Il n'y a pas de donnée pour cette manche...", 'error');
                break;
            case 6011:
              console.log('Problème serveur...');
              break;
            default:
                showSnackbar("Une erreur inconnue est survenue", 'error');
            };
        return;
        };
      // Faites quelque chose avec les données récupérées si nécessaire
  };

  const deleteCurrentGame = async () => {
    const deleteCurrent = await axios.delete(`${process.env.EXPO_PUBLIC_PMU_API_URL}/api/currentGames/${idRound}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const responseCurrent = deleteCurrent.data;
    if(responseCurrent.errorCode) {
      switch (responseCurrent.errorCode) {
          case 6020:
            console.log("probleme d'id...");
              break;
          case 6022:
              showSnackbar("Il n'y a pas de donnée pour cette manche...", 'error');
              break;
          case 6021:
            console.log('Problème serveur...');
            break;
          default:
              showSnackbar("Une erreur inconnue est survenue", 'error');
          };
      return;
      };
  };

  const handleResultClick = () => {
    deleteCurrentGame();
    socket.emit('navigate', {roomId, data:"Results"});
    navigation.navigate("Results");
  }
 
  useEffect(() => {
    if (finishParty) {
      playBeerSound();
    }
    const timeout = setTimeout(() => {
      if (finishParty) {
        playWinnerSound();
      }
      setShowFadeIn(finishParty);
    }, 3500); // Délai correspondant à la durée de la transition de l'overlay
    return () => clearTimeout(timeout);
  }, [finishParty]);

  useEffect(() => {
    if (socket) {
      socket.on('navigate', (data) => {
        console.log(data);
        navigation.navigate(data);
      });
      return () => {
        socket.off('navigate');
      };
    }
  }, [socket, navigation]);

  const [winnerHorse, setWinnerHorse] = useState("");

  useEffect(() => {
    if(positionHorse.length !== 0) {
      const highestPositionHorse = positionHorse.reduce((acc, curr) => {
        return acc.position > curr.position ? acc : curr;
      });
      if(highestPositionHorse.position === lengthRun - 1) {
        setWinnerHorse(cardsData.find(card => card.type === highestPositionHorse.type));
        sessionStorage.setItem("winner", highestPositionHorse.type);
      }
    }
  }, [positionHorse]);

  return (
    <LinearGradient
    colors={["#0E1C25", "#2E5958"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={{ flex: 1 }}
    >
      <View style={styles.party}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'jeu' && styles.activeTab]}
            onPress={() => setActiveTab('jeu')}>
            <Text>JEU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'paris' && styles.activeTab]}
            onPress={() => setActiveTab('paris')}>
            <Text>PARIS</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabContent}>
          {activeTab === 'jeu' ? (
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
                modifyCurrentGame={(newDeck, newDiscard, updatedInconvenientCard) => modifyCurrentGame(newDeck, newDiscard, updatedInconvenientCard)}
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
                modifyCurrentGame={(newDeck, newDiscard, updatedInconvenientCard) => modifyCurrentGame(newDeck, newDiscard, updatedInconvenientCard)}
                lengthRun={lengthRun}
                finishParty={finishParty}
                setFinishParty={setFinishParty}
                socket={socket}
                isAdmin={isAdmin}
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
          </View>
          <TouchableOpacity
            style={[
              styles.finishOverlay,
              (finishParty && isAdmin) ? { cursor: "pointer", backgroundImage: "url(../../media/beer.png)" } : {backgroundImage: "url(/media/beer.png)"}
            ]}
            onPress={(finishParty && isAdmin) ? handleResultClick : null}>
          </TouchableOpacity>
        {showFadeIn && isAdmin && (
          <TouchableOpacity
            style={[styles.fadeIn,
              (finishParty && isAdmin) ? {cursor:"pointer"} : null
            ]}
            onPress={(finishParty && isAdmin) ? handleResultClick : null}>
            <Image source={{ uri: winnerHorse.img }} />
            <Text>Le grand gagnant est {winnerHorse.type} !!</Text>
          </TouchableOpacity>
        )}
        <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
            style={{ backgroundColor: snackbarVariant === 'error' ? 'red' : 'green' }}
        >
                {snackbarMessage}
        </Snackbar>
      </View>
    </LinearGradient>
  );
  
  
}

export default Party;
