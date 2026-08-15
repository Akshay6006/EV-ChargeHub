import {
  BatteryCharging,
  MapPin,
  CalendarDays,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock3,
  Leaf,
  IndianRupee,
  Car,
  History,
} from "lucide-react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import { db } from "../../firebase/firebase";


function Dashboard() {

  const navigate = useNavigate();

  const {
    user,
    userData,
    loading,
  } = useAuth();


  const [bookings, setBookings] =
    useState([]);

  const [stations, setStations] =
    useState([]);

  const [dataLoading, setDataLoading] =
    useState(true);


  // ==========================================
  // ADMIN REDIRECT
  // ==========================================

  if (loading) {
    return null;
  }


  if (userData?.role === "admin") {

    return (
      <Navigate
        to="/admin"
        replace
      />
    );

  }


  const userName =
    userData?.name || "Driver";


  // ==========================================
  // LOAD USER BOOKINGS
  // ==========================================

  useEffect(() => {

    if (!user?.uid) {
      return;
    }


    const bookingsQuery =
      query(
        collection(
          db,
          "bookings"
        ),
        where(
          "userId",
          "==",
          user.uid
        )
      );


    const unsubscribe =
      onSnapshot(

        bookingsQuery,

        (snapshot) => {

          const list =
            snapshot.docs.map(
              (bookingDoc) => ({
                id:
                  bookingDoc.id,

                ...bookingDoc.data(),
              })
            );


          setBookings(list);

          setDataLoading(false);

        },

        (error) => {

          console.error(
            "Dashboard bookings error:",
            error
          );

          setDataLoading(false);

        }

      );


    return () =>
      unsubscribe();

  }, [user?.uid]);


  // ==========================================
  // LOAD STATIONS
  // ==========================================

  useEffect(() => {

    const unsubscribe =
      onSnapshot(

        collection(
          db,
          "stations"
        ),

        (snapshot) => {

          const list =
            snapshot.docs.map(
              (stationDoc) => ({
                id:
                  stationDoc.id,

                ...stationDoc.data(),
              })
            );


          setStations(list);

        },

        (error) => {

          console.error(
            "Dashboard stations error:",
            error
          );

        }

      );


    return () =>
      unsubscribe();

  }, []);


  // ==========================================
  // DATE HELPER
  // ==========================================

  const getDate = (
    value
  ) => {

    if (!value) {
      return null;
    }


    if (
      typeof value?.toDate ===
      "function"
    ) {

      return value.toDate();

    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return null;

    }


    return date;

  };


  // ==========================================
  // BOOKING STATUS
  // ==========================================

  const getStatus = (
    booking
  ) => {

    const status =
      String(
        booking.status || ""
      )
        .toLowerCase()
        .trim();


    if (
      status === "cancelled" ||
      status === "canceled"
    ) {

      return "cancelled";

    }


    if (
      status === "completed" ||
      status === "complete"
    ) {

      return "completed";

    }


    if (
      status === "active" ||
      status === "charging" ||
      status === "in-progress" ||
      status === "in_progress"
    ) {

      return "active";

    }


    if (
      status === "confirmed" ||
      status === "booked" ||
      status === "reserved"
    ) {

      return "confirmed";

    }


    return status || "pending";

  };


  // ==========================================
  // VALID BOOKINGS
  // ==========================================

  const validBookings =
    useMemo(() => {

      return bookings.filter(
        (booking) =>
          getStatus(
            booking
          ) !== "cancelled"
      );

    }, [bookings]);


  // ==========================================
  // SESSIONS
  // ==========================================

  const chargingSessions =
    useMemo(() => {

      return bookings.filter(
        (booking) => {

          const status =
            getStatus(
              booking
            );

          return (
            status ===
              "active" ||
            status ===
              "completed"
          );

        }
      );

    }, [bookings]);


  // ==========================================
  // TOTAL SPENDING
  // ==========================================

  const totalSpent =
    useMemo(() => {

      return validBookings.reduce(
        (
          total,
          booking
        ) => {

          return (
            total +
            (
              Number(
                booking.amount
              ) || 0
            )
          );

        },
        0
      );

    }, [validBookings]);


  // ==========================================
  // ENERGY
  // ==========================================

  const totalEnergy =
    useMemo(() => {

      return chargingSessions.reduce(
        (
          total,
          booking
        ) => {

          return (
            total +
            (
              Number(
                booking.energy
              ) || 0
            )
          );

        },
        0
      );

    }, [chargingSessions]);


  // ==========================================
  // CHARGING TIME
  // ==========================================

  const totalChargingHours =
    useMemo(() => {

      return chargingSessions.reduce(
        (
          total,
          booking
        ) => {

          const start =
            getDate(
              booking.startDateTime ||
              booking.startAt
            );


          const end =
            getDate(
              booking.endDateTime ||
              booking.endAt
            );


          if (
            start &&
            end &&
            end > start
          ) {

            return (
              total +
              (
                (
                  end.getTime() -
                  start.getTime()
                ) /
                (
                  1000 *
                  60 *
                  60
                )
              )
            );

          }


          return total;

        },
        0
      );

    }, [chargingSessions]);


  // ==========================================
  // UPCOMING BOOKING
  // ==========================================

  const upcomingBooking =
    useMemo(() => {

      const now =
        new Date();


      return (
        bookings
          .filter(
            (booking) => {

              const status =
                getStatus(
                  booking
                );


              if (
                status ===
                  "cancelled" ||
                status ===
                  "completed"
              ) {

                return false;

              }


              const start =
                getDate(
                  booking.startDateTime ||
                  booking.startAt ||
                  booking.startTime
                );


              return (
                start &&
                start >= now
              );

            }
          )
          .sort(
            (a, b) => {

              const dateA =
                getDate(
                  a.startDateTime ||
                  a.startAt ||
                  a.startTime
                );


              const dateB =
                getDate(
                  b.startDateTime ||
                  b.startAt ||
                  b.startTime
                );


              return (
                dateA.getTime() -
                dateB.getTime()
              );

            }
          )[0] ||
        null
      );

    }, [bookings]);


  // ==========================================
  // AVAILABLE STATIONS
  // ==========================================

  const availableStations =
    useMemo(() => {

      return stations.filter(
        (station) => {

          const chargers =
            station.chargers ||
            [];


          return chargers.some(
            (charger) =>
              String(
                charger.status ||
                  "available"
              ).toLowerCase() !==
              "maintenance"
          );

        }
      ).length;

    }, [stations]);


  // ==========================================
  // CO2 ESTIMATE
  // ==========================================

  const co2Saved =
    totalEnergy * 0.7;


  // ==========================================
  // NAVIGATION HELPERS
  // ==========================================

  const goToStations =
    () => {

      navigate(
        "/stations"
      );

    };


  const goToBookings =
    () => {

      navigate(
        "/bookings"
      );

    };


  const goToBookingForm =
    () => {

      navigate(
        "/bookings/new"
      );

    };


  const goToVehicles =
    () => {

      navigate(
        "/vehicles"
      );

    };


  const goToHistory =
    () => {

      navigate(
        "/history"
      );

    };


  // ==========================================
  // LOADING DATA
  // ==========================================

  if (
    dataLoading &&
    bookings.length === 0
  ) {

    return (

      <div
        className="
          min-h-[400px]
          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            text-center
          "
        >

          <div
            className="
              w-10
              h-10
              mx-auto
              rounded-full
              border-2
              border-slate-700
              border-t-emerald-400
              animate-spin
            "
          />


          <p
            className="
              text-sm
              text-slate-500
              mt-4
            "
          >
            Loading your dashboard...
          </p>

        </div>

      </div>

    );

  }


  return (

    <div
      className="
        max-w-7xl
        mx-auto
        space-y-8
      "
    >

      {/* ==========================================
          WELCOME
      ========================================== */}

      <section>

        <p
          className="
            text-sm
            text-emerald-400
            font-medium
            mb-2
          "
        >
          Welcome back
        </p>


        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-end
            md:justify-between
            gap-5
          "
        >

          <div>

            <h1
              className="
                text-3xl
                sm:text-4xl
                font-bold
                text-white
              "
            >
              Good afternoon,{" "}
              {userName.split(" ")[0]} 👋
            </h1>


            <p
              className="
                text-slate-500
                mt-2
              "
            >
              Here's your EV charging overview.
            </p>

          </div>


          <button
            type="button"
            onClick={
              goToStations
            }
            className="
              w-fit
              flex
              items-center
              gap-2
              bg-emerald-400
              hover:bg-emerald-300
              text-slate-950
              font-semibold
              px-5
              py-3
              rounded-xl
              transition
              shadow-lg
              shadow-emerald-400/10
            "
          >

            <MapPin
              size={18}
            />

            Find a charger

            <ArrowRight
              size={17}
            />

          </button>

        </div>

      </section>


      {/* ==========================================
          STAT CARDS
      ========================================== */}

      <section
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >

        {/* BATTERY */}

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
              items-start
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Current battery
              </p>


              <h2
                className="
                  text-3xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                --
              </h2>

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


          <p
            className="
              text-xs
              text-slate-600
              mt-4
            "
          >
            Battery tracking is not connected yet
          </p>

        </div>


        {/* STATIONS */}

        <button
          type="button"
          onClick={
            goToStations
          }
          className="
            text-left
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
            hover:border-cyan-400/30
            transition
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Available stations
              </p>


              <h2
                className="
                  text-3xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                {availableStations}
              </h2>

            </div>


            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
              "
            >

              <MapPin
                size={21}
                className="
                  text-cyan-400
                "
              />

            </div>

          </div>


          <p
            className="
              text-xs
              text-slate-600
              mt-4
            "
          >
            View charging stations
          </p>

        </button>


        {/* SESSIONS */}

        <button
          type="button"
          onClick={
            goToHistory
          }
          className="
            text-left
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
            hover:border-violet-400/30
            transition
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Charging sessions
              </p>


              <h2
                className="
                  text-3xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                {chargingSessions.length}
              </h2>

            </div>


            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-violet-400/10
                flex
                items-center
                justify-center
              "
            >

              <Zap
                size={21}
                className="
                  text-violet-400
                "
              />

            </div>

          </div>


          <p
            className="
              text-xs
              text-slate-600
              mt-4
            "
          >
            View charging history
          </p>

        </button>


        {/* SPENDING */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/wallet"
            )
          }
          className="
            text-left
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
            hover:border-amber-400/30
            transition
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Total spent
              </p>


              <h2
                className="
                  text-3xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                ₹
                {totalSpent.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </h2>

            </div>


            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-amber-400/10
                flex
                items-center
                justify-center
              "
            >

              <IndianRupee
                size={21}
                className="
                  text-amber-400
                "
              />

            </div>

          </div>


          <p
            className="
              text-xs
              text-slate-600
              mt-4
            "
          >
            View wallet and transactions
          </p>

        </button>

      </section>


      {/* ==========================================
          MAIN GRID
      ========================================== */}

      <section
        className="
          grid
          grid-cols-1
          xl:grid-cols-3
          gap-6
        "
      >

        {/* UPCOMING */}

        <div
          className="
            xl:col-span-2
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            overflow-hidden
          "
        >

          <div
            className="
              px-6
              py-5
              border-b
              border-slate-800
              flex
              items-center
              justify-between
            "
          >

            <div>

              <h2
                className="
                  font-semibold
                  text-white
                "
              >
                Upcoming charging
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                Your next scheduled session
              </p>

            </div>


            <CalendarDays
              size={20}
              className="
                text-slate-500
              "
            />

          </div>


          <div
            className="
              p-6
            "
          >

            {upcomingBooking ? (

              <div
                className="
                  bg-slate-950
                  border
                  border-slate-800
                  rounded-2xl
                  p-6
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
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
                      "
                    >

                      <span
                        className="
                          w-2
                          h-2
                          rounded-full
                          bg-emerald-400
                        "
                      />

                      <span
                        className="
                          text-xs
                          text-emerald-400
                          font-medium
                        "
                      >
                        Upcoming booking
                      </span>

                    </div>


                    <h3
                      className="
                        text-xl
                        font-semibold
                        text-white
                        mt-3
                      "
                    >
                      {upcomingBooking.stationName ||
                        upcomingBooking.station?.name ||
                        "Charging Station"}
                    </h3>


                    <p
                      className="
                        text-sm
                        text-slate-500
                        mt-1
                      "
                    >
                      {upcomingBooking.chargerName ||
                        upcomingBooking.charger?.name ||
                        "Charging point"}
                    </p>

                  </div>


                  <div
                    className="
                      sm:text-right
                    "
                  >

                    <p
                      className="
                        text-sm
                        text-slate-300
                        font-medium
                      "
                    >
                      {getDate(
                        upcomingBooking.startDateTime ||
                        upcomingBooking.startAt ||
                        upcomingBooking.startTime
                      )?.toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>


                    <p
                      className="
                        text-sm
                        text-emerald-400
                        mt-1
                      "
                    >
                      {getDate(
                        upcomingBooking.startDateTime ||
                        upcomingBooking.startAt ||
                        upcomingBooking.startTime
                      )?.toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>

                  </div>

                </div>


                <div
                  className="
                    mt-5
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                  "
                >

                  <button
                    type="button"
                    onClick={
                      goToBookings
                    }
                    className="
                      flex-1
                      flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      py-3
                      rounded-xl
                      bg-emerald-400
                      hover:bg-emerald-300
                      text-slate-950
                      font-semibold
                      text-sm
                      transition
                    "
                  >
                    View booking

                    <ArrowRight
                      size={16}
                    />

                  </button>


                  <button
                    type="button"
                    onClick={
                      goToStations
                    }
                    className="
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-800
                      text-slate-400
                      hover:text-white
                      hover:border-slate-700
                      text-sm
                      transition
                    "
                  >
                    Find another station
                  </button>

                </div>

              </div>

            ) : (

              <div
                className="
                  border
                  border-dashed
                  border-slate-700
                  rounded-2xl
                  p-8
                  text-center
                "
              >

                <div
                  className="
                    w-14
                    h-14
                    mx-auto
                    rounded-2xl
                    bg-emerald-400/10
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Zap
                    size={25}
                    className="
                      text-emerald-400
                    "
                  />

                </div>


                <h3
                  className="
                    text-white
                    font-semibold
                    mt-5
                  "
                >
                  No upcoming charging session
                </h3>


                <p
                  className="
                    text-sm
                    text-slate-500
                    max-w-sm
                    mx-auto
                    mt-2
                    leading-6
                  "
                >
                  Find a nearby charging station and reserve a convenient slot for your EV.
                </p>


                <button
                  type="button"
                  onClick={
                    goToStations
                  }
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    text-emerald-400
                    hover:text-emerald-300
                    font-medium
                  "
                >

                  Find a charging station

                  <ArrowRight
                    size={16}
                  />

                </button>

              </div>

            )}

          </div>

        </div>


        {/* QUICK ACTIONS */}

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-6
          "
        >

          <h2
            className="
              font-semibold
              text-white
            "
          >
            Quick actions
          </h2>


          <p
            className="
              text-sm
              text-slate-500
              mt-1
            "
          >
            Common things you can do
          </p>


          <div
            className="
              mt-6
              space-y-3
            "
          >

            <QuickAction
              icon={MapPin}
              title="Find charger"
              description="Explore nearby stations"
              onClick={
                goToStations
              }
              color="emerald"
            />


            <QuickAction
              icon={CalendarDays}
              title="Book a slot"
              description="Reserve your charging time"
              onClick={
                goToBookingForm
              }
              color="cyan"
            />


            <QuickAction
              icon={Car}
              title="Add vehicle"
              description="Manage your EV"
              onClick={
                goToVehicles
              }
              color="violet"
            />


            <QuickAction
              icon={History}
              title="Charging history"
              description="View your past sessions"
              onClick={
                goToHistory
              }
              color="amber"
            />

          </div>

        </div>

      </section>


      {/* ==========================================
          CHARGING OVERVIEW
      ========================================== */}

      <section
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-6
        "
      >

        {/* ENERGY */}

        <button
          type="button"
          onClick={
            goToHistory
          }
          className="
            text-left
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-6
            hover:border-emerald-400/30
            transition
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-emerald-400/10
                flex
                items-center
                justify-center
              "
            >

              <TrendingUp
                size={19}
                className="
                  text-emerald-400
                "
              />

            </div>


            <div>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Energy consumed
              </p>


              <p
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                {totalEnergy.toFixed(
                  1
                )}{" "}
                kWh
              </p>

            </div>

          </div>


          <div
            className="
              h-2
              bg-slate-800
              rounded-full
              mt-6
              overflow-hidden
            "
          >

            <div
              className="
                h-full
                bg-emerald-400
                rounded-full
              "
              style={{
                width:
                  totalEnergy > 0
                    ? `${Math.min(
                        totalEnergy /
                          5,
                        100
                      )}%`
                    : "0%",
              }}
            />

          </div>


          <p
            className="
              text-xs
              text-slate-600
              mt-3
            "
          >
            Based on your recorded charging sessions.
          </p>

        </button>


        {/* TIME */}

        <button
          type="button"
          onClick={
            goToHistory
          }
          className="
            text-left
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-6
            hover:border-cyan-400/30
            transition
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
              "
            >

              <Clock3
                size={19}
                className="
                  text-cyan-400
                "
              />

            </div>


            <div>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Charging time
              </p>


              <p
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                {totalChargingHours.toFixed(
                  1
                )}{" "}
                hrs
              </p>

            </div>

          </div>


          <p
            className="
              text-xs
              text-slate-600
              mt-6
            "
          >
            Total calculated time from your recorded sessions.
          </p>

        </button>


        {/* CO2 */}

        <button
          type="button"
          onClick={
            goToHistory
          }
          className="
            text-left
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-6
            hover:border-green-400/30
            transition
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-green-400/10
                flex
                items-center
                justify-center
              "
            >

              <Leaf
                size={19}
                className="
                  text-green-400
                "
              />

            </div>


            <div>

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                CO₂ saved
              </p>


              <p
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                {co2Saved.toFixed(
                  1
                )}{" "}
                kg
              </p>

            </div>

          </div>


          <p
            className="
              text-xs
              text-slate-600
              mt-6
            "
          >
            Estimated from your recorded energy consumption.
          </p>

        </button>

      </section>


    </div>

  );

}


// ==========================================
// QUICK ACTION
// ==========================================

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
  color,
}) {

  const colorClasses = {

    emerald:
      "bg-emerald-400/10 text-emerald-400 hover:border-emerald-400/40",

    cyan:
      "bg-cyan-400/10 text-cyan-400 hover:border-cyan-400/40",

    violet:
      "bg-violet-400/10 text-violet-400 hover:border-violet-400/40",

    amber:
      "bg-amber-400/10 text-amber-400 hover:border-amber-400/40",

  };


  return (

    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-4
        p-4
        rounded-xl
        bg-slate-950
        border
        border-slate-800
        transition
        text-left
        ${colorClasses[color]}
      `}
    >

      <div
        className={`
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          shrink-0
          ${colorClasses[color]
            .split(" ")
            .slice(0, 2)
            .join(" ")}
        `}
      >

        <Icon
          size={19}
        />

      </div>


      <div
        className="
          flex-1
          min-w-0
        "
      >

        <p
          className="
            text-sm
            font-medium
            text-white
          "
        >
          {title}
        </p>


        <p
          className="
            text-xs
            text-slate-600
            mt-1
          "
        >
          {description}
        </p>

      </div>


      <ArrowRight
        size={17}
        className="
          text-slate-600
          shrink-0
        "
      />

    </button>

  );

}


export default Dashboard;