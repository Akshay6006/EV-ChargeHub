import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  CircleCheck,
  History,
  CreditCard,
  RotateCcw,
  Car,
  BatteryCharging,
  CalendarDays,
  Clock,
  MapPin,
  Zap,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";


function Wallet() {

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /*
   * BookingForm sends booking information here.
   *
   * Normal visit:
   * /wallet
   *
   * Booking checkout:
   * /wallet + location.state
   */

  const booking = location.state || null;

  const [walletBalance, setWalletBalance] = useState(0);

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [vehicles, setVehicles] = useState([]);

  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [loadingVehicles, setLoadingVehicles] =
    useState(false);

  const [paying, setPaying] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");


  // ==========================================
  // REAL-TIME WALLET BALANCE
  // ==========================================

  useEffect(() => {

    if (!user) {

      setWalletBalance(0);
      setLoading(false);

      return;
    }


    const userRef = doc(
      db,
      "users",
      user.uid
    );


    const unsubscribe = onSnapshot(
      userRef,

      (snapshot) => {

        if (snapshot.exists()) {

          const data =
            snapshot.data();

          const balance =
            Number(data.walletBalance) || 0;

          setWalletBalance(balance);

        } else {

          setWalletBalance(0);

        }

        setLoading(false);

      },

      (error) => {

        console.error(
          "Wallet balance error:",
          error
        );

        setWalletBalance(0);

        setLoading(false);

      }
    );


    return () => unsubscribe();

  }, [user]);


  // ==========================================
  // LOAD TRANSACTIONS
  // ==========================================

  useEffect(() => {

    if (!user) {

      setTransactions([]);

      return;
    }


    const loadTransactions =
      async () => {

        try {

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


          const bookingData =
            snapshot.docs.map(
              (bookingDoc) => ({
                id:
                  bookingDoc.id,

                ...bookingDoc.data(),
              })
            );


          const transactionList = [];


          bookingData.forEach(
            (booking) => {

              const amount =
                Number(
                  booking.amount
                ) || 0;


              const refundAmount =
                Number(
                  booking.refundAmount
                ) || 0;


              // PAYMENT

              if (
                amount > 0 &&
                booking.paymentStatus !==
                  "failed"
              ) {

                transactionList.push({

                  id:
                    `${booking.id}-payment`,

                  bookingId:
                    booking.id,

                  type:
                    "payment",

                  amount,

                  stationName:
                    booking.stationName ||
                    "Charging station",

                  chargerIndex:
                    booking.chargerIndex,

                  paymentMethod:
                    booking.paymentMethod ||
                    "Wallet",

                  status:
                    booking.paymentStatus ||
                    "paid",

                  date:
                    booking.paidAt ||
                    booking.createdAt,

                });

              }


              // REFUND

              if (
                refundAmount > 0
              ) {

                transactionList.push({

                  id:
                    `${booking.id}-refund`,

                  bookingId:
                    booking.id,

                  type:
                    "refund",

                  amount:
                    refundAmount,

                  stationName:
                    booking.stationName ||
                    "Charging station",

                  chargerIndex:
                    booking.chargerIndex,

                  paymentMethod:
                    "Wallet refund",

                  status:
                    "refunded",

                  date:
                    booking.refundedAt ||
                    booking.cancelledAt ||
                    booking.updatedAt ||
                    booking.createdAt,

                });

              }

            }
          );


          // NEWEST FIRST

          transactionList.sort(
            (a, b) =>
              getDateValue(b.date) -
              getDateValue(a.date)
          );


          setTransactions(
            transactionList
          );


        } catch (error) {

          console.error(
            "Wallet transaction error:",
            error
          );

          setTransactions([]);

        }

      };


    loadTransactions();

  }, [user]);


  // ==========================================
  // LOAD SAVED VEHICLES
  // ==========================================

  useEffect(() => {

    const loadVehicles =
      async () => {

        if (!user?.uid) {

          setVehicles([]);

          return;
        }


        try {

          setLoadingVehicles(true);

          const vehiclesQuery =
            query(
              collection(
                db,
                "vehicles"
              ),

              where(
                "userId",
                "==",
                user.uid
              )
            );


          const snapshot =
            await getDocs(
              vehiclesQuery
            );


          const vehicleList =
            snapshot.docs.map(
              (vehicleDoc) => ({

                id:
                  vehicleDoc.id,

                ...vehicleDoc.data(),

              })
            );


          setVehicles(
            vehicleList
          );


          /*
           * If user has only one vehicle,
           * automatically select it.
           */

          if (
            vehicleList.length === 1
          ) {

            setSelectedVehicleId(
              vehicleList[0].id
            );

          }


        } catch (error) {

          console.error(
            "Vehicle loading error:",
            error
          );

          setVehicles([]);

        } finally {

          setLoadingVehicles(false);

        }

      };


    loadVehicles();

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


    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();

  }


  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(value) {

    const time =
      getDateValue(value);


    if (!time) {

      return "—";

    }


    return new Date(
      time
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
  // BOOKING DATA
  // ==========================================

  const totalAmount =
    booking
      ? Number(
          booking.amount
        ) || 0
      : 0;


  const selectedVehicle =
    vehicles.find(
      (vehicle) =>
        vehicle.id ===
        selectedVehicleId
    );


  const hasEnoughWallet =
    walletBalance >=
    totalAmount;


  // ==========================================
  // PAY + CREATE BOOKING
  // ==========================================

  const handlePayment =
    async () => {

      setError("");


      if (!user) {

        setError(
          "Please login before making payment."
        );

        return;

      }


      if (!booking) {

        return;

      }


      if (!selectedVehicle) {

        setError(
          "Please select a vehicle before continuing."
        );

        return;

      }


      if (
        !hasEnoughWallet
      ) {

        setError(
          "Insufficient wallet balance."
        );

        return;

      }


      try {

        setPaying(true);


        const userRef =
          doc(
            db,
            "users",
            user.uid
          );


        const bookingsRef =
          collection(
            db,
            "bookings"
          );


        /*
         * Firestore transaction:
         *
         * 1. Read latest wallet
         * 2. Check balance
         * 3. Create booking
         * 4. Save vehicle details
         * 5. Deduct wallet
         */

        await runTransaction(
          db,

          async (transaction) => {

            const userSnapshot =
              await transaction.get(
                userRef
              );


            if (
              !userSnapshot.exists()
            ) {

              throw new Error(
                "User profile not found."
              );

            }


            const currentUserData =
              userSnapshot.data();


            const currentWallet =
              Number(
                currentUserData.walletBalance
              ) || 0;


            /*
             * IMPORTANT:
             * Check wallet again inside
             * transaction.
             */

            if (
              currentWallet <
              totalAmount
            ) {

              throw new Error(
                "Insufficient wallet balance."
              );

            }


            const newBalance =
              Number(
                (
                  currentWallet -
                  totalAmount
                ).toFixed(2)
              );


            /*
             * CREATE BOOKING
             */

            const newBookingRef =
              doc(
                bookingsRef
              );


            transaction.set(
              newBookingRef,
              {

                // =========================
                // USER
                // =========================

                userId:
                  user.uid,

                userEmail:
                  user.email || "",


                // =========================
                // STATION
                // =========================

                stationId:
                  booking.stationId,

                stationName:
                  booking.stationName,

                operator:
                  booking.operator ||
                  "",

                address:
                  booking.address ||
                  "",

                city:
                  booking.city ||
                  "",


                // =========================
                // CHARGER
                // =========================

                chargerIndex:
                  booking.chargerIndex,

                connectorType:
                  booking.charger
                    ?.connectorType ||
                  "",

                power:
                  Number(
                    booking.charger?.power
                  ) || 0,

                pricePerKwh:
                  Number(
                    booking.charger
                      ?.pricePerKwh
                  ) || 0,


                // =========================
                // VEHICLE
                // =========================

                vehicleId:
                  selectedVehicle.id,

                vehicleBrand:
                  selectedVehicle.brand ||
                  "",

                vehicleModel:
                  selectedVehicle.model ||
                  "",

                registrationNumber:
                  selectedVehicle.registrationNumber ||
                  "",

                batteryCapacity:
                  Number(
                    selectedVehicle.batteryCapacity
                  ) || 0,

                vehicleConnectorType:
                  selectedVehicle.connectorType ||
                  "",

                currentBattery:
                  Number(
                    selectedVehicle.currentBattery
                  ) || 0,


                // =========================
                // BOOKING
                // =========================

                date:
                  booking.date,

                startTime:
                  booking.startTime,

                duration:
                  Number(
                    booking.duration
                  ) || 0,

                energy:
                  Number(
                    booking.energy
                  ) || 0,

                amount:
                  totalAmount,


                // =========================
                // SESSION
                // =========================

                startAt:
                  booking.startAt,

                endAt:
                  booking.endAt,


                // =========================
                // PAYMENT
                // =========================

                status:
                  "confirmed",

                paymentStatus:
                  "paid",

                paymentMethod:
                  "wallet",

                paidAt:
                  serverTimestamp(),

                createdAt:
                  serverTimestamp(),

              }
            );


            // =========================
            // DEDUCT WALLET
            // =========================

            transaction.update(
              userRef,
              {
                walletBalance:
                  newBalance,
              }
            );

          }
        );


        // =========================
        // SUCCESS
        // =========================

        setSuccess(true);


      } catch (error) {

        console.error(
          "Payment error:",
          error
        );


        setError(
          error.message ||
          "Payment failed. Please try again."
        );


      } finally {

        setPaying(false);

      }

    };


  // ==========================================
  // TOTALS
  // ==========================================

  const totalPaid =
    transactions
      .filter(
        (transaction) =>
          transaction.type ===
          "payment"
      )
      .reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0
      );


  const totalRefunded =
    transactions
      .filter(
        (transaction) =>
          transaction.type ===
          "refund"
      )
      .reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0
      );


  const totalTransactions =
    transactions.length;


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
            Loading your wallet...
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // SUCCESS SCREEN
  // ==========================================

  if (success) {

    return (

      <div className="max-w-2xl mx-auto">

        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-8
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

            <CheckCircle2
              size={34}
              className="
                text-emerald-400
              "
            />

          </div>


          <h1
            className="
              text-2xl
              font-bold
              text-white
              mt-6
            "
          >
            Payment successful
          </h1>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Your charging session has been confirmed.
          </p>


          <div
            className="
              mt-6
              p-5
              rounded-xl
              bg-slate-950
              border
              border-slate-800
              text-left
            "
          >

            <div
              className="
                flex
                justify-between
                gap-4
              "
            >

              <span className="text-slate-500">
                Station
              </span>

              <span
                className="
                  text-white
                  font-medium
                  text-right
                "
              >
                {booking?.stationName}
              </span>

            </div>


            <div
              className="
                flex
                justify-between
                gap-4
                mt-3
              "
            >

              <span className="text-slate-500">
                Vehicle
              </span>

              <span
                className="
                  text-white
                  text-right
                "
              >
                {selectedVehicle?.brand}{" "}
                {selectedVehicle?.model}
              </span>

            </div>


            <div
              className="
                flex
                justify-between
                gap-4
                mt-3
              "
            >

              <span className="text-slate-500">
                Amount
              </span>

              <span
                className="
                  text-emerald-400
                  font-bold
                "
              >
                ₹{totalAmount.toFixed(2)}
              </span>

            </div>

          </div>


          <button
            onClick={() =>
              navigate(
                "/bookings"
              )
            }
            className="
              w-full
              mt-6
              bg-emerald-400
              hover:bg-emerald-300
              text-slate-950
              font-semibold
              py-3.5
              rounded-xl
              transition
            "
          >
            View My Booking
          </button>


          <button
            onClick={() => {
              navigate("/wallet", {
                replace: true,
              });

              window.location.reload();
            }}
            className="
              w-full
              mt-3
              bg-slate-800
              hover:bg-slate-700
              text-white
              font-medium
              py-3.5
              rounded-xl
              transition
            "
          >
            Go to Wallet
          </button>

        </div>

      </div>

    );

  }


  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (

    <div
      className="
        max-w-6xl
        mx-auto
        space-y-8
      "
    >

      {/* ======================================
          CHECKOUT MODE
      ======================================= */}

      {booking && (

        <div>

          {/* BACK */}

          <button
            onClick={() =>
              navigate("/stations")
            }
            className="
              flex
              items-center
              gap-2
              text-slate-400
              hover:text-white
              transition
              mb-6
            "
          >

            <ArrowLeft
              size={18}
            />

            Back to booking

          </button>


          {/* HEADER */}

          <div className="mb-8">

            <p
              className="
                text-sm
                text-emerald-400
                font-medium
              "
            >
              Secure checkout
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
              Confirm & Pay
            </h1>


            <p
              className="
                text-slate-500
                mt-2
              "
            >
              Payment will be deducted from your EV ChargeHub wallet.
            </p>

          </div>


          <div
            className="
              grid
              lg:grid-cols-3
              gap-6
            "
          >

            {/* ================================
                BOOKING DETAILS
            ================================= */}

            <div
              className="
                lg:col-span-2
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                  mb-6
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
                  "
                >

                  <Zap
                    size={21}
                    className="text-emerald-400"
                  />

                </div>


                <div>

                  <h2
                    className="
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Charging details
                  </h2>

                  <p
                    className="
                      text-xs
                      text-slate-500
                      mt-1
                    "
                  >
                    Review your charging session
                  </p>

                </div>

              </div>


              {/* STATION */}

              <div
                className="
                  p-4
                  rounded-xl
                  bg-slate-950
                  border
                  border-slate-800
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >

                  <MapPin
                    size={19}
                    className="text-emerald-400 mt-1"
                  />

                  <div>

                    <p
                      className="
                        text-white
                        font-semibold
                      "
                    >
                      {booking.stationName}
                    </p>

                    <p
                      className="
                        text-sm
                        text-slate-500
                        mt-1
                      "
                    >
                      {booking.address}
                    </p>

                    {booking.city && (

                      <p
                        className="
                          text-xs
                          text-slate-600
                          mt-1
                        "
                      >
                        {booking.city}
                      </p>

                    )}

                  </div>

                </div>

              </div>


              {/* DETAILS GRID */}

              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-4
                  gap-3
                  mt-4
                "
              >

                <div
                  className="
                    p-4
                    rounded-xl
                    bg-slate-950
                    border
                    border-slate-800
                  "
                >

                  <CalendarDays
                    size={17}
                    className="text-emerald-400"
                  />

                  <p
                    className="
                      text-xs
                      text-slate-600
                      mt-3
                    "
                  >
                    Date
                  </p>

                  <p
                    className="
                      text-sm
                      text-white
                      mt-1
                    "
                  >
                    {booking.date}
                  </p>

                </div>


                <div
                  className="
                    p-4
                    rounded-xl
                    bg-slate-950
                    border
                    border-slate-800
                  "
                >

                  <Clock
                    size={17}
                    className="text-emerald-400"
                  />

                  <p
                    className="
                      text-xs
                      text-slate-600
                      mt-3
                    "
                  >
                    Start
                  </p>

                  <p
                    className="
                      text-sm
                      text-white
                      mt-1
                    "
                  >
                    {booking.startTime}
                  </p>

                </div>


                <div
                  className="
                    p-4
                    rounded-xl
                    bg-slate-950
                    border
                    border-slate-800
                  "
                >

                  <Clock
                    size={17}
                    className="text-emerald-400"
                  />

                  <p
                    className="
                      text-xs
                      text-slate-600
                      mt-3
                    "
                  >
                    Duration
                  </p>

                  <p
                    className="
                      text-sm
                      text-white
                      mt-1
                    "
                  >
                    {booking.duration} min
                  </p>

                </div>


                <div
                  className="
                    p-4
                    rounded-xl
                    bg-slate-950
                    border
                    border-slate-800
                  "
                >

                  <BatteryCharging
                    size={17}
                    className="text-emerald-400"
                  />

                  <p
                    className="
                      text-xs
                      text-slate-600
                      mt-3
                    "
                  >
                    Energy
                  </p>

                  <p
                    className="
                      text-sm
                      text-white
                      mt-1
                    "
                  >
                    {Number(
                      booking.energy || 0
                    ).toFixed(2)}{" "}
                    kWh
                  </p>

                </div>

              </div>


              {/* VEHICLE */}

              <div className="mt-6">

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-3
                  "
                >

                  <Car
                    size={19}
                    className="text-emerald-400"
                  />

                  <h3
                    className="
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    Select vehicle
                  </h3>

                </div>


                {loadingVehicles ? (

                  <div
                    className="
                      p-5
                      rounded-xl
                      bg-slate-950
                      border
                      border-slate-800
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <Loader2
                      size={18}
                      className="
                        text-emerald-400
                        animate-spin
                      "
                    />

                    <span className="text-slate-500">
                      Loading your vehicles...
                    </span>

                  </div>

                ) : vehicles.length === 0 ? (

                  <div
                    className="
                      p-5
                      rounded-xl
                      bg-slate-950
                      border
                      border-red-500/20
                    "
                  >

                    <p
                      className="
                        text-red-400
                        font-medium
                      "
                    >
                      No vehicle found
                    </p>

                    <p
                      className="
                        text-sm
                        text-slate-500
                        mt-1
                      "
                    >
                      Add a vehicle before booking a charger.
                    </p>


                    <button
                      onClick={() =>
                        navigate("/vehicles")
                      }
                      className="
                        mt-4
                        bg-emerald-400
                        hover:bg-emerald-300
                        text-slate-950
                        font-semibold
                        px-4
                        py-2.5
                        rounded-xl
                      "
                    >
                      Add Vehicle
                    </button>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {vehicles.map(
                      (vehicle) => (

                        <button
                          key={vehicle.id}
                          type="button"
                          onClick={() =>
                            setSelectedVehicleId(
                              vehicle.id
                            )
                          }
                          className={`
                            w-full
                            text-left
                            p-4
                            rounded-xl
                            border
                            transition
                            ${
                              selectedVehicleId ===
                              vehicle.id

                                ? "border-emerald-400 bg-emerald-400/10"

                                : "border-slate-800 bg-slate-950 hover:border-slate-700"
                            }
                          `}
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-4
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
                                  bg-slate-800
                                  flex
                                  items-center
                                  justify-center
                                "
                              >

                                <Car
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
                                    font-semibold
                                    text-white
                                  "
                                >
                                  {vehicle.brand}{" "}
                                  {vehicle.model}
                                </p>


                                <p
                                  className="
                                    text-xs
                                    text-slate-500
                                    mt-1
                                  "
                                >
                                  {vehicle.registrationNumber}
                                </p>

                              </div>

                            </div>


                            {selectedVehicleId ===
                              vehicle.id && (

                              <CheckCircle2
                                size={21}
                                className="
                                  text-emerald-400
                                "
                              />

                            )}

                          </div>


                          <div
                            className="
                              flex
                              flex-wrap
                              gap-3
                              mt-3
                              pl-[52px]
                            "
                          >

                            <span
                              className="
                                text-xs
                                text-slate-500
                              "
                            >
                              Battery{" "}
                              {vehicle.batteryCapacity} kWh
                            </span>

                            <span
                              className="
                                text-xs
                                text-slate-500
                              "
                            >
                              {vehicle.connectorType}
                            </span>

                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>


            {/* ================================
                PAYMENT CARD
            ================================= */}

            <div>

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-6
                  sticky
                  top-24
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
                      w-11
                      h-11
                      rounded-xl
                      bg-emerald-400/10
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <WalletIcon
                      size={21}
                      className="text-emerald-400"
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Available balance
                    </p>

                    <p
                      className="
                        text-xl
                        font-bold
                        text-white
                      "
                    >
                      ₹{walletBalance.toFixed(2)}
                    </p>

                  </div>

                </div>


                <div
                  className="
                    border-t
                    border-slate-800
                    mt-6
                    pt-6
                  "
                >

                  <div
                    className="
                      flex
                      justify-between
                      text-sm
                    "
                  >

                    <span className="text-slate-500">
                      Charging cost
                    </span>

                    <span className="text-white">
                      ₹{totalAmount.toFixed(2)}
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      justify-between
                      mt-4
                      pt-4
                      border-t
                      border-slate-800
                    "
                  >

                    <span
                      className="
                        text-white
                        font-semibold
                      "
                    >
                      Remaining balance
                    </span>

                    <span
                      className={`
                        font-bold
                        ${
                          hasEnoughWallet
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      `}
                    >
                      ₹
                      {Math.max(
                        0,
                        walletBalance -
                          totalAmount
                      ).toFixed(2)}
                    </span>

                  </div>

                </div>


                {!hasEnoughWallet && (

                  <div
                    className="
                      mt-5
                      p-4
                      rounded-xl
                      bg-red-500/10
                      border
                      border-red-500/20
                    "
                  >

                    <p
                      className="
                        text-sm
                        text-red-400
                        font-medium
                      "
                    >
                      Insufficient wallet balance
                    </p>

                    <p
                      className="
                        text-xs
                        text-slate-500
                        mt-1
                      "
                    >
                      Add money to your wallet before booking.
                    </p>

                  </div>

                )}


                {error && (

                  <div
                    className="
                      mt-5
                      p-4
                      rounded-xl
                      bg-red-500/10
                      border
                      border-red-500/20
                    "
                  >

                    <p
                      className="
                        text-sm
                        text-red-400
                      "
                    >
                      {error}
                    </p>

                  </div>

                )}


                <button
                  onClick={handlePayment}
                  disabled={
                    paying ||
                    !hasEnoughWallet ||
                    !selectedVehicle ||
                    vehicles.length === 0
                  }
                  className="
                    w-full
                    mt-6
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-emerald-400
                    hover:bg-emerald-300
                    disabled:bg-slate-800
                    disabled:text-slate-600
                    text-slate-950
                    font-semibold
                    py-3.5
                    rounded-xl
                    transition
                  "
                >

                  {paying ? (

                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Processing payment...

                    </>

                  ) : (

                    <>
                      <WalletIcon
                        size={18}
                      />

                      Pay ₹
                      {totalAmount.toFixed(2)}
                    </>

                  )}

                </button>


                <p
                  className="
                    text-[11px]
                    text-slate-600
                    text-center
                    mt-4
                  "
                >
                  Your wallet will be charged only after you confirm payment.
                </p>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          NORMAL WALLET
      ======================================= */}

      {!booking && (

        <>

          {/* HEADER */}

          <div>

            <p
              className="
                text-sm
                text-emerald-400
                font-medium
              "
            >
              Payments
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
              My Wallet
            </h1>


            <p
              className="
                text-slate-500
                mt-2
              "
            >
              Manage your balance, charging payments and refunds.
            </p>

          </div>


          {/* BALANCE CARD */}

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-emerald-400/20
              bg-gradient-to-br
              from-emerald-400/10
              via-slate-900
              to-slate-900
              p-6
              sm:p-8
            "
          >

            <div
              className="
                absolute
                -top-20
                -right-20
                w-48
                h-48
                rounded-full
                bg-emerald-400/10
                blur-3xl
              "
            />


            <div className="relative">

              <div
                className="
                  flex
                  items-center
                  gap-3
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
                  "
                >

                  <WalletIcon
                    size={24}
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
                    Available balance
                  </p>

                  <p
                    className="
                      text-xs
                      text-slate-600
                      mt-1
                    "
                  >
                    Available for future charging
                  </p>

                </div>

              </div>


              <div className="mt-7">

                <p
                  className="
                    text-4xl
                    sm:text-5xl
                    font-bold
                    text-white
                  "
                >
                  ₹{walletBalance.toFixed(2)}
                </p>

              </div>


              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-emerald-400
                "
              >

                <CircleCheck
                  size={16}
                />

                Wallet is ready to use

              </div>

            </div>

          </div>


          {/* SUMMARY */}

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

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Total Paid
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                ₹{totalPaid.toFixed(2)}
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

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Total Refunded
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-emerald-400
                  mt-2
                "
              >
                ₹{totalRefunded.toFixed(2)}
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

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Transactions
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-white
                  mt-2
                "
              >
                {totalTransactions}
              </p>

            </div>

          </div>


          {/* TRANSACTION HISTORY */}

          <div>

            <div
              className="
                flex
                items-center
                gap-3
                mb-4
              "
            >

              <History
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
                  Transaction History
                </h2>

                <p
                  className="
                    text-xs
                    text-slate-500
                    mt-1
                  "
                >
                  Payments and refunds from your charging sessions
                </p>

              </div>

            </div>


            {transactions.length === 0 ? (

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-8
                  text-center
                "
              >

                <History
                  size={21}
                  className="
                    mx-auto
                    text-slate-500
                  "
                />

                <p
                  className="
                    text-white
                    font-medium
                    mt-4
                  "
                >
                  No transactions yet
                </p>

                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  Your charging payments and refunds will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {transactions.map(
                  (transaction) => {

                    const isRefund =
                      transaction.type ===
                      "refund";


                    const chargerNumber =
                      transaction.chargerIndex !==
                        undefined &&
                      transaction.chargerIndex !==
                        null

                        ? Number(
                            transaction.chargerIndex
                          ) + 1

                        : null;


                    return (

                      <div
                        key={transaction.id}
                        className="
                          bg-slate-900
                          border
                          border-slate-800
                          rounded-2xl
                          p-5
                          sm:p-6
                        "
                      >

                        <div
                          className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-4
                          "
                        >

                          {/* LEFT */}

                          <div
                            className="
                              flex
                              items-center
                              gap-4
                            "
                          >

                            <div
                              className={`
                                w-11
                                h-11
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                ${
                                  isRefund
                                    ? "bg-emerald-400/10"
                                    : "bg-slate-800"
                                }
                              `}
                            >

                              {isRefund ? (

                                <ArrowDownLeft
                                  size={20}
                                  className="
                                    text-emerald-400
                                  "
                                />

                              ) : (

                                <ArrowUpRight
                                  size={20}
                                  className="
                                    text-slate-300
                                  "
                                />

                              )}

                            </div>


                            <div>

                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-white
                                "
                              >
                                {isRefund
                                  ? "Charging refund"
                                  : "Charging payment"}
                              </p>


                              <p
                                className="
                                  text-xs
                                  text-slate-500
                                  mt-1
                                "
                              >
                                {transaction.stationName}
                              </p>


                              <div
                                className="
                                  flex
                                  flex-wrap
                                  gap-x-3
                                  gap-y-1
                                  mt-1
                                "
                              >

                                <p
                                  className="
                                    text-xs
                                    text-slate-600
                                  "
                                >
                                  {formatDate(
                                    transaction.date
                                  )}
                                </p>


                                {chargerNumber && (

                                  <p
                                    className="
                                      text-xs
                                      text-slate-600
                                    "
                                  >
                                    Charger{" "}
                                    {chargerNumber}
                                  </p>

                                )}


                                {!isRefund &&
                                  transaction.paymentMethod && (

                                    <p
                                      className="
                                        text-xs
                                        text-slate-600
                                      "
                                    >
                                      {transaction.paymentMethod}
                                    </p>

                                  )}

                              </div>


                              <p
                                className="
                                  text-xs
                                  text-slate-700
                                  mt-1
                                "
                              >
                                Booking #
                                {transaction.bookingId.slice(
                                  0,
                                  8
                                )}
                              </p>

                            </div>

                          </div>


                          {/* RIGHT */}

                          <div
                            className="
                              sm:text-right
                            "
                          >

                            <p
                              className={`
                                text-lg
                                font-bold
                                ${
                                  isRefund
                                    ? "text-emerald-400"
                                    : "text-white"
                                }
                              `}
                            >

                              {isRefund
                                ? "+"
                                : "-"}

                              ₹
                              {transaction.amount.toFixed(
                                2
                              )}

                            </p>


                            <div
                              className="
                                flex
                                items-center
                                gap-1.5
                                sm:justify-end
                                mt-1
                              "
                            >

                              {isRefund ? (

                                <>

                                  <RotateCcw
                                    size={12}
                                    className="
                                      text-emerald-400
                                    "
                                  />

                                  <p
                                    className="
                                      text-xs
                                      text-emerald-400
                                    "
                                  >
                                    Credited to wallet
                                  </p>

                                </>

                              ) : (

                                <>

                                  <CreditCard
                                    size={12}
                                    className="
                                      text-slate-500
                                    "
                                  />

                                  <p
                                    className="
                                      text-xs
                                      text-slate-500
                                    "
                                  >
                                    {transaction.status ||
                                      "Paid"}
                                  </p>

                                </>

                              )}

                            </div>

                          </div>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </>

      )}

    </div>

  );

}


export default Wallet;