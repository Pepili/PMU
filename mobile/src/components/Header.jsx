import React, { useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import Rules from "./Rules";
import styles from "../styles/header";

function Header() {
    const [showRulesPopup, setShowRulesPopup] = useState(false);
    const [showChatPopup, setShowChatPopup] = useState(false);
    const toggleRulesPopup = () => {
      setShowRulesPopup(!showRulesPopup);
    };
    const toggleChatPopup = () => {
      setShowChatPopup(!showChatPopup);
    };
    return (
      <LinearGradient
        colors={['#0E1C25', '#0E1C25']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.headerButton} onPress={toggleChatPopup}>
          <FontAwesomeIcon icon={faMessage} size={26} style={styles.chatButton}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={toggleRulesPopup}>
          <Image
            source={require("../../media/rules_icon.png")}
            style={styles.iconRules}
          />
        </TouchableOpacity>
        {showRulesPopup && (
          <Rules
            showPopup={showRulesPopup}
            closePopup={() => setShowRulesPopup(false)}
          />
        )}
      </LinearGradient>
    )
}

export default Header;