import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import {
  BatteryCharging,
  CalendarDays,
  Clock,
  MapPin,
  Zap,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";


function BookingForm() {

  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();

  // ==========================================
  // SELECTED STATION
  // ==========================================

  const station =
    location.state?.station || null;


  // ==========================================
  // FORM STATE
  // ==========================================

  const [selectedCharger, setSelectedCharger] =
    useState("");

  const [date, setDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [duration, setDuration] =
    useState("30");


  // ==========================================
  // UI STATE
  // ==========================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // AVAILABLE CHARGERS
  // ==========================================

  const chargers =
    station?.chargers || [];


  const availableChargers =
    chargers
      .map((charger, index) => ({
        ...charger,
        index,
      }))
      .filter(
        (charger) =>
          charger.status === "available"
      );


  // ==========================================
  // DEFAULT DATE
  // ==========================================

  useEffect(() => {

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    setDate(today);

  }, []);


  // ==========================================
  // NO STATION
  // ==========================================

  if (!station) {

    return (

      <div className="max-w-3xl mx-auto">

        <div className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-10
          text-center
        ">

          <div className="
            w-14
            h-14
            mx-auto
            rounded-xl
            bg-amber-400/10
            flex
            items-center
            justify-center
          ">

            <BatteryCharging
              size={25}
              className="text-amber-400"
            />

          </div>


          <h1 className="
            text-xl
            font-semibold
            text-white
            mt-5
          ">
            No charger selected
          </h1>


          <p className="
            text-slate-500
            mt-2
          ">
            Select a charging station first.
          </p>


          <button
            onClick={() =>
              navigate("/stations")
            }
            className="
              mt-6
              px-5
              py-3
              rounded-xl
              bg-emerald-400
              hover:bg-emerald-300
              text-slate-950
              font-semibold
              transition
            "
          >
            Find a charger
          </button>

        </div>

      </div>

    );

  }


  // ==========================================
  // BOOKING → PAYMENT
  // ==========================================

  const handleBooking = async (e) => {

    e.preventDefault();

    setError("");


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!selectedCharger) {

      setError(
        "Please select a charger."
      );

      return;

    }


    if (!date) {

      setError(
        "Please select a date."
      );

      return;

    }


    if (!startTime) {

      setError(
        "Please select a starting time."
      );

      return;

    }


    if (!user) {

      setError(
        "You must be logged in to book a charger."
      );

      return;

    }


    try {

      setLoading(true);


      // ----------------------------------------
      // SELECT CHARGER
      // ----------------------------------------

      const chargerIndex =
        Number(selectedCharger);


      const charger =
        chargers[chargerIndex];


      if (!charger) {

        throw new Error(
          "Selected charger was not found."
        );

      }


      // ----------------------------------------
      // CHECK EXISTING BOOKINGS
      // ----------------------------------------

      const bookingsRef =
        collection(
          db,
          "bookings"
        );


      const bookingQuery =
        query(

          bookingsRef,

          where(
            "stationId",
            "==",
            station.id
          ),

          where(
            "chargerIndex",
            "==",
            chargerIndex
          ),

          where(
            "date",
            "==",
            date
          )

        );


      const snapshot =
        await getDocs(
          bookingQuery
        );


      // ----------------------------------------
      // CHECK TIME CONFLICT
      // ----------------------------------------

      const requestedStart =
        startTime;


      const requestedDuration =
        Number(duration);


      const requestedStartMinutes =
        timeToMinutes(
          requestedStart
        );


      const requestedEndMinutes =
        requestedStartMinutes +
        requestedDuration;


      const conflictingBooking =
        snapshot.docs.some(
          (bookingDoc) => {

            const booking =
              bookingDoc.data();


            // Cancelled bookings don't block
            // the charger.

            if (
              booking.status ===
              "cancelled"
            ) {

              return false;

            }


            const existingStart =
              timeToMinutes(
                booking.startTime
              );


            const existingEnd =
              existingStart +
              Number(
                booking.duration
              );


            return (

              requestedStartMinutes <
              existingEnd

              &&

              requestedEndMinutes >
              existingStart

            );

          }
        );


      if (conflictingBooking) {

        setError(
          "This charger is already booked during the selected time."
        );

        setLoading(false);

        return;

      }


      // ----------------------------------------
      // CALCULATE PAYMENT
      // ----------------------------------------

      const durationHours =
        requestedDuration / 60;


      const energy =
        Number(charger.power) *
        durationHours;


      const amount =
        Math.round(
          energy *
          Number(
            charger.pricePerKwh
          )
        );


      // ----------------------------------------
      // CALCULATE START / END
      // ----------------------------------------

      const startDateTime =
        new Date(
          `${date}T${startTime}:00`
        );


      const endDateTime =
        new Date(
          startDateTime.getTime() +
          requestedDuration *
          60 *
          1000
        );


      // ----------------------------------------
      // GO TO PAYMENT
      // ----------------------------------------

      navigate(
        "/wallet",
        {
          state: {

            stationId:
              station.id,

            stationName:
              station.name,

            operator:
              station.operator || "",

            address:
              station.address || "",

            city:
              station.city || "",

            charger,

            chargerIndex,

            date,

            startTime,

            duration:
              requestedDuration,

            energy:
              Number(
                energy.toFixed(2)
              ),

            amount,

            startAt:
              startDateTime.toISOString(),

            endAt:
              endDateTime.toISOString(),

          },
        }
      );


    } catch (error) {

      console.error(
        "Booking preparation error:",
        error
      );


      setError(
        "Unable to prepare your booking. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // MAIN UI
  // ==========================================

  return (

    <div className="
      max-w-4xl
      mx-auto
      space-y-6
    ">


      {/* ======================================
          BACK
      ======================================= */}

      <button
        onClick={() =>
          navigate("/stations")
        }
        className="
          flex
          items-center
          gap-2
          text-sm
          text-slate-500
          hover:text-white
          transition
        "
      >

        <ArrowLeft size={16} />

        Back to chargers

      </button>


      {/* ======================================
          HEADER
      ======================================= */}

      <div>

        <p className="
          text-sm
          text-emerald-400
          font-medium
        ">
          Charging reservation
        </p>


        <h1 className="
          text-3xl
          sm:text-4xl
          font-bold
          text-white
          mt-2
        ">
          Book a charger
        </h1>


        <p className="
          text-slate-500
          mt-2
        ">
          Choose an available charger and reserve your charging time.
        </p>

      </div>


      {/* ======================================
          STATION
      ======================================= */}

      <div className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-5
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
              size={22}
              className="text-emerald-400"
            />

          </div>


          <div className="min-w-0">

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
              {station.operator}
            </p>


            <div className="
              flex
              items-start
              gap-2
              mt-3
            ">

              <MapPin
                size={16}
                className="
                  text-slate-500
                  mt-0.5
                "
              />


              <p className="
                text-sm
                text-slate-400
              ">
                {station.address}, {station.city}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          FORM
      ======================================= */}

      <form
        onSubmit={handleBooking}
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-5
          sm:p-6
          space-y-7
        "
      >


        {/* ERROR */}

        {error && (

          <div className="
            p-4
            rounded-xl
            bg-red-500/10
            border
            border-red-500/20
            text-red-400
            text-sm
          ">
            {error}
          </div>

        )}


        {/* ====================================
            CHARGER
        ===================================== */}

        <div>

          <div className="
            flex
            items-center
            gap-2
            mb-4
          ">

            <BatteryCharging
              size={18}
              className="
                text-emerald-400
              "
            />


            <h2 className="
              font-semibold
              text-white
            ">
              Select charger
            </h2>

          </div>


          {availableChargers.length === 0 ? (

            <div className="
              p-5
              rounded-xl
              bg-slate-950
              border
              border-slate-800
              text-center
            ">

              <p className="text-slate-400">
                No chargers are currently available.
              </p>

            </div>

          ) : (

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3
            ">

              {availableChargers.map(
                (charger) => (

                  <button
                    key={charger.index}
                    type="button"
                    onClick={() =>
                      setSelectedCharger(
                        String(
                          charger.index
                        )
                      )
                    }
                    className={`
                      text-left
                      p-4
                      rounded-xl
                      border
                      transition

                      ${
                        selectedCharger ===
                        String(
                          charger.index
                        )
                          ? "border-emerald-400 bg-emerald-400/5"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }
                    `}
                  >

                    <div className="
                      flex
                      items-center
                      justify-between
                    ">

                      <div>

                        <p className="
                          font-semibold
                          text-white
                        ">
                          Charger {charger.index + 1}
                        </p>


                        <p className="
                          text-sm
                          text-slate-500
                          mt-1
                        ">
                          {charger.connectorType}
                        </p>

                      </div>


                      <Zap
                        size={18}
                        className="
                          text-emerald-400
                        "
                      />

                    </div>


                    <div className="
                      flex
                      items-center
                      gap-4
                      mt-4
                    ">

                      <span className="
                        text-sm
                        text-slate-400
                      ">
                        {charger.power} kW
                      </span>


                      <span className="
                        text-sm
                        text-slate-400
                      ">
                        ₹{charger.pricePerKwh}/kWh
                      </span>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </div>


        {/* ====================================
            DATE + TIME
        ===================================== */}

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-5
        ">


          {/* DATE */}

          <div>

            <label className="
              flex
              items-center
              gap-2
              text-sm
              text-slate-300
              mb-2
            ">

              <CalendarDays
                size={16}
                className="
                  text-emerald-400
                "
              />

              Date

            </label>


            <input
              type="date"
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              className="
                w-full
                bg-slate-950
                border
                border-slate-800
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-emerald-400
              "
            />

          </div>


          {/* TIME */}

          <div>

            <label className="
              flex
              items-center
              gap-2
              text-sm
              text-slate-300
              mb-2
            ">

              <Clock
                size={16}
                className="
                  text-emerald-400
                "
              />

              Start time

            </label>


            <input
              type="time"
              value={startTime}
              onChange={(e) =>
                setStartTime(
                  e.target.value
                )
              }
              className="
                w-full
                bg-slate-950
                border
                border-slate-800
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-emerald-400
              "
            />

          </div>

        </div>


        {/* ====================================
            DURATION
        ===================================== */}

        <div>

          <label className="
            block
            text-sm
            text-slate-300
            mb-2
          ">
            Charging duration
          </label>


          <select
            value={duration}
            onChange={(e) =>
              setDuration(
                e.target.value
              )
            }
            className="
              w-full
              bg-slate-950
              border
              border-slate-800
              rounded-xl
              px-4
              py-3
              text-white
              outline-none
              focus:border-emerald-400
            "
          >

            <option value="30">
              30 minutes
            </option>

            <option value="60">
              1 hour
            </option>

            <option value="90">
              1 hour 30 minutes
            </option>

            <option value="120">
              2 hours
            </option>

          </select>

        </div>


        {/* ====================================
            ESTIMATED PRICE
        ===================================== */}

        {selectedCharger !== "" && (

          <div className="
            bg-slate-950
            border
            border-emerald-400/20
            rounded-xl
            p-5
          ">

            {(() => {

              const selected =
                chargers[
                  Number(selectedCharger)
                ];

              if (!selected) {
                return null;
              }


              const hours =
                Number(duration) / 60;


              const energy =
                Number(selected.power) *
                hours;


              const amount =
                Math.round(
                  energy *
                  Number(
                    selected.pricePerKwh
                  )
                );


              return (

                <>

                  <div className="
                    flex
                    items-center
                    justify-between
                    mb-4
                  ">

                    <div>

                      <p className="
                        text-sm
                        text-slate-500
                      ">
                        Estimated charging cost
                      </p>


                      <p className="
                        text-2xl
                        font-bold
                        text-white
                        mt-1
                      ">
                        ₹{amount}
                      </p>

                    </div>


                    <div className="
                      w-10
                      h-10
                      rounded-xl
                      bg-emerald-400/10
                      flex
                      items-center
                      justify-center
                    ">

                      <Zap
                        size={20}
                        className="
                          text-emerald-400
                        "
                      />

                    </div>

                  </div>


                  <div className="
                    grid
                    grid-cols-3
                    gap-3
                  ">

                    <div>

                      <p className="
                        text-xs
                        text-slate-600
                      ">
                        Duration
                      </p>

                      <p className="
                        text-sm
                        text-white
                        mt-1
                      ">
                        {duration} min
                      </p>

                    </div>


                    <div>

                      <p className="
                        text-xs
                        text-slate-600
                      ">
                        Energy
                      </p>

                      <p className="
                        text-sm
                        text-white
                        mt-1
                      ">
                        {energy.toFixed(2)} kWh
                      </p>

                    </div>


                    <div>

                      <p className="
                        text-xs
                        text-slate-600
                      ">
                        Rate
                      </p>

                      <p className="
                        text-sm
                        text-white
                        mt-1
                      ">
                        ₹{selected.pricePerKwh}/kWh
                      </p>

                    </div>

                  </div>

                </>

              );

            })()}

          </div>

        )}


        {/* ====================================
            CONTINUE TO PAYMENT
        ===================================== */}

        <button
          type="submit"
          disabled={
            loading ||
            availableChargers.length === 0
          }
          className="
            w-full
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

          {loading ? (

            <>

              <Loader2
                size={18}
                className="
                  animate-spin
                "
              />

              Checking availability...

            </>

          ) : (

            <>

              <Zap size={18} />

              Continue to payment

            </>

          )}

        </button>

      </form>

    </div>

  );

}


// ==========================================
// TIME HELPER
// ==========================================

function timeToMinutes(time) {

  if (!time) {
    return 0;
  }


  const [
    hours,
    minutes,
  ] = time
    .split(":")
    .map(Number);


  return (
    hours * 60 +
    minutes
  );

}


export default BookingForm;