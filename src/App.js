import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
initializeApp(firebaseConfig);

const auth = getAuth();
auth.languageCode = "it";

export default function App() {

  const reCaptchaVerifier = new RecaptchaVerifier(
    "sign-in-button",
    {
      size: "invisible",
      callback: (response) => {
        testMethod(response);
        console.log(response);
      },
    },
    auth
  );
  reCaptchaVerifier.render();
  const testMethod = (response) => {
    const phoneNumber = "08061341310";
    signInWithPhoneNumber(auth, phoneNumber, response)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        console.log(confirmationResult)
        alert("success");
      })
      .catch((error) => {
        alert("error");
      });
  };

  async function sample() {

  }

  return (
    <div id="main">
      <button id="sign-in-button" onClick={sample}>
        Setup
      </button>
    </div>
  );
}
