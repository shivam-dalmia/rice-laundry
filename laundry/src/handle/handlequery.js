import { firestore } from "../firebase_setup/firebase";
import { collection, query, where, getDocs, getDoc, doc, orderBy } from "@firebase/firestore";

// Define a Firestore query handler function with a filter
async function queryFirestoreCollectionByCollege(college) {
  try {
    // Reference to a Firestore collection
    const collectionRef = collection(firestore, "machines");

    // Create a query with a filter to match documents with a specific college
    // Note: Removed orderBy to avoid requiring composite indexes for this demo
    const q1 = query(
      collectionRef,
      where("college", "==", college),
      where("type", "==", "washer")
    );
    const q2 = query(
      collectionRef,
      where("college", "==", college),
      where("type", "==", "dryer")
    );
    const q3 = query(
      collectionRef,
      where("college", "==", college),
      where("type", "==", "bin")
    );
    // Query documents based on the filter
    const querySnapshot = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);
    const querySnapshot3 = await getDocs(q3);

    // Initialize an array to store the results
    const results1 = [];

    // Loop through the documents and add their data to the results array
    querySnapshot.forEach((doc) => {
      // Access the data of each document
      const data = doc.data();
      data.id = doc.id;
      results1.push(data);
    });

    const results2 = [];

    // Loop through the documents and add their data to the results array
    querySnapshot2.forEach((doc) => {
      // Access the data of each document
      const data = doc.data();
      data.id = doc.id;
      results2.push(data);
    });

    const results3 = [];
    querySnapshot3.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      results3.push(data);
    });

    // Sort in memory (assuming 'number' is numeric string "1", "2", etc.)
    const sortFn = (a, b) => parseInt(a.number) - parseInt(b.number);
    results1.sort(sortFn);
    results2.sort(sortFn);
    results3.sort(sortFn);

    return [results1, results2, results3];
  } catch (error) {
    console.error("Error querying Firestore:", error);
    throw error;
  }
}


async function queryFirestoreCollectionById(documentId) {
  try {
    // Reference the document by its ID
    const documentRef = doc(firestore, "machines", documentId);

    // Get the document data
    const docSnapshot = await getDoc(documentRef);

    if (docSnapshot.exists()) {
      // Document exists, return its data
      return docSnapshot.data();
    } else {
      // Document does not exist
      throw new Error("Document not found");
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error; // Rethrow the error for handling at a higher level if needed
  }
}

export { queryFirestoreCollectionByCollege, queryFirestoreCollectionById };

