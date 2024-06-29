import React, { useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Rules from "./Rules";
import styles from "../styles/lightHeader";

function LightHeader() {
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const toggleRulesPopup = () => {
    setShowRulesPopup(!showRulesPopup);
  };
  return (
    <LinearGradient
      colors={['#0E1C25', '#0E1C25']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.header}
    >
      <Image
        source={require("../../media/logo.png")}
        style={styles.lightLogo}
      />
      <TouchableOpacity style={styles.rulesButton} onPress={toggleRulesPopup}>
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
  );
}

export default LightHeader;