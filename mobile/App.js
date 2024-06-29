import React, { useState, useEffect, createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FlashMessage from "react-native-flash-message";
import { AuthContext } from "./AuthContext";
import { SocketIOContext } from "./SocketContext";
import io from 'socket.io-client';

//Components
import Header from "./src/components/Header";
import LightHeader from "./src/components/LightHeader";

//Pages
import Welcome from "./src/pages/Welcome";
import Menu from "./src/pages/Menu";
import CreationParty from "./src/pages/CreationParty";
import JoinParty from "./src/pages/JoinParty";
import Room from "./src/pages/Room";
import Party from "./src/pages/Party";
import Results from "./src/pages/Results";
const Stack = createStackNavigator();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    const getIdToken = async () => {
      const idFromStorage = await AsyncStorage.getItem("id");
      const tokenFromStorage = await AsyncStorage.getItem('token');
      setToken(tokenFromStorage);
      setId(idFromStorage);
      if (idFromStorage && tokenFromStorage) {
        setIsLoggedIn(true);
      }
    };

    getIdToken();
    if(!socket) {
      const newSocket = io(process.env.EXPO_PUBLIC_PMU_API_URL, {
        // Envoyer l'ID de l'utilisateur et le token d'authentification lors de la connexion au socket
        query: {
          Authorization: `Bearer ${token}`,
          userId: id
        },
        reconnectionAttempts: 3,
        transports: ['websocket']
      });
  
      newSocket.on('connect_error', (err) => {
        console.error('Connection error:', err);
      });
  
      setSocket(newSocket);
    }    
    
    // Fermez la connexion lorsque le composant est démonté
    return () => {
      if (socket) {
        socket.close();
      }
    };

  }, [socket, token, id]);

  const handleLogin = async (id, token) => {
    await AsyncStorage.setItem("id", id);
    await AsyncStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <SocketIOContext.Provider value={socket}>
      <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen
              name="Welcome"
              component={Welcome}
              options={{ header: () => <LightHeader />, headerShown: true }}
            />
            <Stack.Screen
              name="Menu"
              component={Menu}
              options={{ header: () => <LightHeader />, headerShown: true }}
            />
            <Stack.Screen
              name="CreationParty"
              component={CreationParty}
              options={{ header: () => <LightHeader />, headerShown: true }}
            />
            <Stack.Screen
              name="JoinParty"
              component={JoinParty}
              options={{ header: () => <LightHeader />, headerShown: true }}
            />
            <Stack.Screen
              name="Room"
              component={Room}
              options={{ header: () => <Header />, headerShown: true }}
            />
            <Stack.Screen
              name="Party"
              component={Party}
              options={{ header: () => <Header />, headerShown: true }}
            />
            <Stack.Screen
              name="Results"
              component={Results}
              options={{ header: () => <Header />, headerShown: true }}
            />
          </Stack.Navigator>
          <FlashMessage position="top" />
        </NavigationContainer>
      </AuthContext.Provider>
    </SocketIOContext.Provider>
  );
}

export default App;
