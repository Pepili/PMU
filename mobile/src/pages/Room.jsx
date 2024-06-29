import React, { useEffect } from "react";
import { Text } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity} from "react-native";
import { useNavigation } from "@react-navigation/native";

function Room() {
  const route = useRoute();
  const { id } = route.params;
  const navigation = useNavigation();
  useEffect(() => {
    const setupStorage = async () => {
        // Données obligatoires
        await AsyncStorage.setItem('idRound', '5');
        await AsyncStorage.setItem('duration', '10');
        
        const id = await AsyncStorage.getItem('id');
        if (id == '9') {
            await AsyncStorage.setItem('isAdmin', 'true');
        } else {
            await AsyncStorage.setItem('isAdmin', 'false');
        }
        await AsyncStorage.setItem('isMulti', 'true');
        
        // Données si partie locale
        const isMulti = await AsyncStorage.getItem('isMulti');
        if (!JSON.parse(isMulti)) {
            await AsyncStorage.setItem('numberPlayer', '6');
            await AsyncStorage.setItem('effectifPlayer', '5');
            await AsyncStorage.setItem('bets', JSON.stringify([
                { pseudo: "john", bet: 3, horse: 'Gerard' },
                { pseudo: "Laura", bet: 4, horse: 'Roger' }
            ]));
        }
    };

    setupStorage();
  }, []);
  const roomNavigate = () => {
    navigation.navigate(`Party`);
  }
  return (
    <LinearGradient
      colors={["#0E1C25", "#2E5958"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <Text>Room</Text>
      <TouchableOpacity style={{backgroundColor:"white"}} onPress={roomNavigate}>
          <Text style={{color:"black"}}>Party</Text>
      </TouchableOpacity>
    </LinearGradient>
  )
}

export default Room;
