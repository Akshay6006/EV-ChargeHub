import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";


function AdminRoute({ children }) {

  const {
    user,
    loading: authLoading
  } = useAuth();


  const [checkingAdmin, setCheckingAdmin] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);


  useEffect(() => {

    const checkAdmin = async () => {

    
      if (authLoading) {
        return;
      }

      if (!user) {

        setCheckingAdmin(false);
        setIsAdmin(false);

        return;
      }

      if (!user.emailVerified) {

        setCheckingAdmin(false);
        setIsAdmin(false);

        return;
      }


      try {

        const userRef = doc(
          db,
          "users",
          user.uid
        );


        const userSnapshot =
          await getDoc(userRef);


        if (!userSnapshot.exists()) {

          console.log(
            "Admin check: user profile not found"
          );

          setIsAdmin(false);

          return;
        }


        const data =
          userSnapshot.data();


        console.log(
          "Admin check user data:",
          data
        );


        if (data.role === "admin") {

          setIsAdmin(true);

        } else {

          setIsAdmin(false);

        }

      } catch (error) {

        console.error(
          "Admin check error:",
          error
        );

        setIsAdmin(false);

      } finally {

        setCheckingAdmin(false);

      }

    };


    checkAdmin();

  }, [user, authLoading]);



  if (
    authLoading ||
    checkingAdmin
  ) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Checking admin permissions...
          </p>

        </div>

      </div>

    );

  }



  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }



  if (!user.emailVerified) {

    return (
      <Navigate
        to="/verify-email"
        replace
      />
    );

  }


  if (!isAdmin) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  return children;

}


export default AdminRoute;