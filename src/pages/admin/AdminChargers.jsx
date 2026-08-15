import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import {
  BatteryCharging,
  CheckCircle2,
  Loader2,
  MapPin,
  Settings2,
  Zap,
  AlertTriangle,
} from "lucide-react";

import { db } from "../../firebase/firebase";


function AdminChargers() {

  const [stations, setStations] = useState([]);

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(null);


  // ==========================================
  // FETCH STATIONS
  // ==========================================

  useEffect(() => {

    setLoading(true);

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


          setStations(
            stationList
          );

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


    return () => unsubscribe();

  }, []);


  // ==========================================
  // FETCH BOOKINGS
  // ==========================================

  useEffect(() => {

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


          setBookings(
            bookingList
          );

        },

        (error) => {

          console.error(
            "Fetching bookings error:",
            error
          );

          setBookings([]);

        }

      );


    return () => unsubscribe();

  }, []);


  // ==========================================
  // DATE PARSER
  // ==========================================

  const parseBookingDate = (
    value,
    fallbackDate
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


    if (
      value instanceof Date
    ) {

      return value;

    }


    const stringValue =
      String(value);


    const parsed =
      new Date(stringValue);


    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {

      return parsed;

    }


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
          Number(
            timeParts[0]
          ) || 0;


        const minutes =
          Number(
            timeParts[1]
          ) || 0;


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

  };


  // ==========================================
  // ACTIVE BOOKING
  // ==========================================

  const isBookingActive =
    (booking) => {

      const status =
        String(
          booking.status || ""
        )
          .toLowerCase()
          .trim();


      const paymentStatus =
        String(
          booking.paymentStatus || ""
        )
          .toLowerCase()
          .trim();


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
        inactiveStatuses.includes(
          status
        )
      ) {

        return false;

      }


      if (
        [
          "cancelled",
          "canceled",
          "refunded",
          "failed",
        ].includes(
          paymentStatus
        )
      ) {

        return false;

      }


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


      if (
        status === "confirmed" ||
        paymentStatus === "paid"
      ) {

        return true;

      }


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
  // CHECK CHARGER OCCUPIED
  // ==========================================

  const isChargerOccupied = (
    station,
    charger,
    chargerIndex
  ) => {

    const stationId =
      String(
        station.id
      );


    const chargerId =
      String(
        charger.id ||
          charger.chargerId ||
          chargerIndex + 1
      );


    return bookings.some(
      (booking) => {

        if (
          !isBookingActive(
            booking
          )
        ) {

          return false;

        }


        // -------------------------------
        // STATION MATCH
        // -------------------------------

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
          bookingStationId ===
            stationId ||
          (
            bookingStationName &&
            stationName &&
            bookingStationName ===
              stationName
          );


        if (!stationMatches) {

          return false;

        }


        // -------------------------------
        // CHARGER ID
        // -------------------------------

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
          bookingChargerId ===
            chargerId
        ) {

          return true;

        }


        // -------------------------------
        // CHARGER INDEX
        // -------------------------------

        if (
          booking.chargerIndex !==
            undefined &&
          booking.chargerIndex !==
            null
        ) {

          const bookedIndex =
            Number(
              booking.chargerIndex
            );


          if (
            bookedIndex ===
            chargerIndex
          ) {

            return true;

          }

        }


        // -------------------------------
        // CHARGER NUMBER
        // -------------------------------

        if (
          booking.chargerNumber !==
            undefined &&
          booking.chargerNumber !==
            null
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


        // -------------------------------
        // CHARGER NAME
        // -------------------------------

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
              `Charger ${
                chargerIndex + 1
              }`
          )
            .toLowerCase()
            .trim();


        if (
          bookingChargerName &&
          bookingChargerName ===
            chargerName
        ) {

          return true;

        }


        return false;

      }
    );

  };


  // ==========================================
  // GET ACTUAL STATUS
  // ==========================================

  const getStatus = (
    station,
    charger,
    index
  ) => {

    const occupied =
      isChargerOccupied(
        station,
        charger,
        index
      );


    if (occupied) {

      return "occupied";

    }


    if (
      String(
        charger.status || ""
      ).toLowerCase() ===
      "maintenance"
    ) {

      return "maintenance";

    }


    return "available";

  };


  // ==========================================
  // FLATTEN CHARGERS
  // ==========================================

  const allChargers =
    useMemo(() => {

      const result = [];


      stations.forEach(
        (station) => {

          const chargers =
            station.chargers || [];


          chargers.forEach(
            (
              charger,
              index
            ) => {

              result.push({

                station,

                charger,

                index,

                status:
                  getStatus(
                    station,
                    charger,
                    index
                  ),

              });

            }
          );

        }
      );


      return result;

    }, [
      stations,
      bookings,
    ]);


  // ==========================================
  // COUNTS
  // ==========================================

  const total =
    allChargers.length;


  const available =
    allChargers.filter(
      (item) =>
        item.status ===
        "available"
    ).length;


  const occupied =
    allChargers.filter(
      (item) =>
        item.status ===
        "occupied"
    ).length;


  const maintenance =
    allChargers.filter(
      (item) =>
        item.status ===
        "maintenance"
    ).length;


  // ==========================================
  // CHANGE MAINTENANCE STATUS
  // ==========================================

  const toggleMaintenance =
    async (
      station,
      chargerIndex
    ) => {

      const key =
        `${station.id}-${chargerIndex}`;


      setUpdating(key);

      setError("");


      try {

        const stationRef =
          doc(
            db,
            "stations",
            station.id
          );


        const updatedChargers =
          [
            ...(station.chargers || [])
          ];


        const current =
          updatedChargers[
            chargerIndex
          ];


        if (!current) {

          return;

        }


        // Never manually mark
        // an occupied charger
        // as available.

        if (
          isChargerOccupied(
            station,
            current,
            chargerIndex
          )
        ) {

          setError(
            "This charger is currently occupied and cannot be changed to maintenance."
          );

          return;

        }


        updatedChargers[
          chargerIndex
        ] = {

          ...current,

          status:
            current.status ===
            "maintenance"
              ? "available"
              : "maintenance",

        };


        await updateDoc(
          stationRef,
          {
            chargers:
              updatedChargers,
          }
        );

      } catch (error) {

        console.error(
          "Updating charger error:",
          error
        );

        setError(
          "Unable to update charger status."
        );

      } finally {

        setUpdating(null);

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
            Loading chargers...
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

      {/* =====================================
          HEADER
      ====================================== */}

      <div>

        <p
          className="
            text-sm
            text-emerald-400
            font-medium
            mb-2
          "
        >
          Administration
        </p>


        <h1
          className="
            text-3xl
            sm:text-4xl
            font-bold
            text-white
          "
        >
          Chargers
        </h1>


        <p
          className="
            text-slate-500
            mt-2
          "
        >
          Monitor and manage every charging point across the network.
        </p>

      </div>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (

        <div
          className="
            flex
            items-center
            gap-3
            p-4
            rounded-xl
            bg-red-500/10
            border
            border-red-500/20
            text-red-400
            text-sm
          "
        >

          <AlertTriangle
            size={18}
          />

          {error}

        </div>

      )}


      {/* =====================================
          SUMMARY
      ====================================== */}

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-4
        "
      >

        <SummaryCard
          label="Total Chargers"
          value={total}
          icon={Zap}
        />


        <SummaryCard
          label="Available"
          value={available}
          icon={CheckCircle2}
          valueClass="text-emerald-400"
        />


        <SummaryCard
          label="Occupied"
          value={occupied}
          icon={BatteryCharging}
          valueClass="text-red-400"
        />


        <SummaryCard
          label="Maintenance"
          value={maintenance}
          icon={Settings2}
          valueClass="text-amber-400"
        />

      </div>


      {/* =====================================
          NO CHARGERS
      ====================================== */}

      {allChargers.length ===
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

            <Zap
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
            No chargers found
          </h2>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Add charging points from Charging Stations.
          </p>

        </div>

      )}


      {/* =====================================
          STATIONS
      ====================================== */}

      {stations.map(
        (station) => {

          const chargers =
            station.chargers ||
            [];


          if (
            chargers.length ===
            0
          ) {

            return null;

          }


          return (

            <section
              key={station.id}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                overflow-hidden
              "
            >

              {/* Station header */}

              <div
                className="
                  p-5
                  sm:p-6
                  border-b
                  border-slate-800
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-4
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

                    <MapPin
                      size={21}
                      className="
                        text-emerald-400
                      "
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


                    <p
                      className="
                        text-xs
                        text-slate-600
                        mt-1
                      "
                    >
                      {station.address}
                      {station.city
                        ? `, ${station.city}`
                        : ""}
                    </p>

                  </div>

                </div>


                <div
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  {chargers.length}{" "}
                  {chargers.length === 1
                    ? "charger"
                    : "chargers"}
                </div>

              </div>


              {/* Charger list */}

              <div
                className="
                  p-4
                  sm:p-6
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  xl:grid-cols-3
                  gap-4
                "
              >

                {chargers.map(
                  (
                    charger,
                    index
                  ) => {

                    const status =
                      getStatus(
                        station,
                        charger,
                        index
                      );


                    const updateKey =
                      `${station.id}-${index}`;


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
                          p-5
                        "
                      >

                        {/* Top */}

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
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
                                rounded-lg
                                bg-emerald-400/10
                                flex
                                items-center
                                justify-center
                              "
                            >

                              <Zap
                                size={18}
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
                                Charger{" "}
                                {index + 1}
                              </p>


                              <p
                                className="
                                  text-xs
                                  text-slate-600
                                  mt-1
                                "
                              >
                                Charging Point
                              </p>

                            </div>

                          </div>


                          <StatusBadge
                            status={
                              status
                            }
                          />

                        </div>


                        {/* Details */}

                        <div
                          className="
                            mt-5
                            space-y-3
                          "
                        >

                          <DetailRow
                            label="Connector"
                            value={
                              charger.connectorType ||
                              "—"
                            }
                          />


                          <DetailRow
                            label="Power"
                            value={
                              charger.power
                                ? `${charger.power} kW`
                                : "—"
                            }
                          />


                          <DetailRow
                            label="Rate"
                            value={
                              charger.pricePerKwh
                                ? `₹${charger.pricePerKwh}/kWh`
                                : "—"
                            }
                          />

                        </div>


                        {/* Action */}

                        <div
                          className="
                            mt-5
                            pt-4
                            border-t
                            border-slate-800
                          "
                        >

                          {status ===
                            "occupied" ? (

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-red-400
                              "
                            >

                              <BatteryCharging
                                size={15}
                              />

                              Currently reserved or charging

                            </div>

                          ) : (

                            <button
                              type="button"
                              disabled={
                                updating ===
                                updateKey
                              }
                              onClick={() =>
                                toggleMaintenance(
                                  station,
                                  index
                                )
                              }
                              className={`
                                w-full
                                flex
                                items-center
                                justify-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-lg
                                text-sm
                                font-medium
                                transition
                                disabled:opacity-50
                                ${
                                  status ===
                                  "maintenance"
                                    ? "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                                    : "bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                                }
                              `}
                            >

                              {updating ===
                              updateKey ? (

                                <Loader2
                                  size={16}
                                  className="
                                    animate-spin
                                  "
                                />

                              ) : (

                                <Settings2
                                  size={16}
                                />

                              )}


                              {status ===
                              "maintenance"
                                ? "Mark Available"
                                : "Put in Maintenance"}

                            </button>

                          )}

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            </section>

          );

        }
      )}

    </div>

  );

}


// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({
  label,
  value,
  icon: Icon,
  valueClass = "text-white",
}) {

  return (

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
          {label}
        </p>


        <Icon
          size={18}
          className="
            text-slate-600
          "
        />

      </div>


      <p
        className={`
          text-2xl
          font-bold
          mt-3
          ${valueClass}
        `}
      >
        {value}
      </p>

    </div>

  );

}


// ==========================================
// DETAIL ROW
// ==========================================

function DetailRow({
  label,
  value,
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >

      <span
        className="
          text-xs
          text-slate-600
        "
      >
        {label}
      </span>


      <span
        className="
          text-sm
          text-slate-300
          font-medium
          text-right
        "
      >
        {value}
      </span>

    </div>

  );

}


// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({
  status,
}) {

  const config = {

    available: {
      label: "Available",
      className:
        "bg-emerald-400/10 text-emerald-400",
    },

    occupied: {
      label: "Occupied",
      className:
        "bg-red-400/10 text-red-400",
    },

    maintenance: {
      label: "Maintenance",
      className:
        "bg-amber-400/10 text-amber-400",
    },

  };


  const current =
    config[status] ||
    config.available;


  return (

    <span
      className={`
        px-2.5
        py-1.5
        rounded-full
        text-[11px]
        font-semibold
        ${current.className}
      `}
    >

      {current.label}

    </span>

  );

}


export default AdminChargers;