// Copy this file to firebase.js and replace the placeholder values.

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

firebase.initializeApp(firebaseConfig);

// Replace this URL with the URL of your deployed Firebase function.
window.visitNotifyUrl = 'https://us-central1-YOUR_PROJECT.cloudfunctions.net/notifyVisit';
