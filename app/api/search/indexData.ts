import { algoliasearch } from "algoliasearch";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig"; // Adjust the path to your Firebase config

const client = algoliasearch("WSKDUTHG0R", "a38dfff5a5d950119a771f88fa972657");

const indexData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "restaurants"));
    const objects = querySnapshot.docs.map((doc) => ({
      objectID: doc.id,
      ...doc.data(),
    }));

    const response = await client.saveObjects({
      indexName: "restaurant_index",
      objects,
    }); // Await the saveObjects call
    console.log("Successfully indexed objects!", response); // Log the response
  } catch (error) {
    console.error("Error indexing objects:", error);
  }
};

indexData();
