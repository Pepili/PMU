import { StyleSheet } from "react-native";

export default StyleSheet.create({
  welcome: {
    marginBottom: 0,
    paddingBottom: 4 * 16,
  },
  h2: {
    fontSize: 22,
    fontWeight: "700",
    fontStyle: "normal",
    textAlign: "center",
    color: "#F5FFFC",
  },
  textField: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    gap: 12,
  },
  label: {
    paddingRight: 27,
    color: "#F5FFFC",
    alignItems: "center",
  },
  inputText: {
    borderRadius: 10,
    backgroundColor: "#e9e9e9",
    width: 363,
    height: 35,
    paddingLeft: 10,
  },
  btnContainer: {
    marginTop: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  login: {
    marginTop: 60,
    flexDirection: "column",
    gap: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPwd: {
    position: "absolute",
    top: "50%",
    right: "0%",
    transform: [{ translateY: "20%" }],
    borderColor: "transparent",
    color: "#000",
    fontSize: 20,
  },
  forgotpassword: {
    marginTop: 30,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.747)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  hidden: {
    display: "none",
  },
  primaryButton: {
    width: 180,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#00A870",
    borderColor: 0,
  },
  secondaryButton: {
    width: 180,
    height: 35,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderColor: "#F5FFFC",
    borderWidth: 1,
  },
  centeredButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#F5FFFC",
    fontWeight: "700",
  },
  closeButtonText: {
    fontSize: 30,
    color: "white",
  },
  linkButton: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    color: "#F5FFFC",
    fontSize: 16,
    fontWeight: "400",
  },
  btnPwd: {
    position: "absolute",
    top: "50%",
    right: "0%",
    borderColor: "transparent",
    color: "#000",
  },
  icon: {
    fontSize: 30,
    marginRight: 10,
    color: "#000",
  },
  modal: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.850)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    gap: 30,
    marginTop: 30,
  },
  modalContent2: {
    gap: 10,
  },
  btnCenter: {
    marginTop: 20,
    marginLeft: "25%",
  },
});
