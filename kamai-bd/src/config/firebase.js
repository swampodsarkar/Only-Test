import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, child, push, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDtq1vLVZ9D3CBis6FFSpt8psERGyTG6YM",
  authDomain: "gen-z-airdrop.firebaseapp.com",
  databaseURL: "https://gen-z-airdrop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gen-z-airdrop",
  storageBucket: "gen-z-airdrop.firebasestorage.app",
  messagingSenderId: "1056087088959",
  appId: "1:1056087088959:web:2d15418429c2f378f2bd8a",
  measurementId: "G-CKB3HP9D31"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, get, update, child, push, serverTimestamp };
export default app;
