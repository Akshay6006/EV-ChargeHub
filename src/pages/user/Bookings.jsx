import { useEffect, useState } from "react";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  CalendarDays,
  MapPin,
  Zap,
  Loader2,
  BatteryCharging,
  CircleCheck,
  CircleX,
  History,
  Clock3,
  Wallet,
} from "lucide-react";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";

function getRemainingSeconds(endAt) {

  if (!endAt) {
    return 0;
  }

  const end =
    new Date(endAt).getTime();

  const now =
    Date.now();

  return Math.max(
    0,
    Math.floor(
      (end - now) / 1000
    )
  );
}


function formatTime(totalSeconds) {

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;


  if (hours > 0) {

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  }


  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function Bookings() {

  const { user } = useAuth();


  const [bookings, setBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [cancellingId, setCancellingId] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {

    if (!user) {

      setLoading(false);

      return;

    }


    const fetchBookings =
      async () => {

        try {

          setLoading(true);
          setError("");


          const bookingsRef =
            collection(
              db,
              "bookings"
            );


          const bookingsQuery =
            query(

              bookingsRef,

              where(
                "userId",
                "==",
                user.uid
              ),

              orderBy(
                "createdAt",
                "desc"
              )

            );


          const snapshot =
            await getDocs(
              bookingsQuery
            );


          const data =
            snapshot.docs.map(
              (bookingDoc) => ({

                id:
                  bookingDoc.id,

                ...bookingDoc.data(),

              })
            );


          setBookings(data);


        } catch (error) {

          console.error(
            "Fetching bookings error:",
            error
          );


          setError(
            "Unable to load your bookings."
          );


        } finally {

          setLoading(false);

        }

      };


    fetchBookings();

  }, [user]);

  useEffect(() => {

    if (!bookings.length) {
      return;
    }

    let isChecking = false;

    const checkChargingSessions = async () => {

      if (isChecking) {
        return;
      }

      isChecking = true;

      try {

        const now = Date.now();

        for (const booking of bookings) {

          if (
            booking.status === "cancelled" ||
            booking.status === "completed"
          ) {
            continue;
          }

          if (!booking.startAt || !booking.endAt) {
            continue;
          }

          const start =
            new Date(booking.startAt).getTime();

          const end =
            new Date(booking.endAt).getTime();

          if (
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            end <= start
          ) {
            continue;
          }

          if (
            booking.status === "confirmed" &&
            now >= start &&
            now < end
          ) {

            try {

              await updateDoc(
                doc(
                  db,
                  "bookings",
                  booking.id
                ),
                {
                  status: "active",
                  chargingStartedAt:
                    serverTimestamp(),
                }
              );

              setBookings((previous) =>
                previous.map((item) =>
                  item.id === booking.id
                    ? {
                        ...item,
                        status: "active",
                        chargingStartedAt:
                          new Date(),
                      }
                    : item
                )
              );

            } catch (error) {

              console.error(
                "Unable to start charging:",
                error
              );

            }
            continue;
          }

          const remainingSeconds =
            Math.max(
              0,
              Math.floor(
                (end - now) / 1000
              )
            );

          if (
            booking.status !== "active" ||
            remainingSeconds > 0
          ) {
            continue;
          }

          try {

            await updateDoc(
              doc(
                db,
                "bookings",
                booking.id
              ),
              {
                status: "completed",
                chargingCompletedAt:
                  serverTimestamp(),
              }
            );

            setBookings((previous) =>
              previous.map((item) =>
                item.id === booking.id
                  ? {
                      ...item,
                      status: "completed",
                      chargingCompletedAt:
                        new Date(),
                    }
                  : item
              )
            );

            window.alert(
              `Charging completed for ${
                booking.stationName ||
                "your charging station"
              }. Please remove the connector.`
            );

          } catch (error) {

            console.error(
              "Unable to complete charging:",
              error
            );

          }

        }

      } finally {

        isChecking = false;

      }

    };

    checkChargingSessions();

    const interval =
      setInterval(
        checkChargingSessions,
        1000
      );

    return () =>
      clearInterval(interval);

  }, [bookings]);


  const handleCancelBooking =
    async (booking) => {


      if (
        booking.status !==
          "confirmed" &&
        booking.status !==
          "active"
      ) {

        alert(
          "This booking can no longer be cancelled."
        );

        return;

      }


      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this charging session? Any unused amount will be refunded to your wallet."
        );


      if (!confirmed) {
        return;
      }


      try {

        setCancellingId(
          booking.id
        );

        const now =
          Date.now();


        const start =
          booking.startAt
            ? new Date(
                booking.startAt
              ).getTime()
            : now;


        const end =
          booking.endAt
            ? new Date(
                booking.endAt
              ).getTime()
            : now;


        const totalDurationMs =
          Math.max(
            end - start,
            0
          );


        let usedDurationMs = 0;

        if (
          booking.status ===
          "confirmed"
        ) {

          usedDurationMs = 0;

        }

        if (
          booking.status ===
          "active"
        ) {

          usedDurationMs =
            Math.max(
              0,
              Math.min(
                now - start,
                totalDurationMs
              )
            );

        }

        const usedMinutes =
          Math.floor(
            usedDurationMs /
            (60 * 1000)
          );


        const totalMinutes =
          Number(
            booking.duration
          ) || 0;


        const remainingMinutes =
          Math.max(
            0,
            totalMinutes -
              usedMinutes
          );

        const totalAmount =
          Number(
            booking.amount
          ) || 0;


        let usedAmount = 0;

        let refundAmount = 0;


        if (
          totalMinutes > 0
        ) {

          usedAmount =
            totalAmount *
            (
              usedMinutes /
              totalMinutes
            );


          refundAmount =
            totalAmount -
            usedAmount;

        }


        usedAmount =
          Number(
            usedAmount.toFixed(2)
          );


        refundAmount =
          Number(
            refundAmount.toFixed(2)
          );

        const bookingRef =
          doc(
            db,
            "bookings",
            booking.id
          );


        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        await runTransaction(
          db,
          async (transaction) => {

            const bookingSnapshot =
              await transaction.get(
                bookingRef
              );


            if (
              !bookingSnapshot.exists()
            ) {

              throw new Error(
                "Booking no longer exists."
              );

            }


            const latestBooking =
              bookingSnapshot.data();


            // Prevent double refund

            if (
              latestBooking.status ===
              "cancelled"
            ) {

              throw new Error(
                "This booking has already been cancelled."
              );

            }


            const userSnapshot =
              await transaction.get(
                userRef
              );


            const userData =
              userSnapshot.exists()
                ? userSnapshot.data()
                : {};


            const currentWallet =
              Number(
                userData.walletBalance
              ) || 0;


            const newWalletBalance =
              Number(
                (
                  currentWallet +
                  refundAmount
                ).toFixed(2)
              );

            transaction.update(
              bookingRef,
              {

                status:
                  "cancelled",

                cancelledAt:
                  serverTimestamp(),

                usedMinutes:
                  usedMinutes,

                remainingMinutes:
                  remainingMinutes,

                usedAmount:
                  usedAmount,

                refundAmount:
                  refundAmount,

                refundStatus:
                  refundAmount > 0
                    ? "credited_to_wallet"
                    : "none",

              }
            );


            transaction.set(
              userRef,
              {

                walletBalance:
                  newWalletBalance,

              },

              {
                merge: true,
              }
            );

          }
        );


        setBookings(
          (previous) =>
            previous.map(
              (item) =>

                item.id ===
                booking.id

                  ? {
                      ...item,

                      status:
                        "cancelled",

                      usedMinutes:
                        usedMinutes,

                      remainingMinutes:
                        remainingMinutes,

                      usedAmount:
                        usedAmount,

                      refundAmount:
                        refundAmount,

                      refundStatus:
                        refundAmount > 0
                          ? "credited_to_wallet"
                          : "none",
                    }

                  : item
            )
        );

        if (
          refundAmount > 0
        ) {

          alert(
            `Booking cancelled successfully.\n₹${refundAmount.toFixed(2)} has been added to your wallet.`
          );

        } else {

          alert(
            "Booking cancelled successfully."
          );

        }


      } catch (error) {

        console.error(
          "Cancel booking error:",
          error
        );


        alert(
          error.message ||
          "Unable to cancel the booking."
        );


      } finally {

        setCancellingId(
          null
        );

      }

    };

  if (loading) {

    return (

      <div className="
        flex
        items-center
        justify-center
        min-h-[400px]
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
            Loading your bookings...
          </p>

        </div>

      </div>

    );

  }

  if (error) {

    return (

      <div className="
        max-w-3xl
        mx-auto
      ">

        <div className="
          bg-red-500/5
          border
          border-red-500/20
          rounded-2xl
          p-8
          text-center
        ">

          <CircleX
            size={32}
            className="
              mx-auto
              text-red-400
            "
          />


          <h2 className="
            text-lg
            font-semibold
            text-white
            mt-4
          ">
            Something went wrong
          </h2>


          <p className="
            text-slate-500
            mt-2
          ">
            {error}
          </p>

        </div>

      </div>

    );

  }

  if (
    bookings.length === 0
  ) {

    return (

      <div className="
        max-w-4xl
        mx-auto
      ">

        <div className="mb-8">

          <p className="
            text-sm
            text-emerald-400
            font-medium
          ">
            Charging activity
          </p>


          <h1 className="
            text-3xl
            sm:text-4xl
            font-bold
            text-white
            mt-2
          ">
            My Bookings
          </h1>


          <p className="
            text-slate-500
            mt-2
          ">
            Manage your charging reservations.
          </p>

        </div>


        <div className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-10
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

            <CalendarDays
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
            No bookings yet
          </h2>


          <p className="
            text-slate-500
            max-w-md
            mx-auto
            mt-2
          ">
            Your charging reservations will appear here.
          </p>


          <button
            onClick={() =>
              window.location.href =
                "/stations"
            }
            className="
              mt-6
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
            Find a charger
          </button>

        </div>

      </div>

    );

  }

  return (

    <div className="
      max-w-5xl
      mx-auto
      space-y-8
    ">


      {/* HEADER */}

      <div>

        <p className="
          text-sm
          text-emerald-400
          font-medium
        ">
          Charging activity
        </p>


        <h1 className="
          text-3xl
          sm:text-4xl
          font-bold
          text-white
          mt-2
        ">
          My Bookings
        </h1>


        <p className="
          text-slate-500
          mt-2
        ">
          View and manage your charging reservations.
        </p>

      </div>


      {/* BOOKING LIST */}

      <div className="
        space-y-4
      ">

        {bookings.map(
          (booking) => (

            <BookingCard
              key={booking.id}
              booking={booking}
              handleCancelBooking={
                handleCancelBooking
              }
              cancellingId={
                cancellingId
              }
            />

          )
        )}

      </div>

    </div>

  );

}

