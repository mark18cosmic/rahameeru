import { algoliasearch } from 'algoliasearch';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/app/firebase/firebaseConfig'; // Adjust the path to your Firebase config

const client = algoliasearch('WSKDUTHG0R', '4974bf75a1ba4f880103bd8fceeeb148');

const indexData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'restaurants'));
    const objects = querySnapshot.docs.map(doc => ({
      objectID: doc.id,
      ...doc.data(),
    }));

    return client.saveObjects({ indexName: 'restaurant_index', objects });
    // console.log('Successfully indexed objects!');
  } catch (error) {
    console.error('Error indexing objects:', error);
  }
};

indexData();
