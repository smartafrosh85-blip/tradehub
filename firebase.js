const firebaseConfig = {
    apiKey: "AIzaSyCbi35OFYX8IsKRmD4JKRMSHL8id-b_nSg",
    authDomain: "frostywrld-store.firebaseapp.com",
    projectId: "frostywrld-store",
    storageBucket: "frostywrld-store.firebasestorage.app",
    messagingSenderId: "757419905808",
    appId: "1:757419905808:web:e9798803b3ccfbc5ec4b95",
    measurementId: "G-4QSZET3WC"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();