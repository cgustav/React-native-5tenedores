import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Icon, Button } from "react-native-elements";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";

export default function Restaurants(props) {
  const { navigation } = props;
  const [user, setUser] = useState({});

  console.log(props);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((userInfo) => {
      setUser(userInfo);
    });
  }, []);

  return (
    <View style={styles.viewBody}>
      <Text>Restaurants...</Text>
      {user && (
        <TouchableOpacity
          style={styles.btnContainer}
          onPress={() => navigation.navigate("add-restaurant")}
        >
          <Icon type="material-community" name="plus" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: "#00a680",
  },
  btnContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "black",
    shadowOpacity: 0.5,
    backgroundColor: "#00a680",
    shadowOffset: {
      width: 2,
      height: 2,
    },
  },
});
