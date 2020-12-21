import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import * as firebase from "firebase";
import { isEmpty, size } from "lodash";
import { validateEmail } from "../../utils/validations";
import { useNavigation } from "@react-navigation/native";
import Loading from "../Loading";

export default function LoginForm(props) {
  const { toastRef } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormValue);
  const navigation = useNavigation();

  //Valores por defecto del formulario
  function defaultFormValue() {
    return {
      email: "",
      password: "",
    };
  }

  const onSubmit = () => {
    console.log("ONSUBMIT: ", formData);
    if (isEmpty(formData.email) || isEmpty(formData.password)) {
      toastRef.current.show("Debe ingresar un email y contraseña.");
    } else if (!validateEmail(formData.email)) {
      toastRef.current.show("El email no es correcto.");
    } else if (size(formData.password) < 6) {
      toastRef.current.show(
        "La contraseña debe contener al menos 6 caracteres."
      );
    } else {
      setIsLoading(true);
      firebase
        .auth()
        .signInWithEmailAndPassword(formData.email, formData.password)
        .then(() => {
          setIsLoading(false);
          navigation.navigate("account");
        })
        .catch(() => {
          setIsLoading(false);
          toastRef.current.show("Email o contraseña incorrecta.");
        });
    }
  };

  const onChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  return (
    <View style={styles.formContainer}>
      <Input
        placeholder="Correo electrónico"
        containerStyle={styles.inputForm}
        onChange={(e) => onChange(e, "email")}
        rightIcon={
          <Icon
            type="material-community"
            name="at"
            iconStyle={styles.iconRight}
          ></Icon>
        }
      />
      <Input
        placeholder="Contraseña"
        containerStyle={styles.inputForm}
        onChange={(e) => onChange(e, "password")}
        secureTextEntry={showPassword ? false : true}
        rightIcon={
          <Icon
            type="material-community"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.iconRight}
            onPress={() => setShowPassword(!showPassword)}
          ></Icon>
        }
      />
      <Button
        title="Iniciar sesión"
        containerStyle={styles.btnContainerLogin}
        buttonStyle={styles.btnLogin}
        onPress={onSubmit}
      />
      <Loading isVisible={isLoading} text="Iniciando sesión"></Loading>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  inputForm: {
    width: "100%",
    marginTop: 20,
  },
  btnContainerLogin: {
    marginTop: 20,
    width: "95%",
  },
  btnLogin: {
    backgroundColor: "#00a680",
  },
  iconRight: {
    color: "#C1C1C1",
  },
});
