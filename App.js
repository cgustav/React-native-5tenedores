import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import Navigation from "./app/navigations/Navigation";
import { firebaseApp } from "./app/utils/firebase";
// import * as firebase from "firebase";
import { LogBox } from "react-native";
import { ThemeProvider } from "@react-navigation/native";
import { decode, encode } from "base-64";

const theme = {
  colors: {
    primary: "#00a680",
  },
};

if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;

export default function App() {
  LogBox.ignoreLogs([
    "Setting a timer",
    "Animated: `useNativeDriver` was not specified.",
  ]);
  // useEffect(() => {
  //   firebase.auth().onAuthStateChanged((user) => {
  //     console.log("User: ", user);
  //   });
  // }, []);
  return (
    <ThemeProvider theme={theme}>
      <Navigation />
    </ThemeProvider>
  );
}
