import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import {
  CalendarDays,
  Search,
  Loader2,
  RefreshCw,
  UserRound,
  Car,
  MapPin,
  Zap,
  IndianRupee,
  XCircle,
  CheckCircle2,
  Clock3,
  RotateCcw,
} from "lucide-react";

import { db } from "../../firebase/firebase";


function AdminBookings() {

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [updating, setUpdating] =
    useState(null);

  const [error, setError] = useState("");


  // ==========================================
  // LOAD REAL BOOKINGS
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

          setLoading(false);

          setError("");

        },

        (error) => {

          console.error(
            "Admin bookings loading error:",
            error
          );

          setError(
            "Unable to load bookings."
          );

          setLoading(false);

        }

      );


    return () =>
      unsubscribe();

  }, []);


  // ==========================================
  // DATE HELPERS
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


  const formatDate = (
    value
  ) => {

    const date =
      getDate(value);


    if (!date) {
      return "—";
    }


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  const formatTime = (
    value
  ) => {

    const date =
      getDate(value);


    if (!date) {
      return "—";
    }


    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  const formatCurrency = (
    value
  ) => {

    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  };


  // ==========================================
  // NORMALIZE STATUS
  // ==========================================

  const getBookingStatus = (
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
  // FILTER
  // ==========================================

  const filteredBookings =
    useMemo(() => {

      const searchValue =
        search
          .toLowerCase()
          .trim();


      return bookings
        .filter(
          (booking) => {

            const status =
              getBookingStatus(
                booking
              );


            const matchesStatus =
              statusFilter ===
                "all" ||
              status ===
                statusFilter;


            const searchableText =
              [

                booking.id,

                booking.userName,

                booking.name,

                booking.userEmail,

                booking.email,

                booking.stationName,

                booking.station,

                booking.chargerName,

                booking.chargerId,

                booking.vehicleName,

                booking.vehicleNumber,

                booking.registrationNumber,

                booking.vehicleNumberPlate,

              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
              !searchValue ||
              searchableText.includes(
                searchValue
              );


            return (
              matchesStatus &&
              matchesSearch
            );

          }
        )
        .sort(
          (a, b) => {

            const dateA =
              getDate(
                a.createdAt ||
                a.date ||
                a.bookingDate
              );


            const dateB =
              getDate(
                b.createdAt ||
                b.date ||
                b.bookingDate
              );


            return (
              (dateB?.getTime() || 0) -
              (dateA?.getTime() || 0)
            );

          }
        );

    }, [
      bookings,
      search,
      statusFilter,
    ]);


  // ==========================================
  // COUNTS
  // ==========================================

  const totalBookings =
    bookings.length;


  const confirmedBookings =
    bookings.filter(
      (booking) =>
        getBookingStatus(
          booking
        ) === "confirmed"
    ).length;


  const activeBookings =
    bookings.filter(
      (booking) =>
        getBookingStatus(
          booking
        ) === "active"
    ).length;


  const completedBookings =
    bookings.filter(
      (booking) =>
        getBookingStatus(
          booking
        ) === "completed"
    ).length;


  const cancelledBookings =
    bookings.filter(
      (booking) =>
        getBookingStatus(
          booking
        ) === "cancelled"
    ).length;


  const totalRefunded =
    bookings.reduce(
      (total, booking) =>
        total +
        (Number(
          booking.refundAmount
        ) || 0),
      0
    );


  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  const cancelBooking =
    async (booking) => {

      const status =
        getBookingStatus(
          booking
        );


      if (
        status === "cancelled" ||
        status === "completed"
      ) {

        return;

      }


      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this booking?"
        );


      if (!confirmed) {
        return;
      }


      setUpdating(
        booking.id
      );

      setError("");


      try {

        await updateDoc(

          doc(
            db,
            "bookings",
            booking.id
          ),

          {
            status:
              "cancelled",

            cancelledBy:
              "admin",

            cancelledAt:
              new Date(),
          }

        );

      } catch (error) {

        console.error(
          "Cancel booking error:",
          error
        );

        setError(
          "Unable to cancel booking."
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

        <div
          className="
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
            Loading bookings...
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

          <p
            className="
              text-sm
              text-emerald-400
              font-medium
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
              mt-2
            "
          >
            Bookings
          </h1>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Monitor real charging reservations and their current status.
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

          <RefreshCw
            size={14}
          />

          Live data

        </div>

      </div>


      {/* ======================================
          ERROR
      ======================================= */}

      {error && (

        <div
          className="
            bg-red-500/10
            border
            border-red-500/20
            rounded-xl
            px-4
            py-3
            text-sm
            text-red-400
          "
        >
          {error}
        </div>

      )}


      {/* ======================================
          SUMMARY
      ======================================= */}

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-5
          gap-4
        "
      >

        <SummaryCard
          title="Total"
          value={
            totalBookings
          }
          icon={CalendarDays}
        />


        <SummaryCard
          title="Confirmed"
          value={
            confirmedBookings
          }
          icon={CheckCircle2}
          valueClass="text-emerald-400"
        />


        <SummaryCard
          title="Active"
          value={
            activeBookings
          }
          icon={Zap}
          valueClass="text-blue-400"
        />


        <SummaryCard
          title="Completed"
          value={
            completedBookings
          }
          icon={CheckCircle2}
          valueClass="text-slate-300"
        />


        <SummaryCard
          title="Cancelled"
          value={
            cancelledBookings
          }
          icon={XCircle}
          valueClass="text-red-400"
        />

      </div>


      {/* ======================================
          REFUNDS
      ======================================= */}

      {totalRefunded > 0 && (

        <div
          className="
            flex
            items-center
            gap-3
            bg-emerald-400/5
            border
            border-emerald-400/10
            rounded-xl
            px-4
            py-3
          "
        >

          <RotateCcw
            size={17}
            className="
              text-emerald-400
            "
          />


          <p
            className="
              text-sm
              text-slate-400
            "
          >

            Total refunds recorded:

            <span
              className="
                text-emerald-400
                font-semibold
                ml-2
              "
            >
              {formatCurrency(
                totalRefunded
              )}
            </span>

          </p>

        </div>

      )}


      {/* ======================================
          FILTERS
      ======================================= */}

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-4
          flex
          flex-col
          lg:flex-row
          gap-3
        "
      >

        {/* SEARCH */}

        <div
          className="
            relative
            flex-1
          "
        >

          <Search
            size={18}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-600
            "
          />


          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by user, station, charger, vehicle or booking ID..."
            className="
              w-full
              bg-slate-950
              border
              border-slate-800
              rounded-xl
              pl-10
              pr-4
              py-3
              text-sm
              text-white
              placeholder:text-slate-700
              outline-none
              focus:border-emerald-400/50
            "
          />

        </div>


        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="
            bg-slate-950
            border
            border-slate-800
            rounded-xl
            px-4
            py-3
            text-sm
            text-slate-300
            outline-none
          "
        >

          <option value="all">
            All Statuses
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="active">
            Active
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="cancelled">
            Cancelled
          </option>

        </select>

      </div>


      {/* ======================================
          BOOKINGS
      ======================================= */}

      <section
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
            px-5
            sm:px-6
            py-5
            border-b
            border-slate-800
          "
        >

          <h2
            className="
              text-lg
              font-semibold
              text-white
            "
          >
            Charging Reservations
          </h2>


          <p
            className="
              text-xs
              text-slate-600
              mt-1
            "
          >
            Showing{" "}
            {filteredBookings.length}{" "}
            of{" "}
            {totalBookings}{" "}
            bookings
          </p>

        </div>


        {filteredBookings.length ===
        0 ? (

          <div
            className="
              p-12
              text-center
            "
          >

            <CalendarDays
              size={36}
              className="
                mx-auto
                text-slate-700
              "
            />


            <p
              className="
                text-slate-500
                mt-4
              "
            >
              No bookings found.
            </p>

          </div>

        ) : (

          <div
            className="
              divide-y
              divide-slate-800
            "
          >

            {filteredBookings.map(
              (booking) => {

                const status =
                  getBookingStatus(
                    booking
                  );


                const start =
                  booking.startDateTime ||
                  booking.startAt ||
                  booking.startTime;


                const end =
                  booking.endDateTime ||
                  booking.endAt ||
                  booking.endTime;


                const vehicleName =
                  booking.vehicleName ||
                  booking.vehicle?.name ||
                  booking.vehicleModel ||
                  "Vehicle not recorded";


                const vehicleNumber =
                  booking.vehicleNumber ||
                  booking.registrationNumber ||
                  booking.vehicleNumberPlate ||
                  booking.vehicle?.number ||
                  "";


                const userName =
                  booking.userName ||
                  booking.name ||
                  booking.user?.name ||
                  "User";


                const userEmail =
                  booking.userEmail ||
                  booking.email ||
                  booking.user?.email ||
                  "";


                const stationName =
                  booking.stationName ||
                  booking.station?.name ||
                  "Station not recorded";


                const chargerName =
                  booking.chargerName ||
                  booking.charger?.name ||
                  (
                    booking.chargerNumber
                      ? `Charger ${booking.chargerNumber}`
                      : "Charger not recorded"
                  );


                return (

                  <div
                    key={
                      booking.id
                    }
                    className="
                      p-5
                      sm:p-6
                      hover:bg-slate-950/40
                      transition
                    "
                  >

                    {/* TOP */}

                    <div
                      className="
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                        gap-4
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
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
                            shrink-0
                          "
                        >

                          <Zap
                            size={20}
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

                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >

                            <h3
                              className="
                                text-sm
                                font-semibold
                                text-white
                              "
                            >
                              {stationName}
                            </h3>


                            <StatusBadge
                              status={
                                status
                              }
                            />

                          </div>


                          <p
                            className="
                              text-xs
                              text-slate-600
                              mt-1
                              break-all
                            "
                          >
                            Booking ID:{" "}
                            {booking.id}
                          </p>

                        </div>

                      </div>


                      {/* AMOUNT */}

                      <div
                        className="
                          lg:text-right
                        "
                      >

                        <p
                          className="
                            text-lg
                            font-bold
                            text-white
                          "
                        >
                          {formatCurrency(
                            booking.amount
                          )}
                        </p>


                        <p
                          className="
                            text-xs
                            text-slate-600
                            mt-1
                          "
                        >
                          {booking.paymentStatus ||
                            "Payment status unavailable"}
                        </p>

                      </div>

                    </div>


                    {/* DETAILS */}

                    <div
                      className="
                        mt-5
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        xl:grid-cols-4
                        gap-3
                      "
                    >

                      <InfoBox
                        icon={UserRound}
                        label="User"
                        value={
                          userName
                        }
                        secondary={
                          userEmail
                        }
                      />


                      <InfoBox
                        icon={Car}
                        label="Vehicle"
                        value={
                          vehicleName
                        }
                        secondary={
                          vehicleNumber
                        }
                      />


                      <InfoBox
                        icon={Zap}
                        label="Charger"
                        value={
                          chargerName
                        }
                        secondary={
                          booking.connectorType ||
                          booking.charger?.connectorType ||
                          ""
                        }
                      />


                      <InfoBox
                        icon={MapPin}
                        label="Station"
                        value={
                          stationName
                        }
                        secondary={
                          booking.city ||
                          booking.station?.city ||
                          ""
                        }
                      />

                    </div>


                    {/* DATE/TIME */}

                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        gap-4
                        text-xs
                        text-slate-500
                      "
                    >

                      <span
                        className="
                          flex
                          items-center
                          gap-1.5
                        "
                      >

                        <CalendarDays
                          size={14}
                        />

                        {formatDate(
                          booking.date ||
                          booking.bookingDate ||
                          booking.startDateTime
                        )}

                      </span>


                      <span
                        className="
                          flex
                          items-center
                          gap-1.5
                        "
                      >

                        <Clock3
                          size={14}
                        />

                        {formatTime(
                          start
                        )}

                        {" → "}

                        {formatTime(
                          end
                        )}

                      </span>


                      {booking.energy && (

                        <span
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >

                          <IndianRupee
                            size={13}
                          />

                          {booking.energy}{" "}
                          kWh

                        </span>

                      )}


                      {Number(
                        booking.refundAmount
                      ) > 0 && (

                        <span
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-emerald-400
                          "
                        >

                          <RotateCcw
                            size={13}
                          />

                          Refund:{" "}
                          {formatCurrency(
                            booking.refundAmount
                          )}

                        </span>

                      )}

                    </div>


                    {/* ACTION */}

                    {status !==
                      "cancelled" &&
                      status !==
                        "completed" && (

                      <div
                        className="
                          mt-5
                          pt-4
                          border-t
                          border-slate-800
                          flex
                          justify-end
                        "
                      >

                        <button
                          type="button"
                          disabled={
                            updating ===
                            booking.id
                          }
                          onClick={() =>
                            cancelBooking(
                              booking
                            )
                          }
                          className="
                            flex
                            items-center
                            gap-2
                            px-4
                            py-2.5
                            rounded-lg
                            bg-red-500/10
                            text-red-400
                            hover:bg-red-500/20
                            text-sm
                            font-medium
                            transition
                            disabled:opacity-50
                          "
                        >

                          {updating ===
                          booking.id ? (

                            <Loader2
                              size={16}
                              className="
                                animate-spin
                              "
                            />

                          ) : (

                            <XCircle
                              size={16}
                            />

                          )}

                          Cancel Booking

                        </button>

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>

    </div>

  );

}


// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({
  title,
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
          {title}
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
// INFO BOX
// ==========================================

function InfoBox({
  icon: Icon,
  label,
  value,
  secondary,
}) {

  return (

    <div
      className="
        bg-slate-950
        border
        border-slate-800
        rounded-xl
        p-4
        min-w-0
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          text-slate-600
          mb-2
        "
      >

        <Icon
          size={14}
        />

        <span
          className="
            text-[11px]
            uppercase
            tracking-wide
          "
        >
          {label}
        </span>

      </div>


      <p
        className="
          text-sm
          text-slate-300
          font-medium
          truncate
        "
      >
        {value}
      </p>


      {secondary && (

        <p
          className="
            text-xs
            text-slate-600
            mt-1
            truncate
          "
        >
          {secondary}
        </p>

      )}

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

    confirmed: {
      label: "Confirmed",
      className:
        "bg-emerald-400/10 text-emerald-400",
    },

    active: {
      label: "Active",
      className:
        "bg-blue-400/10 text-blue-400",
    },

    completed: {
      label: "Completed",
      className:
        "bg-slate-700 text-slate-300",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "bg-red-400/10 text-red-400",
    },

    pending: {
      label: "Pending",
      className:
        "bg-amber-400/10 text-amber-400",
    },

  };


  const current =
    config[status] ||
    config.pending;


  return (

    <span
      className={`
        px-2.5
        py-1
        rounded-full
        text-[10px]
        font-semibold
        ${current.className}
      `}
    >

      {current.label}

    </span>

  );

}


export default AdminBookings;