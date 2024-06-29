import { StyleSheet } from "react-native";

export default StyleSheet.create({
  header: {
    marginTop: 0,
    height: 140,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    position: "relative",
    zIndex: -1,
  },
  headerButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
    fontSize: 16,
  },
  chatButton: {
    color: "#F5FFFC",
    marginTop: 5,
    marginLeft: 10,
  },
  iconRules: {
    color: "#3498db",
    marginRight: 10,
  },
  rulesPopup: {
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
    top: 10,
    right: 10,
    backgroundColor: "transparent",
    borderWidth: 0,
    fontSize: 20,
    color: "#fff",
    cursor: "pointer",
  },
  hidden: {
    display: "none",
  },
});
