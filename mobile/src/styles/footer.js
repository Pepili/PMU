import { StyleSheet } from "react-native";

export default StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#1C3635",
    height: 60,
    justifyContent: "center",
    fontSize: 16,
  },
  autors: {
    color: "#F5FFFC",
    marginLeft: 15,
  },
  divFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    alignItems: "center",
  },
  logoutIcon: {
    borderRadius: 0,
    marginRight: 15,
  },
});
