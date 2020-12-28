import React, { useState, useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
import { Rating, ListItem, Icon } from "react-native-elements";

import ListReviews from "../../components/Restaurants/ListReviews";
import ImagesCarousel from "../../components/ImagesCarousel";
import Loading from "../../components/Loading";
import Map from "../../components/Map";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

import { map } from "lodash";

const db = firebase.firestore(firebaseApp);
const screenWidth = Dimensions.get("window").width;

export default function Restaurant(props) {
  console.log("PROPS: ", props);
  const { navigation, route } = props;
  const { id, name } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLogged, setUserLogged] = useState(false);

  const toastRef = useRef();

  navigation.setOptions({ title: name });

  firebase.auth().onAuthStateChanged((user) => {
    setUserLogged(user ? true : false);
  });

  useFocusEffect(
    useCallback(() => {
      db.collection("restaurants")
        .doc(id)
        .get()
        .then((response) => {
          const data = response.data();
          data.id = response.id;
          setRestaurant(data);
          setRating(data.rating);
        });
    }, [])
  );

  useEffect(() => {
    if (userLogged && restaurant) {
      db.collection("favorites")
        .where("idRestaurant", "==", restaurant.id)
        .where("idUser", "==", firebase.auth().currentUser.uid)
        .get()
        .then((response) => {
          if (response.docs.length) setIsFavorite(true);
        });
    }
  }, [userLogged, restaurant]);

  const addFavorite = () => {
    if (!userLogged)
      toastRef.current.show(
        "Para usar el sistema de favoritos tienes que haber iniciado sesión"
      );
    else {
      const payload = {
        idUser: firebase.auth().currentUser.uid,
        idRestaurant: restaurant.id,
      };

      db.collection("favorites")
        .add(payload)
        .then(() => {
          setIsFavorite(true);
          toastRef.current.show("Restaurante añadido a favoritos.");
        })
        .catch(() => {
          toastRef.current.show("Error al añadir restaurante a favoritos.");
        });
    }
  };
  const removeFavorite = () => {
    setIsFavorite(false);

    db.collection("favorites")
      .where("idRestaurant", "==", restaurant.id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then((response) => {
        response.forEach((doc) => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsFavorite(false);
              toastRef.current.show("Restaurante eliminado de favoritos.");
            })
            .catch((err) => {
              toastRef.current.show(
                "Error al eliminar el restaurante de favoritos."
              );
            });
        });
      });
  };

  if (!restaurant) return <Loading isVisible={true} text="Cargando..." />;

  return (
    <ScrollView vertical style={styles.viewBody}>
      <View style={styles.viewFavorite}>
        <Icon
          type="material-community"
          name={isFavorite ? "heart" : "heart-outline"}
          onPress={() => {
            // console.log("Add Favorites");
            isFavorite ? removeFavorite() : addFavorite();
          }}
          // color="#00a680"
          color={isFavorite ? "#f00" : "#000"}
          size={25}
          underlayColor="transparent"
        ></Icon>
      </View>
      <ImagesCarousel
        arrayImages={restaurant.images}
        height={250}
        width={screenWidth}
      />
      <TitleRestaurant
        name={restaurant.name}
        description={restaurant.description}
        rating={rating}
      />
      <RestaurantInfo
        location={restaurant.location}
        name={restaurant.name}
        address={restaurant.address}
      />

      <ListReviews
        navigation={navigation}
        idRestaurant={restaurant.id}
        // setRating={setRating}
      />
      <Toast ref={toastRef} position="center" opacity={0.9}></Toast>
    </ScrollView>
  );
}

function TitleRestaurant(props) {
  const { name, description, rating } = props;

  return (
    <View style={styles.viewRestaurantTitle}>
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.nameRestaurant}>{name}</Text>
        <Rating
          style={styles.rating}
          imageSize={20}
          readonly
          startingValue={parseFloat(rating)}
        ></Rating>
      </View>
      <Text style={styles.descriptionRestaurant}>{description}</Text>
    </View>
  );
}

function RestaurantInfo(props) {
  const { location, name, address } = props;

  const listInfo = [
    {
      text: address,
      iconName: "map-marker",
      iconType: "material-community",
      action: null,
    },

    {
      text: "111 222 333",
      iconName: "phone",
      iconType: "material-community",
      action: null,
    },

    {
      text: "contacto@email.com",
      iconName: "at",
      iconType: "material-community",
      action: null,
    },
  ];

  return (
    <View style={styles.viewRestaurantInfo}>
      <Text style={styles.restaurantInfoTitle}>
        Información sobre el restaurante
      </Text>
      <Map location={location} name={name} height={100} />
      {map(listInfo, (item, index) => {
        return (
          <ListItem
            key={index}
            title={item.text}
            leftIcon={{
              name: item.iconName,
              type: item.iconType,
              color: "#00a680",
            }}
            containerStyle={styles.containerListItem}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  viewRestaurantTitle: {
    padding: 15,
  },
  nameRestaurant: {
    fontSize: 20,
    fontWeight: "bold",
  },
  descriptionRestaurant: {
    marginTop: 5,
    color: "grey",
  },
  rating: {
    position: "absolute",
    right: 0,
  },
  viewRestaurantInfo: {
    margin: 15,
    marginTop: 25,
  },
  restaurantInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  containerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1,
  },
  viewFavorite: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 100,
    padding: 5,
    paddingLeft: 15,
  },
});
