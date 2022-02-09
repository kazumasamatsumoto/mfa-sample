import { useRef, useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
}
const auth = firebase.auth();

export default function App() {
  const [loading, setLoading] = useState(false);
  const currentUser = useAuth();

  const emailRef = useRef();
  const passwordRef = useRef();

  useEffect(() => {
    // firebase initialization when App mounts
    firebase.initializeApp(firebaseConfig);

    // initialize firebase reCaptcha
    window.reCaptchaVerifier = new firebase.auth.RecaptchaVerifier('login-button', {
      size: 'invisible',
      callback: () => {
        /**
         * ! callback is not being fired when we click on login button
         * * same is working as expected in Vanilla JS in the repository below
         * * https://github.com/vinaysharma14/firebase-invisible-reCaptcha/blob/master/index.html
         */
      },
    });
  }, [])


  async function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function useAuth() {
    const [currentUser, setCurrentUser] = useState();

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
      return unsub;
    }, []);

    return currentUser;
  }

  async function handleSignup() {
    setLoading(true);
    await signup(emailRef.current.value, passwordRef.current.value);
    setLoading(false);
  }

  async function handleLogin() {
    setLoading(true);
    try {
      await login(emailRef.current.value, passwordRef.current.value);
    } catch {
      alert("Error!");
    }
    setLoading(false);
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
    } catch {
      alert("Error");
    }
    setLoading(false);
  }

  const setup = async () => {
    const phoneNumber = "08061341310";
    const user = auth.currentUser;
    user.multiFactor.getSession().then(function (multiFactorSession) {
      var phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession,
      };
      const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
      return phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        window.reCaptchaVerifier
      );
    });
    // .then(function(verificationId) {
    //   var cred = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
    //   var multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
    //   // Complete enrollment.
    //   return user.multiFactor.enroll(multiFactorAssertion, mfaDisplayName);
    // })

    alert("Code sent to your phone!");
  };

  return (
    <div id="main">
      <div id="captcha"></div>
      <div>Currently logged in as: {currentUser?.email}</div>
      <div id="fields">
        <input ref={emailRef} placeholder="Email" />
        <input ref={passwordRef} type="password" placeholder="Password" />
      </div>

      <button disabled={loading || currentUser} onClick={handleSignup}>
        Sign up
      </button>
      <button disabled={loading || currentUser} onClick={handleLogin}>
        Log in
      </button>
      <button disabled={loading || !currentUser} onClick={handleLogout}>
        Log out
      </button>
      <button
        id="login-button"
        disabled={loading || !currentUser}
        onClick={setup}
      >
        Setup
      </button>
    </div>
  );
}
