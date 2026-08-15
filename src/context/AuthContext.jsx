import { createContext, useContext, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";


const AuthContext = createContext();



export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        if (!currentUser) {

          setUser(null);
          setUserData(null);
          setLoading(false);

          return;
        }


        setUser(currentUser);


        try {

          const userRef = doc(
            db,
            "users",
            currentUser.uid
          );

          const userSnapshot = await getDoc(userRef);


          if (userSnapshot.exists()) {

            setUserData(
              userSnapshot.data()
            );

          } else {

            setUserData(null);

          }

        } catch (error) {

          console.error(
            "Error loading user profile:",
            error
          );

          setUserData(null);
        }


        setLoading(false);
      }
    );


    return () => unsubscribe();

  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  return useContext(AuthContext);

}