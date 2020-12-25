import { repeat } from "lodash";
import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Input, Button } from "react-native-elements";
import { size } from "lodash";
import { reauthenticate } from "../../utils/api";
import * as firebase from "firebase";

export default function ChangePasswordForm(props) {
  const passwordInputName = "password";
  const newPasswordInputName = "newPassword";
  const repeatNewPasswordInputName = "repeatNewPassword";

  const { setShowModal, toastRef } = props;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(defaultValue);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e, type) => {
    setFormData({
      ...formData,
      [type]: e.nativeEvent.text,
    });
  };

  const onSubmit = async () => {
    const nm = "La contraseña no puede estar vacía.";
    const um = "Las contraseñas no son iguales.";
    const sm = "La contraseña debe ser mayor a 5 caracteres.";
    const em = "Error al actualizar la contraseña.";
    const wm = "La contraseña no es correcta.";

    let isSetErrors = true;
    let errorsTemp = {};
    setErrors({});

    errorsTemp[passwordInputName] = !formData[passwordInputName] && nm;
    errorsTemp[newPasswordInputName] = !formData[newPasswordInputName] && nm;
    errorsTemp[repeatNewPasswordInputName] =
      !formData[repeatNewPasswordInputName] && nm;

    if (
      formData[newPasswordInputName] !== formData[repeatNewPasswordInputName]
    ) {
      errorsTemp[newPasswordInputName] = um;
      errorsTemp[repeatNewPasswordInputName] = um;
    } else if (size(formData[newPasswordInputName]) < 6) {
      errorsTemp[newPasswordInputName] = sm;
      errorsTemp[repeatNewPasswordInputName] = sm;
    } else {
      setIsLoading(true);
      await reauthenticate(formData.password)
        .then(() => {
          console.log("OK");
          firebase
            .auth()
            .currentUser.updatePassword(formData.newPassword)
            .then(() => {
              isSetErrors = false;
              setIsLoading(false);
              setShowModal(false);
              firebase.auth().signOut();
            })
            .catch((err) => {
              errorsTemp["other"] = em;
            });
        })
        .catch((err) => {
          errorsTemp[passwordInputName] = wm;
          setIsLoading(false);
        });
    }

    isSetErrors && setErrors(errorsTemp);
  };

  function defaultValue() {
    return {
      [passwordInputName]: "",
      [newPasswordInputName]: "",
      [repeatNewPasswordInputName]: "",
    };
  }

  return (
    <View style={styles.view}>
      <Input
        accessibilityLabel="password"
        placeholder="Contraseña actual"
        containerStyle={styles.input}
        secureTextEntry={showPassword ? false : true}
        onChange={(e) => onChange(e, passwordInputName)}
        errorMessage={errors[passwordInputName]}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPassword(!showPassword),
        }}
      />
      <Input
        placeholder="Nueva contraseña"
        containerStyle={styles.input}
        secureTextEntry={showPassword ? false : true}
        onChange={(e) => onChange(e, newPasswordInputName)}
        errorMessage={errors[newPasswordInputName]}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPassword(!showPassword),
        }}
      />
      <Input
        placeholder="Repetir Nueva contraseña"
        containerStyle={styles.input}
        secureTextEntry={showPassword ? false : true}
        onChange={(e) => onChange(e, repeatNewPasswordInputName)}
        errorMessage={errors[repeatNewPasswordInputName]}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPassword(!showPassword),
        }}
      />
      <Button
        title="Cambiar contraseña"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      ></Button>
      <Text>{errors.other}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: "95%",
  },
  btn: {
    backgroundColor: "#00a680",
  },
});
