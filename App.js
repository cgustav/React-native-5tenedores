import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import Navigation from "./app/navigations/Navigation";
import { firebaseApp } from "./app/utils/firebase";
// import * as firebase from "firebase";
import { LogBox } from "react-native";

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
  return <Navigation />;
}
