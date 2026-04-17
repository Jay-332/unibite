import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDty3HNwGe21rTBI3GW-t55PK-FjFjr72k",
  authDomain: "unibites-1c318.firebaseapp.com",
  projectId: "unibites-1c318",
  storageBucket: "unibites-1c318.appspot.com",
  messagingSenderId: "914735482343",
  appId: "1:914735482343:web:98b5bcd47ba5ac96cee942"
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export { firebaseApp, firebaseAuth, firestore };
