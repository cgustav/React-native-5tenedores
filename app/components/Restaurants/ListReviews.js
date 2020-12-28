import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, Avatar, Rating } from "react-native-elements";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";

import { map } from "lodash";
const db = firebase.firestore(firebaseApp);

export default function ListReviews(props) {
  const { navigation, idRestaurant, setRating } = props;
  const [userLogged, setUserLogged] = useState(false);
  const [reviews, setReviews] = useState([]);

  firebase.auth().onAuthStateChanged((user) => {
    setUserLogged(user ? true : false);
  });

  useEffect(() => {
    db.collection("reviews")
      .where("idRestaurant", "==", idRestaurant)
      .get()
      .then((response) => {
        const resultReview = [];
        response.forEach((doc) => {
          // console.log("REVIEWS: ", doc.data());
          const data = doc.data();
          data.id = doc.id;
          resultReview.push(data);
        });
        setReviews(resultReview);
      });
  }, []);

  return (
    <View>
      {userLogged ? (
        <Button
          title="Escribe una opinión"
          buttonStyle={styles.btnAddReview}
          titleStyle={styles.btnTitleAddReview}
          icon={{
            type: "material-community",
            name: "square-edit-outline",
            color: "#00a680",
          }}
          onPress={() =>
            navigation.navigate("add-review-restaurant", {
              idRestaurant,
            })
          }
        />
      ) : (
        <View>
          <Text
            style={{ textAlign: "center", color: "#00a680", padding: 20 }}
            onPress={() => navigation.navigate("login")}
          >
            Para escribir un comentario es necesario haber iniciado sesión.
            <Text style={{ fontWeight: "bold" }}>
              Pulsa AQUÍ para iniciar sesión.
            </Text>
          </Text>
        </View>
      )}

      {map(reviews, (review, index) => (
        <Review key={index} review={review} />
      ))}
    </View>
  );
}

function Review(props) {
  const { title, review, rating, createdAt, avatarUser } = props.review;
  const createdReview = new Date(createdAt.seconds * 1000);

  console.log("AvatarUser: ", avatarUser);
  return (
    <View style={styles.viewReview}>
      <View style={styles.viewImageAvatar}>
        <Avatar
          size="large"
          rounded
          containerStyle={styles.imageAvatar}
          source={
            avatarUser
              ? {
                  uri: avatarUser,
                }
              : require("../../../assets/img/avatar-default.jpg")
          }
        />
      </View>
      <View style={styles.viewInfo}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Text style={styles.reviewText}>{review}</Text>
        <Rating startingValue={rating} imageSize={15} readonly />
        <Text style={styles.reviewDate}>
          {createdReview.getDate()}/{createdReview.getMonth() + 1}/
          {createdReview.getFullYear()} - {createdReview.getHours()}:
          {createdReview.getMinutes() < 10 ? "0" : ""}
          {createdReview.getMinutes()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnAddReview: {
    backgroundColor: "transparent",
  },
  btnTitleAddReview: {
    color: "#00a680",
  },
  viewReview: {
    flexDirection: "row",
    // flex: 1,
    padding: 10,
    paddingBottom: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1,
  },
  viewImageAvatar: {
    marginRight: 15,
  },
  imageAvatar: {
    width: 50,
    height: 50,
  },
  viewInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  reviewTitle: {
    fontWeight: "bold",
  },
  reviewText: {
    paddingTop: 2,
    color: "grey",
    marginBottom: 5,
  },
  reviewDate: {
    marginTop: 5,
    color: "grey",
    fontSize: 12,
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});
