import { useEffect, useState } from "react";

import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import {
  Heart,
  MapPin,
  Zap,
  BatteryCharging,
  Loader2,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";


function Favorites() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [favorites, setFavorites] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  // ==========================================
  // LOAD FAVORITE STATIONS
  // ==========================================

  useEffect(() => {

    if (!user) {

      setFavorites([]);

      setLoading(false);

      return;

    }


    const userRef = doc(
      db,
      "users",
      user.uid
    );


    const unsubscribe =
      onSnapshot(

        userRef,

        (snapshot) => {

          if (!snapshot.exists()) {

            setFavorites([]);

            setLoading(false);

            return;

          }


          const data =
            snapshot.data();


          setFavorites(
            data.favorites || []
          );


          setLoading(false);

        },

        (error) => {

          console.error(
            "Loading favorites error:",
            error
          );

          setFavorites([]);

          setLoading(false);

        }

      );


    return () => {
      unsubscribe();
    };

  }, [user]);


  // ==========================================
  // REMOVE FAVORITE
  // ==========================================

  const removeFavorite =
    async (station) => {

      if (!user) return;


      try {

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );


        await updateDoc(
          userRef,
          {
            favorites:
              arrayRemove(
                station
              ),
          }
        );

      } catch (error) {

        console.error(
          "Removing favorite error:",
          error
        );

      }

    };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="
        min-h-[400px]
        flex
        items-center
        justify-center
      ">

        <div className="text-center">

          <Loader2
            size={30}
            className="
              mx-auto
              text-emerald-400
              animate-spin
            "
          />

          <p className="
            text-slate-500
            mt-4
          ">
            Loading favorites...
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="
      max-w-7xl
      mx-auto
      space-y-8
    ">


      {/* ======================================
          HEADER
      ======================================= */}

      <div>

        <p className="
          text-sm
          text-emerald-400
          font-medium
        ">
          Saved stations
        </p>


        <h1 className="
          text-3xl
          sm:text-4xl
          font-bold
          text-white
          mt-2
        ">
          Favorites
        </h1>


        <p className="
          text-slate-500
          mt-2
        ">
          Your preferred charging stations.
        </p>

      </div>


      {/* ======================================
          EMPTY STATE
      ======================================= */}

      {favorites.length === 0 ? (

        <div className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-12
          text-center
        ">

          <div className="
            w-16
            h-16
            mx-auto
            rounded-2xl
            bg-emerald-400/10
            flex
            items-center
            justify-center
          ">

            <Heart
              size={28}
              className="
                text-emerald-400
              "
            />

          </div>


          <h2 className="
            text-xl
            font-semibold
            text-white
            mt-5
          ">
            No favorite stations
          </h2>


          <p className="
            text-sm
            text-slate-500
            mt-2
          ">
            Save your frequently used charging stations here.
          </p>


          <button
            onClick={() =>
              navigate("/stations")
            }
            className="
              mt-6
              inline-flex
              items-center
              justify-center
              gap-2
              bg-emerald-400
              hover:bg-emerald-300
              text-slate-950
              font-semibold
              px-5
              py-3
              rounded-xl
              transition
            "
          >

            <MapPin size={18} />

            Find Chargers

          </button>

        </div>

      ) : (


        /* =====================================
           FAVORITE STATIONS
        ====================================== */

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-5
        ">

          {favorites.map(
            (station) => (

              <div
                key={station.id}
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  overflow-hidden
                "
              >


                {/* CARD */}

                <div className="
                  p-5
                  sm:p-6
                ">


                  {/* HEADER */}

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  ">

                    <div className="
                      flex
                      items-start
                      gap-4
                    ">

                      <div className="
                        w-12
                        h-12
                        rounded-xl
                        bg-emerald-400/10
                        flex
                        items-center
                        justify-center
                        shrink-0
                      ">

                        <Zap
                          size={23}
                          className="
                            text-emerald-400
                          "
                        />

                      </div>


                      <div>

                        <h2 className="
                          text-xl
                          font-bold
                          text-white
                        ">
                          {station.name}
                        </h2>


                        <p className="
                          text-sm
                          text-slate-500
                          mt-1
                        ">
                          {station.operator ||
                            "Charging Station"}
                        </p>

                      </div>

                    </div>


                    {/* REMOVE */}

                    <button
                      onClick={() =>
                        removeFavorite(
                          station
                        )
                      }
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-red-400/10
                        text-red-400
                        flex
                        items-center
                        justify-center
                        hover:bg-red-400/20
                        transition
                      "
                      title="Remove favorite"
                    >

                      <Trash2
                        size={17}
                      />

                    </button>

                  </div>


                  {/* LOCATION */}

                  <div className="
                    flex
                    items-start
                    gap-2
                    mt-5
                  ">

                    <MapPin
                      size={17}
                      className="
                        text-slate-500
                        mt-0.5
                        shrink-0
                      "
                    />


                    <p className="
                      text-sm
                      text-slate-400
                    ">

                      {station.address}

                      {station.city &&
                        `, ${station.city}`}

                    </p>

                  </div>


                  {/* STATS */}

                  <div className="
                    grid
                    grid-cols-2
                    gap-3
                    mt-5
                  ">


                    <div className="
                      bg-slate-950
                      border
                      border-slate-800
                      rounded-xl
                      p-4
                    ">

                      <p className="
                        text-xs
                        text-slate-500
                      ">
                        Chargers
                      </p>


                      <p className="
                        text-lg
                        font-bold
                        text-white
                        mt-1
                      ">
                        {station.chargers
                          ?.length || 0}
                      </p>

                    </div>


                    <div className="
                      bg-slate-950
                      border
                      border-slate-800
                      rounded-xl
                      p-4
                    ">

                      <p className="
                        text-xs
                        text-slate-500
                      ">
                        Location
                      </p>


                      <p className="
                        text-sm
                        font-semibold
                        text-white
                        mt-2
                      ">
                        {station.city ||
                          "—"}
                      </p>

                    </div>

                  </div>


                  {/* ACTION */}

                  <button
                    onClick={() =>
                      navigate(
                        "/bookings/new",
                        {
                          state: {
                            station,
                          },
                        }
                      )
                    }
                    className="
                      w-full
                      mt-5
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-emerald-400
                      hover:bg-emerald-300
                      text-slate-950
                      font-semibold
                      px-5
                      py-3
                      rounded-xl
                      transition
                    "
                  >

                    <BatteryCharging
                      size={18}
                    />

                    Book a charger

                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}


export default Favorites;