import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import Loading from "../components/Loading";
import Toast from "react-native-easy-toast";
import { size } from "lodash";
import { firebaseApp } from "../utils/firebase";
import firebase from "firebase";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function Favorites(props) {
  const { navigation } = props;
  const [restaurants, setRestaurants] = useState([]);
  const [userLogged, setuserLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadData, setReloadData] = useState(false);

  const toastRef = useRef();

  firebase.auth().onAuthStateChanged((user) => {
    setuserLogged(user ? true : false);
  });

  useFocusEffect(
    useCallback(() => {
      if (userLogged) {
        const idUser = firebase.auth().currentUser.uid;
        db.collection("favorites")
          .where("idUser", "==", idUser)
          .get()
          .then((response) => {
            const idRestaurantsArray = [];
            response.forEach((doc) => {
              idRestaurantsArray.push(doc.data().idRestaurant);
            });
            getDataRestaurant(idRestaurantsArray).then((res) => {
              const restos = [];
              res.forEach((doc) => {
                const resto = doc.data();
                resto.id = doc.id;
                restos.push(resto);
              });
              setRestaurants(restos);
              console.log("restaurants: ", restaurants);
            });
          });
      }
      setReloadData(false);
    }, [userLogged, reloadData])
  );

  const getDataRestaurant = (idArray) => {
    const arrayRestaurants = [];
    idArray.forEach((id) => {
      const result = db.collection("restaurants").doc(id).get();
      arrayRestaurants.push(result);
    });
    return Promise.all(arrayRestaurants);
  };

  if (!userLogged) return <UserNotLogged navigation={navigation} />;

  // if (!restaurants)
  //   return <Loading isVisible={true} text="Cargando Restaurantes" />;
  // else

  if (!restaurants?.length) return <NotFoundRestaurants />;

  return (
    <View style={styles.viewBody}>
      {restaurants ? (
        <FlatList
          data={restaurants}
          renderItem={(rest) => (
            <Restaurant
              restaurant={rest}
              setIsLoading={setIsLoading}
              toastRef={toastRef}
              setReloadData={setReloadData}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        ></FlatList>
      ) : (
        <View style={styles.loaderRestaurants}>
          <ActivityIndicator size="large"></ActivityIndicator>
          <Text style={{ textAlign: "center" }}>Cargando restaurantes</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading text="Eliminando de favoritos" isVisible={isLoading}></Loading>
    </View>
  );
}

function NotFoundRestaurants() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        No tienes restaurantes favoritos en tu lista.
      </Text>
    </View>
  );
}

function UserNotLogged(props) {
  const { navigation } = props;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Icon type="material-community" name="alert-outline" size={50}></Icon>
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        Necesitas estar logeado para ver esta sección
      </Text>

      <Button
        title="Ir al login"
        containerStyle={{
          marginTop: 20,
          width: "80%",
        }}
        buttonStyle={{
          backgroundColor: "#00a680",
        }}
        onPress={() => navigation.navigate("account", { screen: "login" })}
      ></Button>
    </View>
  );
}

function Restaurant(props) {
  const {
    restaurant,
    setIsLoading,
    toastRef,
    setReloadData,
    navigation,
  } = props;
  const { name, images, id } = restaurant.item;

  const confirmRemoveFavorite = () => {
    console.log("Confirm Remove Favorite");
    Alert.alert(
      "Eliminar restaurante de favoritos",
      "Estas seguro que quieres eliminar el restaurante de favoritos?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: removeFavorite,
        },
      ],
      { cancelable: false }
    );
  };

  const removeFavorite = () => {
    console.log("Remove...");
    setIsLoading(true);
    db.collection("favorites")
      .where("idRestaurant", "==", id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then((response) => {
        response.forEach((doc) => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsLoading(false);
              setReloadData(true);
              toastRef.current.show("Restaurante eliminado correctamente");
            })
            .catch(() => {
              setIsLoading(false);
              toastRef.current.show("Error al eliminar al restaurante");
            });
        });
      });
  };

  return (
    <View style={styles.restaurant}>
      <TouchableOpacity
        onPress={() =>
          // navigation.navigate("restaurant", {
          //   id,
          // })
          navigation.navigate("restaurants", {
            screen: "restaurant",
            params: {
              id,
            },
          })
        }
      >
        <Image
          resizeMode="cover"
          style={styles.image}
          PlaceholderContent={
            <ActivityIndicator color="#fff"></ActivityIndicator>
          }
          source={
            images[0]
              ? { uri: images[0] }
              : require("../../assets/img/no-image.png")
          }
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Icon
            type="material-community"
            name="heart"
            color="#f00"
            containerStyle={styles.favorite}
            underlayColor="transparent"
            onPress={() => confirmRemoveFavorite()}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  loaderRestaurants: {
    marginTop: 10,
    marginBottom: 10,
  },
  restaurant: {
    margin: 10,
  },
  image: {
    width: "100%",
    height: 100,
  },
  info: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: "#fff",
    // width:"100%"
  },
  name: {
    fontWeight: "bold",
    fontSize: 20,
  },
  favorite: {
    marginTop: -35,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100,
  },
});
