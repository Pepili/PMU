import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import styles from "../../styles/pages/welcome";

function Login({ onLogin }) {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [translateY, setTranslateY] = useState(0);

  const onLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setTranslateY(height * 0.2);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_PMU_API_URL}/api/user`,
        {
          params: {
            email: email,
            password: password,
          },
        }
      );
      const data = response.data;
      onLogin(data.id.toString(), data.token);
      showMessage({
        message: "Connecté avec succès",
        type: "success",
      });
      setEmail('');
      setPassword('');
      navigation.navigate("Menu");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errorCode) {
        let message;
        switch (error.response.data.errorCode) {
          case 1010:
            message = "Aucun compte n'existe avec cet email";
            break;
          case 1011:
            message = "Mot de passe incorrect";
            break;
          case 1012:
            message = "Une erreur est survenue";
            break;
          case 1013:
            message = "Veuillez remplir tous les champs";
            break;
          case 1014:
            message = "Le mail et le mot de passe doivent être des chaînes de caractère";
            break;
          default:
            message = "Une erreur inconnue est survenue";
        }
        showMessage({
          message: message,
          type: "danger",
        });
      } else {
        showMessage({
          message: "Une erreur est survenue lors de la connexion",
          type: "danger",
        });
      }
      console.error(error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView>
      <View style={styles.login} onLayout={onLayout}>
        <Text style={styles.h2}>CONNEXION</Text>
        <View style={styles.textField}>
          <Text style={styles.label}>Adresse mail:</Text>
          <TextInput
            style={styles.inputText}
            value={email}
            onChangeText={setEmail}
            autoCompleteType="off"
            keyboardType="email-address"
            required
          />
        </View>
        <View style={styles.textField}>
          <Text style={styles.label}>Mot de passe:</Text>
          <TextInput
            style={styles.inputText}
            value={password}
            onChangeText={setPassword}
            autoCompleteType="off"
            secureTextEntry={!showPassword}
            required
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.btnPwd}>
            {showPassword ? (
              <Icon name="eye-slash" style={styles.icon} />
            ) : (
              <Icon name="eye" style={styles.icon} />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.primaryButton, styles.centeredButton]}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default Login;
