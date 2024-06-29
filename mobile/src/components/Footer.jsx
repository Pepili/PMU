import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import styles from "../styles/footer";

function Footer() {
  return (
    <SafeAreaView>
      <View style={styles.footer}>
        <View style={styles.divFooter}>
          <Text style={styles.autors}>Auteurs: Lisa, Hugo, Eve-Anne</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Footer;
