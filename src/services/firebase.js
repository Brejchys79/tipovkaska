// Firebase init (Firestore only; Analytics is not used in Vite dev/SSR)
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDqJ6auO0-Y8tN7qyI9gOQhLTrkVVUKh2A",
  authDomain: "tipovackaska.firebaseapp.com",
  projectId: "tipovackaska",
  storageBucket: "tipovackaska.firebasestorage.app",
  messagingSenderId: "1087955681165",
  appId: "1:1087955681165:web:1c1bd4d35c547a007d07c4",
  measurementId: "G-KL8M7CW0HR"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)