
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import { firebaseConfig } from "../src/firebase/config";

// Mock the environment if needed, or just run with ts-node
// We need to make sure we can import from ../src/firebase/config
// Since it's a relative import in the same project, it should work with ts-node if tsconfig is set up right
// specific to the script.

async function verify() {
  console.log("Initializing Firebase...");
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log("Firebase initialized. Attempting to connect to Firestore...");

    // Try to list collections or just get a document from a common collection.
    // We don't know the collections, so we can't easily list them with client SDK.
    // But we can try to access a dummy collection and see if we get a permission error or success (empty).
    
    // Actually, listing collections is an Admin SDK feature. Client SDK needs a known collection.
    // Let's guess 'users' or 'test'.
    
    const colRef = collection(db, 'users');
    const q = query(colRef, limit(1));
    
    console.log("Querying 'users' collection...");
    const snapshot = await getDocs(q);
    
    console.log(`Connection successful! Found ${snapshot.size} documents in 'users'.`);
  } catch (error: any) {
    console.error("Error connecting to Firestore:", error);
    // If it's a permission error, it means we connected but rules rejected us. That's still a "connection".
    if (error.code === 'permission-denied') {
        console.log("Connection successful (but permission denied for 'users').");
    } else {
        process.exit(1);
    }
  }
}

verify();
