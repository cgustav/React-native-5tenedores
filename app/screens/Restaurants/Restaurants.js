import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Icon, Button } from "react-native-elements";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
import ListRestaurants from "../../components/Restaurants/ListRestaurants";

const db = firebase.firestore(firebaseApp);

export default function Restaurants(props) {
  const { navigation } = props;
  const [user, setUser] = useState({});
  const [restaurants, setRestaurants] = useState([]);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [startRestaurants, setStartRestaurants] = useState(null);
  const limitRestaurants = 10;

  useEffect(() => {
    firebase.auth().onAuthStateChanged((userInfo) => {
      setUser(userInfo);
    });
  }, []);

  useEffect(() => {
    db.collection("restaurants")
      .get()
      .then((snap) => {
        setTotalRestaurants(snap.size);
      });

    const resultRestaurants = [];

    db.collection("restaurants")
      .orderBy("createdAt", "desc")
      .limit(limitRestaurants)
      .get()
      .then((response) => {
        setStartRestaurants(response.docs[response.docs.length - 1]);
        response.forEach((doc) => {
          const restaurant = doc.data();
          restaurant.id = doc.id;
          resultRestaurants.push(restaurant);
        });
        setRestaurants(resultRestaurants);
      });
  }, []);

  return (
    <View style={styles.viewBody}>
      <ListRestaurants restaurants={restaurants} />
      {user && (
        <TouchableOpacity
          style={styles.btnContainer}
          onPress={() => navigation.navigate("add-restaurant")}
        >
          <Icon type="material-community" name="plus" size={30} color="white" />
        </TouchableOpacity>
      )}
      <View>
        <Text></Text>
      </View>
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
