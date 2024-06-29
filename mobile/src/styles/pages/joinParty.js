import { StyleSheet } from "react-native";

export default StyleSheet.create({
    join: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      zIndex: 2,
    },
    arrowButton: {
      position: 'absolute',
      left: 20,
      backgroundColor: 'transparent',
      borderWidth: 0,
      top: -146,
      zIndex: 2,
    },
    arrow: {
      color: '#F5FFFC',
    },
    formJoin: {
      textAlign: 'center',
      marginTop: 30,
    },
    title: {
      height: 150,
      lineHeight: 150,
      textAlign: 'center', 
      color: "#F5FFFC",
      fontSize: 22,
    },
    form: {
      flexDirection: 'column',
    },
    codeRoom: {
        textAlign: 'center',
        marginBottom: 20,
        width: 300,
        height: 52,
        borderRadius: 10,
        backgroundColor: '#F5FFFC',
        color: '#1C3635',
        fontSize: 16,
        padding: 8,

    },
    error: {
      borderColor: 'red',
      borderWidth: 2,
    },
    button: {
      borderRadius: 10,
      width: 300,
      height: 52,
      backgroundColor: "#00A870",
      border: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    txtButton: {
      color: "#F5FFFC",
      fontSize: 18,
    },
    errorForm: {
      color: 'red',
      textAlign: 'center',
      paddingTop: 10,
    }
});