import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import styles from "../../styles/pages/welcome";

function ForgotPassword({ showPopup, closePopup }) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("email : ", email);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_PMU_API_URL}/api/mailSender`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to: email }),
        }
      );
      const data = await response.json();
      if (data.errorCode) {
        let message;
        switch (data.errorCode) {
          case 7000:
            message = "Une erreur est survenue lors de l'envoi de l'email";
            break;
          case 7001:
            message = "Adresse mail invalide";
            break;
          case 7002:
            message = "Aucun compte n'existe avec cet email";
            break;
          default:
            message = "Une erreur inconnue est survenue";
        }
        showMessage({
          message: message,
          type: "danger",
        });
        closePopup();
      } else {
        showMessage({
          message:
            "Un email pour réinitialiser votre mot de passe a été envoyé",
          type: "success",
        });
        closePopup();
      }
    } catch (error) {
      showMessage({
        message: "Une erreur est survenue lors de l'envoi de l'email",
        type: "danger",
      });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPopup}
      onRequestClose={closePopup}
    >
      <SafeAreaView style={styles.modal}>
        <TouchableOpacity onPress={closePopup} style={styles.closeBtn}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <Text style={styles.h2}>REINITIALISER LE MOT DE PASSE</Text>
        <View style={styles.modalContent}>
          <View style={styles.modalContent2}>
            <Text style={styles.label}>Adresse mail:</Text>
            <TextInput
              style={styles.inputText}
              onChangeText={(text) => setEmail(text)}
              value={email}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.secondaryButton,
                styles.centeredButton,
                styles.btnCenter,
              ]}
            >
              <Text style={styles.buttonText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default ForgotPassword;
