import { useRef, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
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
  const [loading, setLoading] = useState(false);
  const currentUser = useAuth();

  const emailRef = useRef();
  const passwordRef = useRef();
  const codeRef = useRef();

  useEffect(() => {
    // initialize firebase reCaptcha
    window.reCaptchaVerifier = new RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: (response) => {
          console.log("response", response);
        },
      },
      auth
    );
  }, []);

  async function signupWithPhoneNumber() {
    const phoneNumber = "08061341310";
    const appVerifier = window.recaptchaVerifier;
    console.log(phoneNumber)
    console.log(appVerifier)
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
        // ...
        alert("success")
      })
      .catch((error) => {
        // Error; SMS not sent
        // ...
        alert("error")
      });
  }

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

  function getCodeFromUserInput() {
    window.confirmationResult
      .confirm(codeRef.current.value)
      .then((result) => {
        // User signed in successfully.
        const user = result.user;
        console.log(user);
        // ...
      })
      .catch((error) => {
        console.log(error);
        // User couldn't sign in (bad verification code?)
        // ...
      });
  }

  // const setup = async () => {
  //   const phoneNumber = "08061341310";
  //   const user = auth.currentUser;
  //   user.multiFactor.getSession().then(function (multiFactorSession) {
  //     var phoneInfoOptions = {
  //       phoneNumber: phoneNumber,
  //       session: multiFactorSession,
  //     };
  //     const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
  //     return phoneAuthProvider.verifyPhoneNumber(
  //       phoneInfoOptions,
  //       window.reCaptchaVerifier
  //     );
  //   });
  //   // .then(function(verificationId) {
  //   //   var cred = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
  //   //   var multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
  //   //   // Complete enrollment.
  //   //   return user.multiFactor.enroll(multiFactorAssertion, mfaDisplayName);
  //   // })

  //   alert("Code sent to your phone!");
  // };

  return (
    <div id="main">
      <div id="captcha"></div>
      <div>Currently logged in as: {currentUser?.email}</div>
      <div id="fields">
        <input ref={emailRef} placeholder="Email" />
        <input ref={passwordRef} type="password" placeholder="Password" />
        <input ref={codeRef} />
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
      {/* <button
        id="sign-in-button"
        disabled={loading || !currentUser}
        onClick={setup}
      >
        Setup
      </button> */}
      <button
        id="sign-in-button"
        onClick={signupWithPhoneNumber}
      >
        Setup
      </button>
      <button onClick={getCodeFromUserInput}>confirm</button>
    </div>
  );
}
