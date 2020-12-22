import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Avatar } from "react-native-elements";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import * as firebase from "firebase";

export default function InfoUser(props) {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasGaleryPermission, setHasGaleryPermission] = useState(false);

  const {
    info: { photoURL, displayName, email, uid },
    toastRef,
    setIsLoading,
    setIsLoadingText,
  } = props;

  const requestCameraPermissions = async () => {
    const { status } = await Camera.requestPermissionsAsync();

    if (status !== "granted") {
      toastRef.current.show("Es necesario aceptar los permisos de la cámara!");
    } else setHasCameraPermission(true);
  };

  const requestGaleryPermissions = async () => {
    if (Platform.OS !== "web") {
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toastRef.current.show(
          "Es necesario aceptar los permisos de la galería!"
        );
      } else setHasGaleryPermission(true);
    }
  };

  const changeAvatar = async () => {
    if (!hasCameraPermission) await requestCameraPermissions();
    if (!hasGaleryPermission) await requestGaleryPermissions();

    if (hasCameraPermission && hasGaleryPermission) {
      let picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (picked.cancelled) {
        toastRef.current.show("Has cancelado la selección de imagenes.");
      } else
        uploadImage(picked.uri)
          .then(() => {
            console.log("Uploaded image!");
            updatePhotoUrl();
          })
          .catch(() => {
            toastRef.current.show("Error al actualizar el avatar.");
          });
    }
  };

  const uploadImage = async (uri) => {
    setIsLoadingText("Actualizando Avatar");
    setIsLoading(true);

    const response = await fetch(uri);
    const blob = await response.blob();

    const ref = firebase.storage().ref().child(`avatar/${uid}`);
    return ref.put(blob);
  };

  const updatePhotoUrl = () => {
    firebase
      .storage()
      .ref(`avatar/${uid}`)
      .getDownloadURL()
      .then(async (response) => {
        console.log("Resp: ", response);
        const update = {
          photoURL: response,
        };
        await firebase.auth().currentUser.updateProfile(update);
        setIsLoading(false);
      })
      .catch(() => {
        toastRef.current.show("Error al actualizar el avatar.");
      });
  };

  return (
    <View style={styles.viewUserInfo}>
      <Avatar
        rounded
        size="large"
        showEditButton
        onEditPress={changeAvatar}
        containerStyle={styles.userInfoAvatar}
        source={
          photoURL
            ? { uri: photoURL }
            : require("../../../assets/img/avatar-default.jpg")
        }
      />
      <View>
        <Text style={styles.displayName}>
          {displayName ? displayName : "Anónimo"}
        </Text>
        <Text>{email ? email : "No definido"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewUserInfo: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    paddingTop: 30,
    paddingBottom: 30,
  },
  userInfoAvatar: {
    marginRight: 20,
  },
  displayName: {
    fontWeight: "bold",
    paddingBottom: 5,
  },
});
