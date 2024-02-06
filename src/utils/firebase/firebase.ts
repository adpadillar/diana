// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVR2HRmyPpB8UIxAHQ4-pZsFmv9wdkrkQ",
  authDomain: "spotify-diana.firebaseapp.com",
  projectId: "spotify-diana",
  storageBucket: "spotify-diana.appspot.com",
  messagingSenderId: "861725592557",
  appId: "1:861725592557:web:1923209ae672a87cfb35e4",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
