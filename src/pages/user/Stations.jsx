import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import {
  MapPin,
  Zap,
  Star,
  Search,
  Loader2,
  BatteryCharging,
  Heart,
} from "lucide-react";

import { db } from "../../firebase/firebase";

import { useAuth } from "../../context/AuthContext";


function Stations() {

  const [stations, setStations] = useState([]);

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [bookingLoading, setBookingLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [favorites, setFavorites] = useState([]);

  const [favoriteLoading, setFavoriteLoading] = useState(true);

  const [favoriteActionId, setFavoriteActionId] = useState(null);

  const navigate = useNavigate();

  const { user } = useAuth();


  // ==========================================
  // FETCH USER FAVORITES IN REAL TIME
  // ==========================================

  useEffect(() => {

    if (!user) {
      setFavorites([]);
      setFavoriteLoading(false);
      return;
    }

    setFavoriteLoading(true);

    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {

        if (!snapshot.exists()) {
          setFavorites([]);
        } else {
          setFavorites(
            snapshot.data()?.favorites || []
          );
        }

        setFavoriteLoading(false);
      },
      (error) => {
        console.error(
          "Fetching favorites error:",
          error
        );
        setFavorites([]);
        setFavoriteLoading(false);
      }
    );

    return () => unsubscribe();

  }, [user]);


  // ==========================================
  // CHECK FAVORITE
  // ==========================================

  const isFavorite = (stationId) => {

    return favorites.some(
      (favorite) =>
        String(favorite?.id) ===
        String(stationId)
    );

  };


  // ==========================================
  // ADD / REMOVE FAVORITE
  // ==========================================

  const toggleFavorite = async (station) => {

    if (!user) {
      navigate("/login");
      return;
    }

    if (!station?.id) return;

    setFavoriteActionId(station.id);

    try {

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const existingFavorite =
        favorites.find(
          (favorite) =>
            String(favorite?.id) ===
            String(station.id)
        );

      if (existingFavorite) {

        await updateDoc(
          userRef,
          {
            favorites: arrayRemove(
              existingFavorite
            ),
          }
        );

      } else {

        // Save only station information needed
        // by the Favorites page. This keeps the
        // user document reasonably small.
        const favoriteStation = {
          id: station.id,
          name: station.name || "",
          operator: station.operator || "",
          address: station.address || "",
          city: station.city || "",
          rating: station.rating || "",
          openingHours:
            station.openingHours || "24/7",
          chargers: station.chargers || [],
        };

        await updateDoc(
          userRef,
          {
            favorites: arrayUnion(
              favoriteStation
            ),
          }
        );

      }

    } catch (error) {

      console.error(
        "Updating favorite error:",
        error
      );

      setError(
        "Unable to update favorite. Please try again."
      );

    } finally {

      setFavoriteActionId(null);

    }

  };


  // ==========================================
  // FETCH STATIONS IN REAL TIME
  // ==========================================

  useEffect(() => {

    setLoading(true);
    setError("");

    const stationsRef =
      collection(db, "stations");


    const unsubscribe =
      onSnapshot(

        stationsRef,

        (snapshot) => {

          const stationList =
            snapshot.docs.map(
              (stationDoc) => ({

                id: stationDoc.id,

                ...stationDoc.data(),

              })
            );


          setStations(stationList);

          setLoading(false);

        },

        (error) => {

          console.error(
            "Fetching stations error:",
            error
          );

          setError(
            "Unable to load charging stations."
          );

          setLoading(false);

        }

      );


    return () => {
      unsubscribe();
    };

  }, []);


  // ==========================================
  // FETCH BOOKINGS IN REAL TIME
  // ==========================================

  useEffect(() => {

    setBookingLoading(true);

    const bookingsRef =
      collection(db, "bookings");


    const unsubscribe =
      onSnapshot(

        bookingsRef,

        (snapshot) => {

          const bookingList =
            snapshot.docs.map(
              (bookingDoc) => ({

                id: bookingDoc.id,

                ...bookingDoc.data(),

              })
            );


          setBookings(bookingList);

          setBookingLoading(false);

        },

        (error) => {

          console.error(
            "Fetching bookings error:",
            error
          );

          setBookings([]);

          setBookingLoading(false);

        }

      );


    return () => {
      unsubscribe();
    };

  }, []);


  // ==========================================
  // CHECK WHETHER BOOKING IS ACTIVE
  // ==========================================

  const isBookingActive = (booking) => {

    const status = String(
      booking.status || ""
    ).toLowerCase();

    const paymentStatus = String(
      booking.paymentStatus || ""
    ).toLowerCase();


    // These statuses release the charger.

    const inactiveStatuses = [
      "cancelled",
      "canceled",
      "completed",
      "complete",
      "refunded",
      "expired",
      "failed",
    ];


    if (
      inactiveStatuses.includes(status)
    ) {
      return false;
    }


    // A cancelled/refunded/failed payment
    // must also release the charger.

    if (
      [
        "cancelled",
        "canceled",
        "refunded",
        "failed",
      ].includes(paymentStatus)
    ) {
      return false;
    }


    // If the booking has an end time and
    // that time has passed, release charger.

    const endValue =
      booking.endDateTime ||
      booking.endAt ||
      booking.endTime ||
      booking.end;


    if (endValue) {

      const endDate =
        parseBookingDate(
          endValue,
          booking.date ||
          booking.bookingDate
        );


      if (
        endDate &&
        new Date() >= endDate
      ) {
        return false;
      }

    }


    // IMPORTANT:
    // A paid/confirmed booking reserves
    // the charger immediately.
    //
    // We intentionally do NOT wait for the
    // charging start time. Otherwise another
    // user could book the same charger before
    // the first user's session starts.

    if (
      status === "confirmed" ||
      paymentStatus === "paid"
    ) {
      return true;
    }


    // Also support active charging states.

    if (
      [
        "active",
        "charging",
        "in-progress",
        "in_progress",
      ].includes(status)
    ) {
      return true;
    }


    return false;

  };


  // ==========================================
  // PARSE BOOKING DATE
  // ==========================================

  function parseBookingDate(
    value,
    fallbackDate
  ) {

    if (!value) {
      return null;
    }


    // Firestore Timestamp

    if (
      typeof value?.toDate ===
      "function"
    ) {

      return value.toDate();

    }


    // JS Date

    if (
      value instanceof Date
    ) {

      return value;

    }


    // String / number

    const stringValue =
      String(value);


    // If it is already a complete
    // date/time string.

    let parsed =
      new Date(stringValue);


    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {

      return parsed;

    }


    // If only time was supplied,
    // combine it with booking date.

    if (
      fallbackDate &&
      stringValue
    ) {

      const date =
        parseBookingDate(
          fallbackDate
        );


      if (date) {

        const timeParts =
          stringValue
            .split(":")
            .map(Number);


        const hours =
          Number(timeParts[0]) || 0;

        const minutes =
          Number(timeParts[1]) || 0;


        const result =
          new Date(date);


        result.setHours(
          hours,
          minutes,
          0,
          0
        );


        return result;

      }

    }


    return null;

  }


  // ==========================================
  // CHECK CHARGER BOOKING
  // ==========================================

  const isChargerBooked = (
    station,
    charger,
    chargerIndex
  ) => {

    const stationId =
      String(station.id);


    const chargerId =
      String(
        charger.id ||
        charger.chargerId ||
        chargerIndex + 1
      );


    return bookings.some(
      (booking) => {

        // ======================================
        // BOOKING MUST STILL BE ACTIVE
        // ======================================

        if (
          !isBookingActive(booking)
        ) {
          return false;
        }


        // ======================================
        // STATION MATCH
        // ======================================

        const bookingStationId =
          String(
            booking.stationId ||
            booking.stationID ||
            booking.station?.id ||
            ""
          );


        const bookingStationName =
          String(
            booking.stationName ||
            booking.station?.name ||
            ""
          )
            .toLowerCase()
            .trim();


        const stationName =
          String(
            station.name || ""
          )
            .toLowerCase()
            .trim();


        const stationMatches =
          bookingStationId === stationId ||
          (
            bookingStationName &&
            stationName &&
            bookingStationName === stationName
          );


        if (!stationMatches) {
          return false;
        }


        // ======================================
        // CHARGER ID MATCH
        // ======================================

        const bookingChargerId =
          String(
            booking.chargerId ||
            booking.chargerID ||
            booking.selectedChargerId ||
            booking.charger?.id ||
            ""
          );


        if (
          bookingChargerId &&
          bookingChargerId === chargerId
        ) {
          return true;
        }


        // ======================================
        // CHARGER INDEX MATCH
        //
        // Payment.jsx stores chargerIndex.
        // Example:
        // chargerIndex: 0 = first charger
        // chargerIndex: 1 = second charger
        // ======================================

        if (
          booking.chargerIndex !==
            undefined &&
          booking.chargerIndex !== null
        ) {

          const bookedIndex =
            Number(
              booking.chargerIndex
            );


          if (
            bookedIndex === chargerIndex
          ) {
            return true;
          }

        }


        // ======================================
        // CHARGER NUMBER MATCH
        // ======================================

        if (
          booking.chargerNumber !==
            undefined &&
          booking.chargerNumber !== null
        ) {

          const bookedNumber =
            Number(
              booking.chargerNumber
            );


          if (
            bookedNumber ===
            chargerIndex + 1
          ) {
            return true;
          }

        }


        // ======================================
        // CHARGER NAME MATCH
        // ======================================

        const bookingChargerName =
          String(
            booking.chargerName ||
            booking.charger?.name ||
            ""
          )
            .toLowerCase()
            .trim();


        const chargerName =
          String(
            charger.name ||
            `Charger ${chargerIndex + 1}`
          )
            .toLowerCase()
            .trim();


        if (
          bookingChargerName &&
          bookingChargerName === chargerName
        ) {
          return true;
        }


        return false;

      }
    );

  };


  // ==========================================
  // GET ACTUAL CHARGER STATUS
  // ==========================================

  const getChargerStatus = (
    station,
    charger,
    chargerIndex
  ) => {

    const booked =
      isChargerBooked(
        station,
        charger,
        chargerIndex
      );


    if (booked) {

      return "occupied";

    }


    // Keep maintenance status from
    // station document.

    if (
      charger.status ===
      "maintenance"
    ) {

      return "maintenance";

    }


    return "available";

  };


  // ==========================================
  // SEARCH
  // ==========================================

  const filteredStations =
    stations.filter(
      (station) => {

        const searchText =
          search
            .toLowerCase()
            .trim();


        if (!searchText) {

          return true;

        }


        return (

          station.name
            ?.toLowerCase()
            .includes(searchText) ||

          station.operator
            ?.toLowerCase()
            .includes(searchText) ||

          station.city
            ?.toLowerCase()
            .includes(searchText) ||

          station.address
            ?.toLowerCase()
            .includes(searchText)

        );

      }
    );


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div
      className="
        max-w-7xl
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
            mb-2
          "
        >
          Charging network
        </p>


        <h1
          className="
            text-3xl
            sm:text-4xl
            font-bold
            text-white
          "
        >
          Find Chargers
        </h1>


        <p
          className="
            text-slate-500
            mt-2
          "
        >
          Find charging stations and check charger availability.
        </p>

      </div>


      {/* ======================================
          SEARCH
      ======================================= */}

      <div
        className="
          relative
        "
      >

        <Search
          size={20}
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
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="
            Search by station, operator, city or address...
          "
          className="
            w-full
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            pl-12
            pr-4
            py-4
            text-white
            placeholder:text-slate-600
            outline-none
            focus:border-emerald-400
            transition
          "
        />

      </div>


      {/* ======================================
          LOADING
      ======================================= */}

      {(loading ||
        bookingLoading) && (

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-12
            text-center
          "
        >

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
            Checking charger availability...
          </p>

        </div>

      )}


      {/* ======================================
          ERROR
      ======================================= */}

      {!loading &&
        !bookingLoading &&
        error && (

        <div
          className="
            bg-red-500/10
            border
            border-red-500/20
            rounded-2xl
            p-5
            text-red-400
          "
        >
          {error}
        </div>

      )}


      {/* ======================================
          NO STATIONS
      ======================================= */}

      {!loading &&
        !bookingLoading &&
        !error &&
        filteredStations.length ===
          0 && (

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-12
            text-center
          "
        >

          <div
            className="
              w-16
              h-16
              mx-auto
              rounded-2xl
              bg-emerald-400/10
              flex
              items-center
              justify-center
            "
          >

            <MapPin
              size={28}
              className="
                text-emerald-400
              "
            />

          </div>


          <h2
            className="
              text-xl
              font-semibold
              text-white
              mt-5
            "
          >
            No charging stations found
          </h2>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Try searching for another location.
          </p>

        </div>

      )}


      {/* ======================================
          STATIONS
      ======================================= */}

      {!loading &&
        !bookingLoading &&
        !error &&
        filteredStations.length >
          0 && (

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-5
          "
        >

          {filteredStations.map(
            (station) => {

              const chargers =
                station.chargers || [];


              // ==================================
              // CALCULATE REAL-TIME STATUS
              // ==================================

              const chargerStatuses =
                chargers.map(
                  (
                    charger,
                    index
                  ) => (

                    getChargerStatus(
                      station,
                      charger,
                      index
                    )

                  )
                );


              const available =
                chargerStatuses.filter(
                  (status) =>
                    status ===
                    "available"
                ).length;


              const occupied =
                chargerStatuses.filter(
                  (status) =>
                    status ===
                    "occupied"
                ).length;


              const maintenance =
                chargerStatuses.filter(
                  (status) =>
                    status ===
                    "maintenance"
                ).length;


              const total =
                chargers.length;


              const isAvailable =
                available > 0;


              const connectorTypes = [
                ...new Set(
                  chargers
                    .map(
                      (charger) =>
                        charger.connectorType
                    )
                    .filter(Boolean)
                ),
              ];


              const maxPower =
                chargers.length > 0
                  ? Math.max(
                      ...chargers.map(
                        (charger) =>
                          Number(
                            charger.power
                          ) || 0
                      )
                    )
                  : 0;


              return (

                <div
                  key={station.id}
                  className="
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-2xl
                    overflow-hidden
                    hover:border-slate-700
                    transition
                  "
                >


                  {/* =================================
                      HEADER
                  ================================== */}

                  <div
                    className="
                      p-5
                      sm:p-6
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          gap-4
                          min-w-0
                        "
                      >

                        <div
                          className="
                            w-12
                            h-12
                            rounded-xl
                            bg-emerald-400/10
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                        >

                          <Zap
                            size={23}
                            className="
                              text-emerald-400
                            "
                          />

                        </div>


                        <div
                          className="
                            min-w-0
                          "
                        >

                          <h2
                            className="
                              text-xl
                              font-bold
                              text-white
                              truncate
                            "
                          >
                            {station.name}
                          </h2>


                          <p
                            className="
                              text-sm
                              text-slate-500
                              mt-1
                            "
                          >
                            {station.operator}
                          </p>

                        </div>

                      </div>


                      {/* STATUS */}

                      <span
                        className={`
                          shrink-0
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          font-semibold

                          ${
                            isAvailable
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400"
                          }
                        `}
                      >

                        <span
                          className="
                            inline-block
                            w-1.5
                            h-1.5
                            rounded-full
                            bg-current
                            mr-2
                          "
                        />

                        {isAvailable
                          ? "Available"
                          : "Full"}

                      </span>


                      {/* FAVORITE */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(station)
                        }
                        disabled={
                          favoriteLoading ||
                          favoriteActionId === station.id
                        }
                        aria-label={
                          isFavorite(station.id)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        title={
                          isFavorite(station.id)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        className={`
                          w-10
                          h-10
                          rounded-xl
                          border
                          flex
                          items-center
                          justify-center
                          shrink-0
                          transition
                          disabled:opacity-50
                          disabled:cursor-wait
                          ${
                            isFavorite(station.id)
                              ? "bg-red-400/10 border-red-400/20 text-red-400"
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-400/30"
                          }
                        `}
                      >

                        <Heart
                          size={18}
                          fill={
                            isFavorite(station.id)
                              ? "currentColor"
                              : "none"
                          }
                        />

                      </button>

                    </div>


                    {/* =================================
                        LOCATION + RATING
                    ================================== */}

                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-3
                        mt-5
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          gap-2
                        "
                      >

                        <MapPin
                          size={17}
                          className="
                            text-slate-500
                            mt-0.5
                            shrink-0
                          "
                        />


                        <p
                          className="
                            text-sm
                            text-slate-400
                          "
                        >

                          {station.address}

                          {station.city &&
                            `, ${station.city}`}

                        </p>

                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <Star
                          size={16}
                          className="
                            text-amber-400
                          "
                          fill="currentColor"
                        />


                        <span
                          className="
                            text-sm
                            text-white
                            font-semibold
                          "
                        >
                          {station.rating ||
                            "New"}
                        </span>


                        <span
                          className="
                            text-slate-700
                          "
                        >
                          •
                        </span>


                        <span
                          className="
                            text-sm
                            text-slate-500
                          "
                        >
                          {station.openingHours ||
                            "24/7"}
                        </span>

                      </div>

                    </div>


                    {/* =================================
                        QUICK STATS
                    ================================== */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        sm:grid-cols-4
                        gap-3
                        mt-6
                      "
                    >

                      {/* TOTAL */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-4
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          Chargers
                        </p>


                        <p
                          className="
                            text-xl
                            font-bold
                            text-white
                            mt-1
                          "
                        >
                          {total}
                        </p>

                      </div>


                      {/* AVAILABLE */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-4
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          Available
                        </p>


                        <p
                          className="
                            text-xl
                            font-bold
                            text-emerald-400
                            mt-1
                          "
                        >
                          {available}
                        </p>

                      </div>


                      {/* CONNECTORS */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-4
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          Connectors
                        </p>


                        <p
                          className="
                            text-sm
                            font-semibold
                            text-white
                            mt-2
                          "
                        >

                          {connectorTypes.length >
                          0
                            ? connectorTypes.join(
                                ", "
                              )
                            : "—"}

                        </p>

                      </div>


                      {/* POWER */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-4
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          Max Power
                        </p>


                        <p
                          className="
                            text-xl
                            font-bold
                            text-white
                            mt-1
                          "
                        >

                          {maxPower}

                          <span
                            className="
                              text-sm
                              font-normal
                              text-slate-500
                              ml-1
                            "
                          >
                            kW
                          </span>

                        </p>

                      </div>

                    </div>


                    {/* =================================
                        CHARGING POINTS
                    ================================== */}

                    {chargers.length >
                      0 && (

                      <div
                        className="
                          mt-7
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            mb-3
                          "
                        >

                          <div>

                            <h3
                              className="
                                text-sm
                                font-semibold
                                text-white
                              "
                            >
                              Charging Points
                            </h3>


                            <p
                              className="
                                text-xs
                                text-slate-500
                                mt-1
                              "
                            >
                              {available} of{" "}
                              {total} available
                            </p>

                          </div>


                          <div
                            className="
                              flex
                              items-center
                              gap-3
                              text-xs
                            "
                          >

                            {occupied >
                              0 && (

                              <span
                                className="
                                  text-red-400
                                "
                              >
                                {occupied} occupied
                              </span>

                            )}


                            {maintenance >
                              0 && (

                              <span
                                className="
                                  text-amber-400
                                "
                              >
                                {maintenance} maintenance
                              </span>

                            )}

                          </div>

                        </div>


                        <div
                          className="
                            space-y-2
                          "
                        >

                          {chargers.map(
                            (
                              charger,
                              index
                            ) => {

                              const actualStatus =
                                chargerStatuses[
                                  index
                                ];


                              return (

                                <div
                                  key={
                                    charger.id ||
                                    index
                                  }
                                  className="
                                    bg-slate-950
                                    border
                                    border-slate-800
                                    rounded-xl
                                    p-4
                                  "
                                >

                                  <div
                                    className="
                                      flex
                                      flex-col
                                      sm:flex-row
                                      sm:items-center
                                      gap-4
                                    "
                                  >

                                    {/* IDENTITY */}

                                    <div
                                      className="
                                        flex
                                        items-center
                                        gap-3
                                        flex-1
                                        min-w-0
                                      "
                                    >

                                      <div
                                        className="
                                          w-10
                                          h-10
                                          rounded-lg
                                          bg-slate-900
                                          flex
                                          items-center
                                          justify-center
                                          shrink-0
                                        "
                                      >

                                        <Zap
                                          size={17}
                                          className="
                                            text-emerald-400
                                          "
                                        />

                                      </div>


                                      <div>

                                        <p
                                          className="
                                            text-sm
                                            font-semibold
                                            text-white
                                          "
                                        >
                                          {charger.name ||
                                            `Charger ${
                                              index +
                                              1
                                            }`}
                                        </p>


                                        <p
                                          className="
                                            text-xs
                                            text-slate-500
                                            mt-1
                                          "
                                        >
                                          {charger.connectorType ||
                                            "Connector"}
                                        </p>

                                      </div>

                                    </div>


                                    {/* POWER */}

                                    <div
                                      className="
                                        sm:w-24
                                      "
                                    >

                                      <p
                                        className="
                                          text-xs
                                          text-slate-600
                                        "
                                      >
                                        Power
                                      </p>


                                      <p
                                        className="
                                          text-sm
                                          text-white
                                          font-medium
                                          mt-1
                                        "
                                      >
                                        {charger.power ||
                                          "—"}{" "}
                                        kW
                                      </p>

                                    </div>


                                    {/* PRICE */}

                                    <div
                                      className="
                                        sm:w-28
                                      "
                                    >

                                      <p
                                        className="
                                          text-xs
                                          text-slate-600
                                        "
                                      >
                                        Price
                                      </p>


                                      <p
                                        className="
                                          text-sm
                                          text-white
                                          font-medium
                                          mt-1
                                        "
                                      >
                                        ₹
                                        {charger.pricePerKwh ||
                                          "—"}

                                        <span
                                          className="
                                            text-xs
                                            text-slate-500
                                          "
                                        >
                                          /kWh
                                        </span>

                                      </p>

                                    </div>


                                    {/* STATUS */}

                                    <div
                                      className="
                                        sm:w-28
                                        sm:text-right
                                      "
                                    >

                                      <span
                                        className={`
                                          inline-flex
                                          items-center
                                          px-2.5
                                          py-1
                                          rounded-full
                                          text-xs
                                          font-medium

                                          ${
                                            actualStatus ===
                                            "available"
                                              ? "bg-emerald-400/10 text-emerald-400"
                                              : actualStatus ===
                                                "occupied"
                                              ? "bg-red-400/10 text-red-400"
                                              : "bg-amber-400/10 text-amber-400"
                                          }
                                        `}
                                      >

                                        <span
                                          className="
                                            w-1.5
                                            h-1.5
                                            rounded-full
                                            bg-current
                                            mr-1.5
                                          "
                                        />

                                        {actualStatus ===
                                        "available"
                                          ? "Available"
                                          : actualStatus ===
                                            "occupied"
                                          ? "Charging"
                                          : "Maintenance"}

                                      </span>

                                    </div>

                                  </div>

                                </div>

                              );

                            }
                          )}

                        </div>

                      </div>

                    )}


                    {/* =================================
                        AMENITIES
                    ================================== */}

                    {station.amenities
                      ?.length > 0 && (

                      <div
                        className="
                          flex
                          flex-wrap
                          gap-2
                          mt-6
                        "
                      >

                        {station.amenities.map(
                          (amenity) => (

                            <span
                              key={amenity}
                              className="
                                px-3
                                py-1.5
                                rounded-lg
                                bg-slate-800
                                text-xs
                                text-slate-400
                              "
                            >
                              {amenity}
                            </span>

                          )
                        )}

                      </div>

                    )}

                  </div>


                  {/* =================================
                      ACTION FOOTER
                  ================================== */}

                  <div
                    className="
                      border-t
                      border-slate-800
                      p-4
                      sm:px-6
                      flex
                      flex-col
                      sm:flex-row
                      gap-3
                    "
                  >

                    <button
                      disabled={
                        !isAvailable
                      }
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
                        flex-1
                        flex
                        items-center
                        justify-center
                        gap-2
                        bg-emerald-400
                        hover:bg-emerald-300
                        disabled:bg-slate-800
                        disabled:text-slate-600
                        text-slate-950
                        disabled:cursor-not-allowed
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


                      {isAvailable
                        ? "Book a charger"
                        : "Currently full"}

                    </button>


                    {/* <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/stations/${station.id}`,
                          {
                            state: {
                              station,
                            },
                          }
                        )
                      }
                      className="
                        sm:w-36
                        flex
                        items-center
                        justify-center
                        px-5
                        py-3
                        rounded-xl
                        border
                        border-slate-700
                        text-slate-300
                        hover:text-white
                        hover:border-slate-500
                        transition
                      "
                    >
                      View details
                    </button> */}

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


export default Stations;