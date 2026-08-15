import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  Activity,
  BatteryCharging,
  CalendarClock,
  Car,
  Clock3,
  Loader2,
  MapPin,
  RefreshCw,
  UserRound,
  Zap,
} from "lucide-react";

import { db } from "../../firebase/firebase";


function AdminCharging() {

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [now, setNow] = useState(Date.now());


  // ==========================================
  // LIVE BOOKINGS
  // ==========================================

  useEffect(() => {

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("status", "==", "active")
    );


    const unsubscribe = onSnapshot(
      bookingsQuery,

      (snapshot) => {

        const activeBookings =
          snapshot.docs.map(
            (bookingDoc) => ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            })
          );

        setBookings(
          activeBookings
        );

        setLoading(false);

      },

      (error) => {

        console.error(
          "Admin charging monitor error:",
          error
        );

        setBookings([]);

        setLoading(false);

      }
    );


    return () =>
      unsubscribe();

  }, []);


  // ==========================================
  // CLOCK
  // ==========================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        setNow(
          Date.now()
        );

      }, 1000);


    return () =>
      clearInterval(
        interval
      );

  }, []);


  // ==========================================
  // HELPERS
  // ==========================================

  function getTimestamp(
    value
  ) {

    if (!value) {
      return 0;
    }


    if (
      typeof value.toDate ===
      "function"
    ) {

      return value
        .toDate()
        .getTime();

    }


    const timestamp =
      new Date(value).getTime();


    return Number.isFinite(
      timestamp
    )
      ? timestamp
      : 0;

  }


  function getRemainingSeconds(
    booking
  ) {

    const end =
      getTimestamp(
        booking.endAt
      );


    if (!end) {
      return 0;
    }


    return Math.max(
      0,
      Math.floor(
        (end - now) / 1000
      )
    );

  }


  function formatTime(
    seconds
  ) {

    const safeSeconds =
      Math.max(
        0,
        seconds
      );


    const hours =
      Math.floor(
        safeSeconds / 3600
      );


    const minutes =
      Math.floor(
        (safeSeconds % 3600) / 60
      );


    const secs =
      safeSeconds % 60;


    if (hours > 0) {

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    }


    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  }


  function getCustomerName(
    booking
  ) {

    return (
      booking.userName ||
      booking.name ||
      booking.customerName ||
      "Customer"
    );

  }


  function getVehicleName(
    booking
  ) {

    const vehicle =
      `${booking.vehicleBrand || ""} ${booking.vehicleModel || ""}`
        .trim();


    return (
      vehicle ||
      booking.vehicleName ||
      "Vehicle not recorded"
    );

  }


  function getChargerNumber(
    booking
  ) {

    if (
      booking.chargerNumber !==
        undefined &&
      booking.chargerNumber !==
        null
    ) {

      return booking.chargerNumber;

    }


    if (
      booking.chargerIndex !==
        undefined &&
      booking.chargerIndex !==
        null
    ) {

      return (
        Number(
          booking.chargerIndex
        ) + 1
      );

    }


    return "—";

  }


  function formatStartTime(
    booking
  ) {

    const start =
      getTimestamp(
        booking.chargingStartedAt ||
        booking.startAt
      );


    if (!start) {
      return "—";
    }


    return new Date(
      start
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  }


  function formatEndTime(
    booking
  ) {

    const end =
      getTimestamp(
        booking.endAt
      );


    if (!end) {
      return "—";
    }


    return new Date(
      end
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  }


  // ==========================================
  // SORT
  // ==========================================

  const sortedBookings =
    useMemo(() => {

      return [...bookings].sort(
        (a, b) =>
          getTimestamp(
            a.endAt
          ) -
          getTimestamp(
            b.endAt
          )
      );

    }, [
      bookings,
      now,
    ]);


  // ==========================================
  // SUMMARY
  // ==========================================

  const totalCharging =
    bookings.length;


  const totalEnergy =
    bookings.reduce(
      (total, booking) =>
        total +
        (
          Number(
            booking.energy
          ) || 0
        ),
      0
    );


  const totalRevenue =
    bookings.reduce(
      (total, booking) =>
        total +
        (
          Number(
            booking.amount
          ) || 0
        ),
      0
    );


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div
      className="
        max-w-7xl
        mx-auto
        space-y-7
      "
    >

      {/* ======================================
          HEADER
      ======================================= */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-end
          sm:justify-between
          gap-5
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-2
              text-emerald-400
              text-sm
              font-medium
            "
          >

            <span
              className="
                w-2
                h-2
                rounded-full
                bg-emerald-400
                animate-pulse
              "
            />

            Live monitoring

          </div>


          <h1
            className="
              text-3xl
              sm:text-4xl
              font-bold
              text-white
              mt-2
            "
          >
            Charging Sessions
          </h1>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Monitor active EV charging sessions in real time.
          </p>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            text-slate-500
          "
        >

          <Activity
            size={15}
            className="
              text-emerald-400
            "
          />

          Live Firestore data

        </div>

      </div>


      {/* ======================================
          SUMMARY
      ======================================= */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-3
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
              justify-between
            "
          >

            <p
              className="
                text-xs
                text-slate-500
              "
            >
              Charging Now
            </p>

            <Activity
              size={18}
              className="
                text-emerald-400
              "
            />

          </div>


          <p
            className="
              text-3xl
              font-bold
              text-white
              mt-3
            "
          >
            {totalCharging}
          </p>

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
              justify-between
            "
          >

            <p
              className="
                text-xs
                text-slate-500
              "
            >
              Active Energy
            </p>

            <BatteryCharging
              size={18}
              className="
                text-blue-400
              "
            />

          </div>


          <p
            className="
              text-3xl
              font-bold
              text-white
              mt-3
            "
          >
            {totalEnergy.toFixed(2)}
            <span
              className="
                text-sm
                text-slate-500
                ml-1
              "
            >
              kWh
            </span>
          </p>

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
              justify-between
            "
          >

            <p
              className="
                text-xs
                text-slate-500
              "
            >
              Session Value
            </p>

            <Zap
              size={18}
              className="
                text-amber-400
              "
            />

          </div>


          <p
            className="
              text-3xl
              font-bold
              text-white
              mt-3
            "
          >
            ₹{totalRevenue.toFixed(2)}
          </p>

        </div>

      </div>


      {/* ======================================
          ACTIVE SESSIONS
      ======================================= */}

      <div>

        <div
          className="
            flex
            items-center
            justify-between
            mb-4
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-semibold
                text-white
              "
            >
              Active Sessions
            </h2>

            <p
              className="
                text-xs
                text-slate-600
                mt-1
              "
            >
              Sessions currently charging
            </p>

          </div>

        </div>


        {loading ? (

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
              Loading active sessions...
            </p>

          </div>

        ) : sortedBookings.length === 0 ? (

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

            <BatteryCharging
              size={34}
              className="
                mx-auto
                text-slate-600
              "
            />


            <h3
              className="
                text-lg
                font-semibold
                text-white
                mt-4
              "
            >
              No active charging sessions
            </h3>


            <p
              className="
                text-sm
                text-slate-500
                mt-2
              "
            >
              Active charging sessions will appear here automatically.
            </p>

          </div>

        ) : (

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-2
              gap-5
            "
          >

            {sortedBookings.map(
              (booking) => {

                const remaining =
                  getRemainingSeconds(
                    booking
                  );


                const duration =
                  Number(
                    booking.duration
                  ) || 0;


                const totalSeconds =
                  duration *
                  60;


                const progress =
                  totalSeconds > 0
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          (
                            (
                              totalSeconds -
                              remaining
                            ) /
                            totalSeconds
                          ) *
                          100
                        )
                      )
                    : 0;


                return (

                  <div
                    key={booking.id}
                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-2xl
                      p-5
                      sm:p-6
                    "
                  >

                    {/* CARD HEADER */}

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
                          items-center
                          gap-3
                          min-w-0
                        "
                      >

                        <div
                          className="
                            w-11
                            h-11
                            rounded-xl
                            bg-emerald-400/10
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                        >

                          <Zap
                            size={21}
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

                          <h3
                            className="
                              text-base
                              font-semibold
                              text-white
                              truncate
                            "
                          >
                            {booking.stationName ||
                              "Charging Station"}
                          </h3>


                          <p
                            className="
                              text-xs
                              text-slate-600
                              mt-1
                            "
                          >
                            Charger #{getChargerNumber(
                              booking
                            )}
                          </p>

                        </div>

                      </div>


                      <span
                        className="
                          shrink-0
                          flex
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

                        <span
                          className="
                            w-1.5
                            h-1.5
                            rounded-full
                            bg-emerald-400
                            animate-pulse
                          "
                        />

                        Charging

                      </span>

                    </div>


                    {/* CUSTOMER + VEHICLE */}

                    <div
                      className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-3
                        mt-5
                      "
                    >

                      <div
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
                            items-center
                            gap-2
                            text-slate-500
                          "
                        >

                          <UserRound
                            size={15}
                          />

                          <span
                            className="
                              text-xs
                            "
                          >
                            Customer
                          </span>

                        </div>


                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-2
                            truncate
                          "
                        >
                          {getCustomerName(
                            booking
                          )}
                        </p>


                        <p
                          className="
                            text-xs
                            text-slate-600
                            mt-1
                            truncate
                          "
                        >
                          {booking.userEmail ||
                            booking.email ||
                            "Email not recorded"}
                        </p>

                      </div>


                      <div
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
                            items-center
                            gap-2
                            text-slate-500
                          "
                        >

                          <Car
                            size={15}
                          />

                          <span
                            className="
                              text-xs
                            "
                          >
                            Vehicle
                          </span>

                        </div>


                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-2
                            truncate
                          "
                        >
                          {getVehicleName(
                            booking
                          )}
                        </p>


                        <p
                          className="
                            text-xs
                            text-slate-600
                            mt-1
                            truncate
                          "
                        >
                          {booking.registrationNumber ||
                            "Registration not recorded"}
                        </p>

                      </div>

                    </div>


                    {/* TIMER */}

                    <div
                      className="
                        mt-5
                        rounded-xl
                        bg-slate-950
                        border
                        border-emerald-400/10
                        p-5
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >

                        <div>

                          <p
                            className="
                              text-xs
                              text-slate-600
                              uppercase
                              tracking-wider
                            "
                          >
                            Time remaining
                          </p>


                          <p
                            className="
                              text-3xl
                              sm:text-4xl
                              font-bold
                              text-white
                              font-mono
                              mt-2
                            "
                          >
                            {formatTime(
                              remaining
                            )}
                          </p>

                        </div>


                        <div
                          className="
                            text-right
                          "
                        >

                          <p
                            className="
                              text-xs
                              text-slate-600
                            "
                          >
                            Duration
                          </p>


                          <p
                            className="
                              text-sm
                              text-slate-300
                              mt-1
                            "
                          >
                            {duration} min
                          </p>

                        </div>

                      </div>


                      {/* PROGRESS */}

                      <div
                        className="
                          h-2
                          bg-slate-800
                          rounded-full
                          overflow-hidden
                          mt-5
                        "
                      >

                        <div
                          className="
                            h-full
                            bg-emerald-400
                            rounded-full
                            transition-all
                            duration-1000
                          "
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>


                      <div
                        className="
                          flex
                          justify-between
                          mt-2
                          text-[11px]
                          text-slate-600
                        "
                      >

                        <span>
                          Started{" "}
                          {formatStartTime(
                            booking
                          )}
                        </span>

                        <span>
                          Ends{" "}
                          {formatEndTime(
                            booking
                          )}
                        </span>

                      </div>

                    </div>


                    {/* SESSION INFO */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        sm:grid-cols-4
                        gap-3
                        mt-4
                      "
                    >

                      <div>

                        <p
                          className="
                            text-[11px]
                            text-slate-600
                            uppercase
                          "
                        >
                          Energy
                        </p>

                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-1
                          "
                        >
                          {Number(
                            booking.energy
                          ).toFixed(2)}{" "}
                          kWh
                        </p>

                      </div>


                      <div>

                        <p
                          className="
                            text-[11px]
                            text-slate-600
                            uppercase
                          "
                        >
                          Rate
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
                          {Number(
                            booking.pricePerKwh
                          ).toFixed(2)}
                          /kWh
                        </p>

                      </div>


                      <div>

                        <p
                          className="
                            text-[11px]
                            text-slate-600
                            uppercase
                          "
                        >
                          Session value
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
                          {Number(
                            booking.amount
                          ).toFixed(2)}
                        </p>

                      </div>


                      <div>

                        <p
                          className="
                            text-[11px]
                            text-slate-600
                            uppercase
                          "
                        >
                          Connector
                        </p>

                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-1
                            truncate
                          "
                        >
                          {booking.connectorType ||
                            "—"}
                        </p>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

    </div>

  );

}


export default AdminCharging;