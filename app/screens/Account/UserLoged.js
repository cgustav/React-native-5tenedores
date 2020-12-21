import React from "react";
import { View, Text, Button } from "react-native";
import * as firebase from "firebase";

export default function UserLoged() {
  return (
    <View>
      <Text> UserLoged ... </Text>
      <Button
        title="Cerrar sesión"
        onPress={() => firebase.auth().signOut()}
      ></Button>
    </View>
  );
}