function BookingCard({
  booking,
  handleCancelBooking,
  cancellingId,
}) {

  const status =
    booking.status ||
    "confirmed";

  const [
    remainingSeconds,
    setRemainingSeconds
  ] = useState(
    getRemainingSeconds(
      booking.endAt
    )
  );


  useEffect(() => {

    if (
      status !== "active"
    ) {

      return;

    }


    const updateTimer =
      () => {

        setRemainingSeconds(
          getRemainingSeconds(
            booking.endAt
          )
        );

      };


    updateTimer();


    const interval =
      setInterval(
        updateTimer,
        1000
      );


    return () =>
      clearInterval(
        interval
      );

  }, [
    status,
    booking.endAt,
  ]);

  const statusConfig = {

    confirmed: {

      label:
        "Confirmed",

      className:
        "bg-emerald-400/10 text-emerald-400",

      icon:
        CircleCheck,

    },


    active: {

      label:
        "Charging",

      className:
        "bg-purple-400/10 text-purple-400",

      icon:
        BatteryCharging,

    },


    completed: {

      label:
        "Completed",

      className:
        "bg-blue-400/10 text-blue-400",

      icon:
        CircleCheck,

    },


    cancelled: {

      label:
        "Cancelled",

      className:
        "bg-red-400/10 text-red-400",

      icon:
        CircleX,

    },

  };


  const config =
    statusConfig[status] ||
    statusConfig.confirmed;


  const StatusIcon =
    config.icon;

  return (

    <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      overflow-hidden
    ">


      <div className="
        p-5
        sm:p-6
      ">


        {/* TOP */}

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-start
          sm:justify-between
          gap-4
        ">


          {/* STATION */}

          <div className="
            flex
            items-start
            gap-4
            min-w-0
          ">

            <div className="
              w-11
              h-11
              rounded-xl
              bg-emerald-400/10
              flex
              items-center
              justify-center
              shrink-0
            ">

              <Zap
                size={20}
                className="
                  text-emerald-400
                "
              />

            </div>


            <div className="
              min-w-0
            ">

              <h2 className="
                text-lg
                font-semibold
                text-white
              ">
                {booking.stationName}
              </h2>


              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                {booking.operator}
              </p>

            </div>

          </div>


          {/* STATUS */}

          <span
            className={`
              w-fit
              inline-flex
              items-center
              gap-1.5
              px-3
              py-1.5
              rounded-full
              text-xs
              font-medium
              ${config.className}
            `}
          >

            <StatusIcon
              size={14}
            />

            {config.label}

          </span>

        </div>


        {/* LOCATION */}

        <div className="
          flex
          items-start
          gap-2
          mt-5
        ">

          <MapPin
            size={16}
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

            {booking.address}

            {booking.city &&
              `, ${booking.city}`}

          </p>

        </div>


        {/* DETAILS */}

        <div className="
          grid
          grid-cols-2
          sm:grid-cols-4
          gap-3
          mt-5
        ">


          <div className="
            bg-slate-950
            rounded-xl
            p-3
          ">

            <p className="
              text-xs
              text-slate-600
            ">
              Date
            </p>


            <p className="
              text-sm
              text-white
              font-medium
              mt-1
            ">
              {booking.date}
            </p>

          </div>


          <div className="
            bg-slate-950
            rounded-xl
            p-3
          ">

            <p className="
              text-xs
              text-slate-600
            ">
              Start time
            </p>


            <p className="
              text-sm
              text-white
              font-medium
              mt-1
            ">
              {booking.startTime}
            </p>

          </div>


          <div className="
            bg-slate-950
            rounded-xl
            p-3
          ">

            <p className="
              text-xs
              text-slate-600
            ">
              Duration
            </p>


            <p className="
              text-sm
              text-white
              font-medium
              mt-1
            ">
              {booking.duration} min
            </p>

          </div>


          <div className="
            bg-slate-950
            rounded-xl
            p-3
          ">

            <p className="
              text-xs
              text-slate-600
            ">
              Charger
            </p>


            <p className="
              text-sm
              text-white
              font-medium
              mt-1
            ">
              #{Number(
                booking.chargerIndex
              ) + 1}
            </p>

          </div>

        </div>


        {/* CHARGER INFORMATION */}

        <div className="
          flex
          flex-wrap
          items-center
          gap-3
          mt-5
        ">

          <span className="
            px-3
            py-1.5
            rounded-lg
            bg-slate-800
            text-xs
            text-slate-400
          ">
            {booking.connectorType}
          </span>


          <span className="
            px-3
            py-1.5
            rounded-lg
            bg-slate-800
            text-xs
            text-slate-400
          ">
            {booking.power} kW
          </span>


          <span className="
            px-3
            py-1.5
            rounded-lg
            bg-slate-800
            text-xs
            text-slate-400
          ">
            ₹{booking.pricePerKwh}/kWh
          </span>


          {booking.amount !==
            undefined && (

            <span className="
              px-3
              py-1.5
              rounded-lg
              bg-slate-800
              text-xs
              text-slate-300
            ">
              Paid ₹{booking.amount}
            </span>

          )}

        </div>

        {status ===
          "confirmed" && (

          <div className="
            mt-6
            p-5
            rounded-xl
            border
            border-emerald-400/20
            bg-emerald-400/5
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <Clock3
                size={21}
                className="
                  text-emerald-400
                "
              />


              <div>

                <p className="
                  text-sm
                  font-semibold
                  text-white
                ">
                  Charging session reserved
                </p>


                <p className="
                  text-xs
                  text-slate-500
                  mt-1
                ">
                  Your session will start at{" "}

                  <span className="
                    text-slate-300
                  ">
                    {booking.startTime}
                  </span>
                  .
                </p>

              </div>

            </div>

          </div>

        )}

        {status ===
          "active" && (

          <div className="
            mt-6
            p-6
            rounded-xl
            border
            border-purple-400/20
            bg-purple-400/5
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="
                w-11
                h-11
                rounded-xl
                bg-purple-400/10
                flex
                items-center
                justify-center
              ">

                <BatteryCharging
                  size={22}
                  className="
                    text-purple-400
                  "
                />

              </div>


              <div>

                <p className="
                  text-sm
                  font-semibold
                  text-white
                ">
                  Charging in progress
                </p>


                <p className="
                  text-xs
                  text-slate-500
                  mt-1
                ">
                  Your charging session is active.
                </p>

              </div>

            </div>


            {/* COUNTDOWN */}

            <div className="
              text-center
              mt-7
            ">

              <p className="
                text-xs
                uppercase
                tracking-widest
                text-purple-300
              ">
                Time remaining
              </p>


              <p className="
                text-5xl
                sm:text-6xl
                font-bold
                tracking-tight
                text-white
                mt-2
                tabular-nums
              ">
                {formatTime(
                  remainingSeconds
                )}
              </p>


              <div className="
                h-2
                bg-slate-800
                rounded-full
                overflow-hidden
                mt-6
              ">

                <div
                  className="
                    h-full
                    bg-purple-400
                    rounded-full
                    transition-all
                  "
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (
                          remainingSeconds /
                          (
                            Number(
                              booking.duration
                            ) * 60
                          )
                        ) * 100
                      )
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* LIVE CHARGING DETAILS */}

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3
              mt-6
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
                  Energy used
                </p>

                <p className="
                  text-xl
                  font-bold
                  text-white
                  mt-1
                ">
                  {(
                    (
                      Number(booking.power) || 0
                    ) *
                    (
                      Math.max(
                        0,
                        (
                          Number(booking.duration) || 0
                        ) * 60 -
                        remainingSeconds
                      ) / 3600
                    )
                  ).toFixed(2)}{" "}
                  <span className="
                    text-sm
                    font-normal
                    text-slate-500
                  ">
                    kWh
                  </span>
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
                  Current charging cost
                </p>

                <p className="
                  text-xl
                  font-bold
                  text-emerald-400
                  mt-1
                ">
                  ₹{(
                    (
                      Number(booking.power) || 0
                    ) *
                    (
                      Math.max(
                        0,
                        (
                          Number(booking.duration) || 0
                        ) * 60 -
                        remainingSeconds
                      ) / 3600
                    ) *
                    (
                      Number(booking.pricePerKwh) || 0
                    )
                  ).toFixed(2)}
                </p>

              </div>

            </div>


            {/* CANCEL DURING CHARGING */}

            <div className="
              mt-6
              flex
              justify-center
            ">

              <button
                onClick={() =>
                  handleCancelBooking(
                    booking
                  )
                }
                disabled={
                  cancellingId ===
                  booking.id
                }
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  border-red-500/30
                  text-red-400
                  hover:bg-red-500/10
                  disabled:opacity-50
                  transition
                  text-sm
                  font-medium
                "
              >

                {cancellingId ===
                booking.id

                  ? "Cancelling..."

                  : "Cancel charging"}

              </button>

            </div>

          </div>

        )}

        {status ===
          "completed" && (

          <div className="
            mt-6
            p-6
            rounded-xl
            border
            border-blue-400/20
            bg-blue-400/5
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="
                w-11
                h-11
                rounded-xl
                bg-blue-400/10
                flex
                items-center
                justify-center
              ">

                <CircleCheck
                  size={23}
                  className="
                    text-blue-400
                  "
                />

              </div>


              <div>

                <p className="
                  text-sm
                  font-semibold
                  text-white
                ">
                  Charging completed
                </p>


                <p className="
                  text-sm
                  text-slate-400
                  mt-1
                ">
                  Please remove the connector.
                </p>

              </div>

            </div>


            <div className="
              mt-5
              p-4
              rounded-xl
              bg-slate-950
              border
              border-slate-800
            ">

              <p className="
                text-xs
                text-slate-600
              ">
                Session complete
              </p>


              <p className="
                text-sm
                text-slate-300
                mt-1
              ">
                Your reserved charging time has ended.
              </p>

            </div>

          </div>

        )}


        {status ===
          "cancelled" && (

          <div className="
            mt-6
            p-5
            rounded-xl
            border
            border-red-400/20
            bg-red-400/5
          ">

            <div className="
              flex
              items-start
              gap-3
            ">

              <div className="
                w-11
                h-11
                rounded-xl
                bg-red-400/10
                flex
                items-center
                justify-center
                shrink-0
              ">

                <CircleX
                  size={22}
                  className="
                    text-red-400
                  "
                />

              </div>


              <div>

                <p className="
                  text-sm
                  font-semibold
                  text-white
                ">
                  Booking cancelled
                </p>


                <p className="
                  text-xs
                  text-slate-500
                  mt-1
                ">
                  This charging session was cancelled.
                </p>

              </div>

            </div>


            {/* REFUND */}

            {Number(
              booking.refundAmount
            ) > 0 && (

              <div className="
                mt-5
                p-4
                rounded-xl
                bg-slate-950
                border
                border-emerald-400/20
              ">

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <Wallet
                    size={20}
                    className="
                      text-emerald-400
                    "
                  />


                  <div>

                    <p className="
                      text-xs
                      text-slate-500
                    ">
                      Refund credited to wallet
                    </p>


                    <p className="
                      text-xl
                      font-bold
                      text-emerald-400
                      mt-1
                    ">
                      ₹{Number(
                        booking.refundAmount
                      ).toFixed(2)}
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        )}

      </div>


      <div className="
        border-t
        border-slate-800
        px-5
        sm:px-6
        py-4
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-3
      ">


        <div className="
          flex
          items-center
          gap-2
          text-xs
          text-slate-500
        ">

          <History size={14} />

          Booking ID:

          <span className="
            text-slate-400
          ">
            {booking.id.slice(
              0,
              8
            )}
          </span>

        </div>


        {/* CANCEL BEFORE START */}

        {status ===
          "confirmed" && (

          <button
            onClick={() =>
              handleCancelBooking(
                booking
              )
            }
            disabled={
              cancellingId ===
              booking.id
            }
            className="
              w-full
              sm:w-auto
              px-4
              py-2
              rounded-lg
              border
              border-red-500/30
              text-sm
              text-red-400
              hover:bg-red-500/10
              disabled:opacity-50
              transition
            "
          >

            {cancellingId ===
            booking.id

              ? "Cancelling..."

              : "Cancel booking"}

          </button>

        )}

      </div>

    </div>

  );

}


export default Bookings;