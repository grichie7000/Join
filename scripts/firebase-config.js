import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCuA1XInnSHfEyGUKQQqmqRgvqfhx7dHc",
  authDomain: "join-d3707.firebaseapp.com",
  databaseURL: "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-d3707",
  storageBucket: "join-d3707.firebasestorage.app",
  messagingSenderId: "961213557325",
  appId: "1:961213557325:web:0253482ac485b4bb0e4a04"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
