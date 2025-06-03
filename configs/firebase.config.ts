// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA9iSlGFuoW0RYR6vBIZ5o_tu8OvGZAFp4",
    authDomain: "yoshida-co.firebaseapp.com",
    projectId: "yoshida-co",
    storageBucket: "yoshida-co.firebasestorage.app",
    messagingSenderId: "416699039134",
    appId: "1:416699039134:web:3ec5fbf2816f1008776a8f",
    measurementId: "G-1FJQY3974J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);