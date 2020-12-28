import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Card, Image, Icon, Rating } from "react-native-elements";

export default function ListTopRestaurants(props) {
  const { restaurants, navigation } = props;
  return (
    // <View>
    //   <Text>Hola</Text>
    // </View>
    <FlatList
      data={restaurants}
      renderItem={(item) => (
        <Restaurant restaurant={item} navigation={navigation} />
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  );
}

function Restaurant(props) {
  const {
    restaurant: {
      item: { id, name, rating, images, description },
      index,
    },
    navigation,
  } = props;

  const getRankingColor = (position) => {
    switch (position) {
      case 0:
        return "#efb819";
      case 1:
        return "#e4e4e5";
      case 2:
        return "#cd7f32";
      default:
        return "#000";
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("restaurants", {
          screen: "restaurant",
          params: { id },
        })
      }
    >
      <Card containerStyle={styles.containerCard}>
        <Icon
          type="material-community"
          name="chess-queen"
          color={getRankingColor(index)}
          size={40}
          containerStyle={styles.containerIcon}
        />
        <Image
          style={styles.restaurantImage}
          resizeMode="cover"
          source={
            images[0]
              ? { uri: images[0] }
              : require("../../../assets/img/no-image.png")
          }
        />
        <View style={styles.titleRating}>
          <Text style={styles.title}>{name}</Text>
          <Rating imageSize={15} startingValue={rating} readonly />
        </View>
        <Text style={styles.description}>{description}</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerIcon: {
    position: "absolute",
    top: -30,
    left: -30,
    zIndex: 1,
  },
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  titleRating: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  description: {
    color: "grey",
    margin: 0,
    textAlign: "justify",
  },
});
