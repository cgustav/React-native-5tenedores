import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AirbnbRating, Button, Input } from "react-native-elements";
import Toast from "react-native-easy-toast";

import Loading from "../../components/Loading";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
import { NativeScreen } from "react-native-screens";

const db = firebase.firestore(firebaseApp);

export default function AddReviewRestaurant(props) {
  const { navigation, route } = props;
  const { idRestaurant } = route.params;
  const [rating, setRating] = useState(null);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toastRef = useRef();

  const addReview = () => {
    console.log("rating : ", rating);
    console.log("title  : ", title);
    console.log("review : ", review);
    if (!rating) {
      toastRef.current.show("No has dado ninguna puntuación");
    } else if (!title) {
      toastRef.current.show("El título es obligatorio");
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser;

      const payload = {
        idUser: user.uid,
        avatarUser: user.photoURL,
        idRestaurant,
        title,
        review,
        rating,
        createdAt: new Date(),
      };

      console.log("OK: ", payload);

      db.collection("reviews")
        .add(payload)
        .then(() => {
          updateRestaurant();
        })
        .catch(() => {
          toastRef.current.show("Error al enviar la review");
          setIsLoading(false);
        });
    }
  };

  const updateRestaurant = () => {
    const restaurantRef = db.collection("restaurants").doc(idRestaurant);

    restaurantRef.get().then((response) => {
      const restaurantData = response.data();
      const ratingTotal = restaurantData.ratingTotal + rating;
      const quantityVoting = restaurantData.quantityVoting + 1;

      const ratingResult = ratingTotal / quantityVoting;

      restaurantRef
        .update({
          rating: ratingResult,
          ratingTotal,
          quantityVoting,
        })
        .then(() => {
          setIsLoading(false);
          navigation.goBack();
        });
    });
  };

  return (
    <View style={styles.viewBody}>
      <View style={styles.viewRating}>
        <AirbnbRating
          count={5}
          reviews={["Pésimo", "Deficiente", "Normal", "Muy Bueno", "Excelente"]}
          defaultRating={0}
          size={25}
          onFinishRating={(value) => {
            setRating(value);
          }}
        ></AirbnbRating>
      </View>
      <View style={styles.formReview}>
        <Input
          placeholder="Título"
          containerStyle={styles.input}
          onChange={(e) => setTitle(e.nativeEvent.text)}
        />
        <Input
          title="Comentario..."
          multiline={true}
          inputContainerStyle={styles.textArea}
          placeholder="Ingrese su comentario"
          containerStyle={styles.textArea}
          onChange={(e) => setReview(e.nativeEvent.text)}
        />
        <Button
          title="Enviar Comentario"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={addReview}
        ></Button>
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={isLoading} text="Enviando comentario"></Loading>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
  },
  viewRating: {
    height: 110,
    backgroundColor: "#f2f2f2",
  },
  formReview: { flex: 1, alignItems: "center", margin: 10 },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 120,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  btnContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 10,
    width: "95%",
  },
  btn: {
    backgroundColor: "#00a680",
  },
});
