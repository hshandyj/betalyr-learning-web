import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirebaseApiKey,
    getFirebaseAuthDomain,
    getFirebaseProjectId,
    getFirebaseStorageBucket,
    getFirebaseMessagingSenderId,
    getFirebaseAppId,
    getFirebaseMeasurementId,
} from "@/config/getEnvConfig";

const firebaseConfig = {
    apiKey: getFirebaseApiKey(),
    authDomain: getFirebaseAuthDomain(),
    projectId: getFirebaseProjectId(),
    storageBucket: getFirebaseStorageBucket(),
    messagingSenderId: getFirebaseMessagingSenderId(),
    appId: getFirebaseAppId(),
    measurementId: getFirebaseMeasurementId(),
};

// 初始化 Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
