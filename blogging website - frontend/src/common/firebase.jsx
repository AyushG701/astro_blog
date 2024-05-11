// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider } from "firebase/auth";
import { getAuth, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAx0lMMO3zWmkqpNjFOFBtPXffFHHHZGxI",
  authDomain: "react-blog-site-f66c6.firebaseapp.com",
  projectId: "react-blog-site-f66c6",
  storageBucket: "react-blog-site-f66c6.appspot.com",
  messagingSenderId: "181710969507",
  appId: "1:181710969507:web:f459cf22d91e8cb2ec3d16",
  measurementId: "G-CLH22WVYRQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

//direct promise way
// function signInWithGoogle() {
//   const provider = new GoogleAuthProvider();
//   firebase
//     .auth()
//     .signInWithPopup(provider)
//     .then((result) => {
//       // User signed in successfully
//       const user = result.user;
//       console.log(user);
//     })
//     .catch((error) => {
//       // Handle errors
//       console.error(error);
//     });
// }

export const authWithGoogle = async () => {
  let user = null;
  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};
