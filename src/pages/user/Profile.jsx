import { useEffect, useState } from "react";

import {
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Car,
  BatteryCharging,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";


function Profile() {

  const { user } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  // ==========================================
  // LOAD USER PROFILE
  // ==========================================

  useEffect(() => {

    if (!user) {

      setLoading(false);

      return;

    }


    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const unsubscribe =
      onSnapshot(

        userRef,

        (snapshot) => {

          if (snapshot.exists()) {

            const data =
              snapshot.data();


            setProfile(data);

            setName(
              data.name || ""
            );

            setPhone(
              data.phone || ""
            );

          } else {

            setProfile(null);

            setName("");

            setPhone("");

          }


          setLoading(false);

        },

        (error) => {

          console.error(
            "Loading profile error:",
            error
          );

          setLoading(false);

        }

      );


    return () => {
      unsubscribe();
    };

  }, [user]);


  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSave =
    async () => {

      if (!user) {
        return;
      }


      if (!name.trim()) {

        setMessage(
          "Please enter your name."
        );

        return;

      }


      try {

        setSaving(true);

        setMessage("");


        const userRef =
          doc(
            db,
            "users",
            user.uid
          );


        await updateDoc(
          userRef,
          {
            name:
              name.trim(),

            phone:
              phone.trim(),
          }
        );


        setMessage(
          "Profile updated successfully."
        );


      } catch (error) {

        console.error(
          "Updating profile error:",
          error
        );


        setMessage(
          "Unable to update profile."
        );

      } finally {

        setSaving(false);

      }

    };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div
        className="
          min-h-[400px]
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <Loader2
            size={30}
            className="
              mx-auto
              text-emerald-400
              animate-spin
            "
          />


          <p
            className="
              text-slate-500
              mt-4
            "
          >
            Loading profile...
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div
      className="
        max-w-5xl
        mx-auto
        space-y-8
      "
    >


      {/* ======================================
          HEADER
      ======================================= */}

      <div>

        <p
          className="
            text-sm
            text-emerald-400
            font-medium
          "
        >
          Account
        </p>


        <h1
          className="
            text-3xl
            sm:text-4xl
            font-bold
            text-white
            mt-2
          "
        >
          Profile
        </h1>


        <p
          className="
            text-slate-500
            mt-2
          "
        >
          Manage your EV ChargeHub account.
        </p>

      </div>


      {/* ======================================
          PROFILE HEADER CARD
      ======================================= */}

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
          sm:p-8
        "
      >

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            gap-5
          "
        >


          {/* AVATAR */}

          <div
            className="
              w-20
              h-20
              rounded-2xl
              bg-emerald-400
              text-slate-950
              flex
              items-center
              justify-center
              text-3xl
              font-bold
              shrink-0
            "
          >

            {(name ||
              user?.email ||
              "U")
              .charAt(0)
              .toUpperCase()}

          </div>


          <div className="flex-1">

            <h2
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              {name ||
                "EV Driver"}
            </h2>


            <p
              className="
                text-sm
                text-slate-500
                mt-1
              "
            >
              {user?.email || ""}
            </p>


            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
                mt-4
              "
            >

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-emerald-400/10
                  text-emerald-400
                  text-xs
                  font-semibold
                "
              >

                <Car size={13} />

                EV Driver

              </span>


              {user?.emailVerified && (

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-full
                    bg-emerald-400/10
                    text-emerald-400
                    text-xs
                    font-semibold
                  "
                >

                  <ShieldCheck
                    size={13}
                  />

                  Email verified

                </span>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          PERSONAL INFORMATION
      ======================================= */}

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          overflow-hidden
        "
      >

        <div
          className="
            p-6
            border-b
            border-slate-800
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <UserRound
              size={20}
              className="
                text-emerald-400
              "
            />


            <div>

              <h2
                className="
                  font-semibold
                  text-white
                "
              >
                Personal Information
              </h2>


              <p
                className="
                  text-xs
                  text-slate-500
                  mt-1
                "
              >
                Update the information associated with your account.
              </p>

            </div>

          </div>

        </div>


        <div
          className="
            p-6
            sm:p-8
            space-y-6
          "
        >


          {/* NAME */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-300
                mb-2
              "
            >
              Full name
            </label>


            <div className="relative">

              <UserRound
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />


              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Enter your full name"
                className="
                  w-full
                  bg-slate-950
                  border
                  border-slate-800
                  focus:border-emerald-400
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  text-white
                  outline-none
                  transition
                "
              />

            </div>

          </div>


          {/* EMAIL */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-300
                mb-2
              "
            >
              Email address
            </label>


            <div className="relative">

              <Mail
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />


              <input
                type="email"
                value={
                  user?.email || ""
                }
                disabled
                className="
                  w-full
                  bg-slate-950/60
                  border
                  border-slate-800
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  text-slate-500
                  cursor-not-allowed
                "
              />

            </div>


            <p
              className="
                text-xs
                text-slate-600
                mt-2
              "
            >
              Your login email cannot be changed here.
            </p>

          </div>


          {/* PHONE */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-300
                mb-2
              "
            >
              Phone number
            </label>


            <div className="relative">

              <Phone
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />


              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                placeholder="Enter phone number"
                className="
                  w-full
                  bg-slate-950
                  border
                  border-slate-800
                  focus:border-emerald-400
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  text-white
                  outline-none
                  transition
                "
              />

            </div>

          </div>


          {/* ROLE */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-300
                mb-2
              "
            >
              Account role
            </label>


            <div
              className="
                flex
                items-center
                justify-between
                bg-slate-950
                border
                border-slate-800
                rounded-xl
                px-4
                py-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <ShieldCheck
                  size={18}
                  className="
                    text-emerald-400
                  "
                />


                <span
                  className="
                    text-sm
                    text-white
                  "
                >
                  {profile?.role ===
                  "admin"
                    ? "Administrator"
                    : "EV Driver"}
                </span>

              </div>


              <span
                className="
                  text-xs
                  text-slate-600
                "
              >
                Managed by system
              </span>

            </div>

          </div>


          {/* MESSAGE */}

          {message && (

            <div
              className={`
                flex
                items-center
                gap-2
                text-sm
                ${
                  message.includes(
                    "successfully"
                  )
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              `}
            >

              {message.includes(
                "successfully"
              ) ? (

                <CheckCircle2
                  size={16}
                />

              ) : (

                <AlertCircle
                  size={16}
                />

              )}

              {message}

            </div>

          )}


          {/* SAVE */}

          <div
            className="
              flex
              justify-end
              pt-2
            "
          >

            <button
              onClick={handleSave}
              disabled={saving}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                bg-emerald-400
                hover:bg-emerald-300
                disabled:bg-slate-800
                disabled:text-slate-600
                text-slate-950
                font-semibold
                px-6
                py-3
                rounded-xl
                transition
                disabled:cursor-not-allowed
              "
            >

              {saving ? (

                <Loader2
                  size={18}
                  className="
                    animate-spin
                  "
                />

              ) : (

                <Save
                  size={18}
                />

              )}


              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </div>

      </div>


      {/* ======================================
          ACCOUNT INFORMATION
      ======================================= */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
        "
      >

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <CalendarDays
              size={20}
              className="
                text-emerald-400
              "
            />


            <div>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Account email
              </p>


              <p
                className="
                  text-sm
                  text-white
                  mt-1
                  break-all
                "
              >
                {user?.email ||
                  "—"}
              </p>

            </div>

          </div>

        </div>


        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <BatteryCharging
              size={20}
              className="
                text-emerald-400
              "
            />


            <div>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Account status
              </p>


              <p
                className="
                  text-sm
                  text-emerald-400
                  mt-1
                  font-medium
                "
              >
                Active
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}


export default Profile;