import React, { useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();
const querySnapshot = await getDocs(collection(db, "threads"));
querySnapshot.forEach((doc) => {
  console.log(`${doc.id} => ${doc.data()}`);
});

const Home = () => {
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       const db = getFirestore();
  //       const querySnapshot = await getDocs(collection(db, "threads"));
  //       querySnapshot.forEach((doc) => {
  //         console.log(`${doc.id} => ${doc.data()}`);
  //       });
  //     };

  //     fetchData();
  //   }, []);
  return <div>Home</div>;
};

export default Home;
