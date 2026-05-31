import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXCB82A4mxR9q8jky1FwTx579hLfMaGfU",
  authDomain: "bmh-family-tasks.firebaseapp.com",
  projectId: "bmh-family-tasks",
  storageBucket: "bmh-family-tasks.firebasestorage.app",
  messagingSenderId: "373260170939",
  appId: "1:373260170939:web:4d2ae9d88be1bce29f1b9e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
