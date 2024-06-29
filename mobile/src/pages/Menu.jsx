import React, { useContext } from "react";
import { Text, TouchableOpacity} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { AuthContext } from "../../AuthContext";
import styles from "../styles/components/logout";
import stylesButton from "../styles/pages/welcome";
function Menu() {
  const navigation = useNavigation();
  const { isLoggedIn, handleLogout } = useContext(AuthContext);

  const logout = () => {
    handleLogout();
    navigation.navigate("Welcome");
  };

  const handleJoin = () => {
    navigation.navigate('JoinParty');
  };

  return (
      <LinearGradient
        colors={["#0E1C25", "#2E5958"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <Text>Menu</Text>
          <TouchableOpacity onPress={handleJoin} style={[stylesButton.primaryButton, stylesButton.centeredButton]}>
            <Text style={stylesButton.buttonText}>Join</Text>
          </TouchableOpacity>
          {isLoggedIn && (
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Icon name="sign-out" style={styles.logoutButtonCtnt} />
            </TouchableOpacity>
          )}
        </LinearGradient>
  );
}

export default Menu;
