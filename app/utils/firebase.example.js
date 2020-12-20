import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "secret",
  authDomain: "secret",
  projectId: "secret",
  storageBucket: "secret",
  messagingSenderId: "secret",
  appId: "secret",
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
