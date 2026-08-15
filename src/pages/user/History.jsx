import { useEffect, useMemo, useState } from "react";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  BatteryCharging,
  CalendarDays,
  Clock,
  Zap,
  IndianRupee,
  Loader2,
  CheckCircle2,
  XCircle,
  History as HistoryIcon,
  Car,
  PlugZap,
  Receipt,
} from "lucide-react";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";


function History() {

  const { user } = useAuth();

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");


  // ==========================================
  // LOAD BOOKING HISTORY
  // ==========================================

  useEffect(() => {

    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }


    const loadHistory = async () => {

      try {

        setLoading(true);


        const bookingsRef =
          collection(db, "bookings");


        const bookingsQuery =
          query(
            bookingsRef,
            where(
              "userId",
              "==",
              user.uid
            )
          );


        const snapshot =
          await getDocs(
            bookingsQuery
          );


        const bookings =
          snapshot.docs.map(
            (bookingDoc) => ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            })
          );


        // Only sessions that are no longer active.
        const historyBookings =
          bookings.filter(
            (booking) => {

              const status =
                String(
                  booking.status || ""
                ).toLowerCase();


              return [
                "completed",
                "complete",
                "cancelled",
                "canceled",
              ].includes(status);

            }
          );


        // Newest first
        historyBookings.sort(
          (a, b) =>
            getDateValue(
              b.completedAt ||
              b.cancelledAt ||
              b.updatedAt ||
              b.createdAt ||
              b.date
            ) -
            getDateValue(
              a.completedAt ||
              a.cancelledAt ||
              a.updatedAt ||
              a.createdAt ||
              a.date
            )
        );


        setHistory(
          historyBookings
        );


      } catch (error) {

        console.error(
          "Fetching charging history error:",
          error
        );

        setHistory([]);

      } finally {

        setLoading(false);

      }

    };


    loadHistory();

  }, [user]);


  // ==========================================
  // DATE HELPER
  // ==========================================

  function getDateValue(value) {

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


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return 0;

    }


    return date.getTime();

  }


  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(value) {

    const timestamp =
      getDateValue(value);


    if (!timestamp) {
      return "—";
    }


    return new Date(
      timestamp
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  }


  // ==========================================
  // STATUS HELPER
  // ==========================================

  function isCompleted(booking) {

    return [
      "completed",
      "complete",
    ].includes(
      String(
        booking.status || ""
      ).toLowerCase()
    );

  }


  // ==========================================
  // FILTERED HISTORY
  // ==========================================

  const filteredHistory =
    useMemo(() => {

      if (filter === "completed") {

        return history.filter(
          (booking) =>
            isCompleted(booking)
        );

      }


      if (filter === "cancelled") {

        return history.filter(
          (booking) =>
            !isCompleted(booking)
        );

      }


      return history;

    }, [
      history,
      filter,
    ]);


  // ==========================================
  // COMPLETED SESSIONS
  // ==========================================

  const completedSessions =
    history.filter(
      (booking) =>
        isCompleted(booking)
    );


  // ==========================================
  // TOTALS
  // ==========================================

  const totalSessions =
    completedSessions.length;


  const totalEnergy =
    completedSessions.reduce(
      (total, booking) =>
        total +
        (
          Number(
            booking.energy
          ) || 0
        ),
      0
    );


  const totalSpent =
    completedSessions.reduce(
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
            Loading charging history...
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
          "
        >
          Your activity
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
          Charging History
        </h1>


        <p
          className="
            text-slate-500
            mt-2
          "
        >
          View your completed and cancelled charging sessions.
        </p>

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

        {/* SESSIONS */}

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

            <div>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Completed Sessions
              </p>


              <p
                className="
                  text-2xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                {totalSessions}
              </p>

            </div>


            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-emerald-400/10
                flex
                items-center
                justify-center
              "
            >

              <HistoryIcon
                size={21}
                className="
                  text-emerald-400
                "
              />

            </div>

          </div>

        </div>


        {/* ENERGY */}

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

            <div>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Energy Consumed
              </p>


              <p
                className="
                  text-2xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                {totalEnergy.toFixed(2)}

                <span
                  className="
                    text-sm
                    text-slate-500
                    font-normal
                    ml-1
                  "
                >
                  kWh
                </span>

              </p>

            </div>


            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-emerald-400/10
                flex
                items-center
                justify-center
              "
            >

              <BatteryCharging
                size={21}
                className="
                  text-emerald-400
                "
              />

            </div>

          </div>

        </div>


        {/* SPENT */}

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

            <div>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Charging Spend
              </p>


              <p
                className="
                  text-2xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                ₹{totalSpent.toFixed(2)}
              </p>

            </div>


            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-emerald-400/10
                flex
                items-center
                justify-center
              "
            >

              <IndianRupee
                size={21}
                className="
                  text-emerald-400
                "
              />

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          FILTERS
      ======================================= */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
        "
      >

        {[
          {
            key: "all",
            label: "All",
          },
          {
            key: "completed",
            label: "Completed",
          },
          {
            key: "cancelled",
            label: "Cancelled",
          },
        ].map((item) => (

          <button
            key={item.key}
            onClick={() =>
              setFilter(item.key)
            }
            className={`
              px-4
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition
              ${
                filter === item.key
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
              }
            `}
          >
            {item.label}
          </button>

        ))}

      </div>


      {/* ======================================
          HISTORY LIST
      ======================================= */}

      <div>

        <div
          className="
            flex
            items-center
            gap-3
            mb-4
          "
        >

          <HistoryIcon
            size={20}
            className="
              text-emerald-400
            "
          />


          <div>

            <h2
              className="
                text-lg
                font-semibold
                text-white
              "
            >
              Previous Sessions
            </h2>


            <p
              className="
                text-xs
                text-slate-500
                mt-1
              "
            >
              Your charging activity
            </p>

          </div>

        </div>


        {filteredHistory.length === 0 ? (

          <div
            className="
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-10
              text-center
            "
          >

            <div
              className="
                w-14
                h-14
                mx-auto
                rounded-xl
                bg-slate-800
                flex
                items-center
                justify-center
              "
            >

              <BatteryCharging
                size={24}
                className="
                  text-slate-500
                "
              />

            </div>


            <h3
              className="
                text-white
                font-semibold
                mt-4
              "
            >
              No sessions found
            </h3>


            <p
              className="
                text-sm
                text-slate-500
                mt-2
              "
            >
              Completed and cancelled sessions will appear here.
            </p>

          </div>

        ) : (

          <div
            className="
              space-y-4
            "
          >

            {filteredHistory.map(
              (booking) => {

                const completed =
                  isCompleted(
                    booking
                  );


                const energy =
                  Number(
                    booking.energy
                  ) || 0;


                const amount =
                  Number(
                    booking.amount
                  ) || 0;


                const refund =
                  Number(
                    booking.refundAmount
                  ) || 0;


                const chargerNumber =
                  booking.chargerIndex !==
                    undefined &&
                  booking.chargerIndex !==
                    null
                    ? Number(
                        booking.chargerIndex
                      ) + 1
                    : null;


                const vehicleName =
                  booking.vehicleName ||
                  booking.vehicleModel ||
                  booking.vehicle ||
                  "";


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

                    {/* TOP */}

                    <div
                      className="
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-start
                        gap-5
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          gap-4
                          flex-1
                          min-w-0
                        "
                      >

                        <div
                          className={`
                            w-12
                            h-12
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            shrink-0
                            ${
                              completed
                                ? "bg-emerald-400/10"
                                : "bg-red-400/10"
                            }
                          `}
                        >

                          {completed ? (

                            <Zap
                              size={21}
                              className="
                                text-emerald-400
                              "
                            />

                          ) : (

                            <XCircle
                              size={21}
                              className="
                                text-red-400
                              "
                            />

                          )}

                        </div>


                        <div
                          className="
                            min-w-0
                          "
                        >

                          <h3
                            className="
                              text-white
                              font-semibold
                              truncate
                            "
                          >
                            {booking.stationName ||
                              "Charging Station"}
                          </h3>


                          <div
                            className="
                              flex
                              flex-wrap
                              gap-x-4
                              gap-y-1
                              mt-1
                            "
                          >

                            {chargerNumber && (

                              <p
                                className="
                                  text-xs
                                  text-slate-500
                                "
                              >
                                Charger {chargerNumber}
                              </p>

                            )}


                            {booking.connectorType && (

                              <p
                                className="
                                  flex
                                  items-center
                                  gap-1
                                  text-xs
                                  text-slate-500
                                "
                              >

                                <PlugZap
                                  size={12}
                                />

                                {booking.connectorType}

                              </p>

                            )}

                          </div>

                        </div>

                      </div>


                      {/* STATUS */}

                      <div>

                        {completed ? (

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

                            <CheckCircle2
                              size={14}
                            />

                            Charging completed

                          </span>

                        ) : (

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              px-3
                              py-1.5
                              rounded-full
                              bg-red-400/10
                              text-red-400
                              text-xs
                              font-semibold
                            "
                          >

                            <XCircle
                              size={14}
                            />

                            Cancelled

                          </span>

                        )}

                      </div>

                    </div>


                    {/* DETAILS */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        sm:grid-cols-3
                        lg:grid-cols-6
                        gap-3
                        mt-6
                      "
                    >

                      {/* DATE */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-slate-500
                          "
                        >

                          <CalendarDays
                            size={14}
                          />

                          <span
                            className="
                              text-[11px]
                            "
                          >
                            Date
                          </span>

                        </div>


                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-2
                          "
                        >
                          {formatDate(
                            booking.completedAt ||
                            booking.cancelledAt ||
                            booking.updatedAt ||
                            booking.createdAt ||
                            booking.date
                          )}
                        </p>

                      </div>


                      {/* DURATION */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-slate-500
                          "
                        >

                          <Clock
                            size={14}
                          />

                          <span
                            className="
                              text-[11px]
                            "
                          >
                            Duration
                          </span>

                        </div>


                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-2
                          "
                        >
                          {booking.duration ||
                            0}{" "}
                          min
                        </p>

                      </div>


                      {/* ENERGY */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-slate-500
                          "
                        >

                          <BatteryCharging
                            size={14}
                          />

                          <span
                            className="
                              text-[11px]
                            "
                          >
                            Energy
                          </span>

                        </div>


                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-2
                          "
                        >
                          {energy.toFixed(2)} kWh
                        </p>

                      </div>


                      {/* VEHICLE */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-slate-500
                          "
                        >

                          <Car
                            size={14}
                          />

                          <span
                            className="
                              text-[11px]
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
                          {vehicleName ||
                            "Not recorded"}
                        </p>

                      </div>


                      {/* AMOUNT */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-slate-500
                          "
                        >

                          <IndianRupee
                            size={14}
                          />

                          <span
                            className="
                              text-[11px]
                            "
                          >
                            Amount
                          </span>

                        </div>


                        <p
                          className="
                            text-sm
                            text-white
                            font-semibold
                            mt-2
                          "
                        >
                          ₹{amount.toFixed(2)}
                        </p>


                        {refund > 0 && (

                          <p
                            className="
                              text-[11px]
                              text-emerald-400
                              mt-1
                            "
                          >
                            Refund ₹
                            {refund.toFixed(2)}
                          </p>

                        )}

                      </div>


                      {/* PAYMENT */}

                      <div
                        className="
                          bg-slate-950
                          border
                          border-slate-800
                          rounded-xl
                          p-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-slate-500
                          "
                        >

                          <Receipt
                            size={14}
                          />

                          <span
                            className="
                              text-[11px]
                            "
                          >
                            Payment
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
                          {booking.paymentMethod ||
                            "—"}
                        </p>

                      </div>

                    </div>


                    {/* BOOKING ID */}

                    <div
                      className="
                        mt-4
                        pt-4
                        border-t
                        border-slate-800
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-2
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-slate-600
                        "
                      >
                        Booking ID:{" "}
                        {booking.id}
                      </p>


                      {!completed &&
                        refund > 0 && (

                        <p
                          className="
                            text-xs
                            text-emerald-400
                          "
                        >
                          ₹{refund.toFixed(2)} credited as refund
                        </p>

                      )}

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


export default History;