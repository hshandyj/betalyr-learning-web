import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
    getFirebaseApiKey,
    getFirebaseAuthDomain,
    getFirebaseProjectId,
    getFirebaseStorageBucket,
    getFirebaseMessagingSenderId,
    getFirebaseAppId,
    getFirebaseMeasurementId,
} from "@/config/getEnvConfig";

// 检查是否在客户端环境
const isClient = typeof window !== 'undefined';

// 初始化 Firebase
let app;
let auth: Auth | undefined = undefined;

// 只在客户端环境初始化Firebase
if (isClient) {
    try {
        const firebaseConfig = {
            apiKey: getFirebaseApiKey(),
            authDomain: getFirebaseAuthDomain(),
            projectId: getFirebaseProjectId(),
            storageBucket: getFirebaseStorageBucket(),
            messagingSenderId: getFirebaseMessagingSenderId(),
            appId: getFirebaseAppId(),
            measurementId: getFirebaseMeasurementId(),
        };

        // 如果apiKey为空，则不初始化Firebase
        if (firebaseConfig.apiKey) {
            app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            auth = getAuth(app);
        } else {
            console.warn('Firebase API Key不存在，Firebase未初始化');
        }
    } catch (error) {
        console.error('Firebase初始化失败:', error);
    }
}

export { app, auth };
