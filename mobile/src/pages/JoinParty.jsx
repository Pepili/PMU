import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Snackbar } from 'react-native-paper';
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import styles from "../styles/pages/joinParty";

function JoinParty() {
    const [codeRoom, setCodeRoom] = useState('');
    const [error, setError] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarVariant, setSnackbarVariant] = useState('error');
    const [token, setToken] = useState(null);
    const [id, setId] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const checkSession = async () => {
            const idFromStorage = await AsyncStorage.getItem("id");
            const tokenFromStorage = await AsyncStorage.getItem('token');
            setToken(tokenFromStorage);
            setId(idFromStorage);
            if (!tokenFromStorage || !idFromStorage) {
                navigation.navigate("Home");
            }
        };
        checkSession();
    }, [navigation]);

    const handleInputChange = (value) => {
        setCodeRoom(value);
        setError('');
    };

    const showSnackbar = (message, variant) => {
        setSnackbarMessage(message);
        setSnackbarVariant(variant);
        setSnackbarVisible(true);
    };

    const handleSubmit = async () => {
        if (codeRoom.trim() === '') {
            showSnackbar('Veuillez entrer un code', 'error');
            return;
        } else if (codeRoom.length !== 6) {
            showSnackbar('Le format du code est incorrect', 'error');
            return;
        }
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_PMU_API_URL}/api/room/code/${codeRoom}`,
          {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          }
        );
        const data = response.data;
        if (data.errorCode) {
            switch (data.errorCode) {
                case 2010:
                    showSnackbar("Ce code n'existe pas...", 'error');
                    break;
                case 2011:
                    showSnackbar("La valeur est vide", 'error');
                    break;
                default:
                    showSnackbar("Une erreur inconnue est survenue", 'error');
            }
            return;
        }
        const roomId = data.id;
        const userId = parseInt(await AsyncStorage.getItem("id"));

        const addUser = await axios.post(
          `${process.env.EXPO_PUBLIC_PMU_API_URL}/api/room/join`,
          {
              roomId: roomId,
              userId: userId
          },
          {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
          }
      );
      const responseAddUser = addUser.data;
        if(responseAddUser.errorCode === 2061) {
            showSnackbar("Vous avez rejoins une partie!", 'success');
          navigation.navigate(`Room`, { id: data.id });
        } else if (responseAddUser.errorCode) {
            showSnackbar("Une erreur est survenue", 'error');
        } else {
            showSnackbar("Vous avez rejoint une partie!", 'success');
            navigation.navigate(`Room`, { id: data.id });
        }

        setCodeRoom('');
        setError('');
    };

    const handleArrowClick = () => {
        navigation.navigate('Menu');
    };

    return (
      <LinearGradient
        colors={["#0E1C25", "#2E5958"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={styles.join}>
            <TouchableOpacity onPress={handleArrowClick} style={styles.arrowButton}>
                <FontAwesomeIcon icon={faArrowLeft} style={styles.arrow} size={26}/>
            </TouchableOpacity>
            <View style={styles.formJoin}>
                <Text style={styles.title}> REJOINS UNE PARTIE !!</Text>
                <TextInput
                    value={codeRoom}
                    onChangeText={handleInputChange}
                    placeholder="Code de la room"
                    style={[styles.codeRoom, error && styles.error]}
                />
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.button}
                >
                  <Text style={styles.txtButton}>Envoyer</Text>
                </TouchableOpacity>
                {error && <Text style={styles.errorForm}>{error}</Text>}
            </View>
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

export default JoinParty;

