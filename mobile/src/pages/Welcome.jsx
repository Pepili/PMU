import React, { useState, useEffect, useContext } from "react";
import { SafeAreaView, TouchableOpacity, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/Footer";
import Login from "../components/welcome/Login";
import ForgotPassword from "../components/welcome/ForgotPassword";
import Signup from "../components/welcome/Signup";
import { AuthContext } from "../../AuthContext";
import styles from "../styles/pages/welcome";

function Welcome() {
  const { handleLogin } = useContext(AuthContext);
  const navigation = useNavigation();
  const [showLogin, setShowLogin] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const id = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");

      if (id && token) {
        navigation.navigate("Menu");
      }
    };

    checkToken();
  }, [navigation]);

  const toggleForgotPasswordModal = () => {
    setShowForgotPasswordModal(!showForgotPasswordModal);
  };

  return (
    <LinearGradient
      colors={["#0E1C25", "#2E5958"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.welcome}>
        <View>
          {showLogin ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Signup setShowLogin={setShowLogin} />
          )}
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={() => setShowLogin(!showLogin)}
              style={[styles.secondaryButton, styles.centeredButton]}
            >
              <Text style={styles.buttonText}>
                {showLogin ? "S'inscrire" : "Se connecter"}
              </Text>
            </TouchableOpacity>
            {showLogin && (
              <TouchableOpacity onPress={toggleForgotPasswordModal}>
                <Text style={styles.linkButton}>
                  Mot de passe oublié ? Par ici
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {showForgotPasswordModal && (
            <ForgotPassword
              showPopup={showForgotPasswordModal}
              closePopup={() => setShowForgotPasswordModal(false)}
            />
          )}
        </View>
      </SafeAreaView>
      <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <Footer />
      </View>
    </LinearGradient>
  );
}

export default Welcome;
