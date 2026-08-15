import { useEffect, useMemo, useState } from "react";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  MapPin,
  Users,
  CalendarCheck,
  Zap,
  TrendingUp,
  Activity,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  IndianRupee,
} from "lucide-react";

import { db } from "../../firebase/firebase";


function AdminDashboard() {

  const [stations, setStations] = useState([]);

  const [users, setUsers] = useState([]);

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  const [editingStation, setEditingStation] = useState(null);

  const [editLoading, setEditLoading] = useState(false);


  // ==========================================
  // FETCH ADMIN DATA
  // ==========================================

  const fetchAdminData = async () => {

    try {

      setLoading(true);


      const [
        stationsSnapshot,
        usersSnapshot,
        bookingsSnapshot,
      ] = await Promise.all([

        getDocs(
          collection(
            db,
            "stations"
          )
        ),

        getDocs(
          collection(
            db,
            "users"
          )
        ),

        getDocs(
          collection(
            db,
            "bookings"
          )
        ),

      ]);


      const stationList =
        stationsSnapshot.docs.map(
          (stationDoc) => ({
            id: stationDoc.id,
            ...stationDoc.data(),
          })
        );


      const userList =
        usersSnapshot.docs.map(
          (userDoc) => ({
            id: userDoc.id,
            ...userDoc.data(),
          })
        );


      const bookingList =
        bookingsSnapshot.docs.map(
          (bookingDoc) => ({
            id: bookingDoc.id,
            ...bookingDoc.data(),
          })
        );


      setStations(stationList);

      setUsers(userList);

      setBookings(bookingList);


    } catch (error) {

      console.error(
        "Fetching admin data error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchAdminData();

  }, []);

  const stationStats = useMemo(() => {

    let totalChargers = 0;

    let availableChargers = 0;

    let occupiedChargers = 0;

    let maintenanceChargers = 0;


    stations.forEach(
      (station) => {

        const chargers =
          Array.isArray(
            station.chargers
          )
            ? station.chargers
            : [];


        totalChargers +=
          chargers.length;


        chargers.forEach(
          (charger) => {

            if (
              charger.status ===
              "available"
            ) {

              availableChargers++;

            } else if (
              charger.status ===
              "occupied"
            ) {

              occupiedChargers++;

            } else if (
              charger.status ===
              "maintenance"
            ) {

              maintenanceChargers++;

            }

          }
        );

      }
    );


    return {
      totalChargers,
      availableChargers,
      occupiedChargers,
      maintenanceChargers,
    };

  }, [stations]);


  const bookingStats = useMemo(() => {

    let active = 0;

    let completed = 0;

    let cancelled = 0;

    let totalRevenue = 0;


    bookings.forEach(
      (booking) => {

        const status =
          String(
            booking.status || ""
          ).toLowerCase();


        if (
          [
            "charging",
            "active",
            "confirmed",
            "booked",
            "upcoming",
          ].includes(status)
        ) {

          active++;

        }


        if (
          [
            "completed",
            "complete",
          ].includes(status)
        ) {

          completed++;

        }


        if (
          [
            "cancelled",
            "canceled",
          ].includes(status)
        ) {

          cancelled++;

        }

        if (
          ![
            "cancelled",
            "canceled",
            "failed",
          ].includes(status)
        ) {

          totalRevenue +=
            Number(
              booking.amount
            ) || 0;

        }

      }
    );


    return {
      active,
      completed,
      cancelled,
      totalRevenue,
    };

  }, [bookings]);

  const recentBookings =
    useMemo(() => {

      return [...bookings]
        .sort(
          (a, b) =>
            getDateValue(
              b.createdAt ||
              b.updatedAt ||
              b.completedAt ||
              b.cancelledAt
            ) -
            getDateValue(
              a.createdAt ||
              a.updatedAt ||
              a.completedAt ||
              a.cancelledAt
            )
        )
        .slice(0, 6);

    }, [bookings]);


  const handleDelete =
    async (stationId) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this charging station?"
        );


      if (!confirmed) {
        return;
      }


      try {

        setDeletingId(
          stationId
        );


        await deleteDoc(
          doc(
            db,
            "stations",
            stationId
          )
        );


        setStations(
          (previous) =>
            previous.filter(
              (station) =>
                station.id !==
                stationId
            )
        );


      } catch (error) {

        console.error(
          "Delete station error:",
          error
        );


        alert(
          "Unable to delete this station."
        );

      } finally {

        setDeletingId(null);

      }

    };


  const handleUpdate =
    async (e) => {

      e.preventDefault();


      if (!editingStation) {
        return;
      }


      try {

        setEditLoading(true);


        const stationRef =
          doc(
            db,
            "stations",
            editingStation.id
          );


        await updateDoc(
          stationRef,
          {
            name:
              editingStation.name,

            operator:
              editingStation.operator,

            address:
              editingStation.address,

            city:
              editingStation.city,

            rating:
              Number(
                editingStation.rating
              ) || 0,
          }
        );


        setStations(
          (previous) =>
            previous.map(
              (station) =>
                station.id ===
                editingStation.id
                  ? {
                      ...station,

                      name:
                        editingStation.name,

                      operator:
                        editingStation.operator,

                      address:
                        editingStation.address,

                      city:
                        editingStation.city,

                      rating:
                        Number(
                          editingStation.rating
                        ) || 0,
                    }
                  : station
            )
        );


        setEditingStation(
          null
        );


      } catch (error) {

        console.error(
          "Update station error:",
          error
        );


        alert(
          "Unable to update this station."
        );

      } finally {

        setEditLoading(false);

      }

    };

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


  function getBookingStatus(
    booking
  ) {

    const status =
      String(
        booking.status ||
        "unknown"
      ).toLowerCase();


    if (
      [
        "charging",
        "active",
      ].includes(status)
    ) {

      return {
        label: "Charging",
        className:
          "bg-emerald-400/10 text-emerald-400",
        icon: Activity,
      };

    }


    if (
      [
        "completed",
        "complete",
      ].includes(status)
    ) {

      return {
        label: "Completed",
        className:
          "bg-blue-400/10 text-blue-400",
        icon: CheckCircle2,
      };

    }


    if (
      [
        "cancelled",
        "canceled",
      ].includes(status)
    ) {

      return {
        label: "Cancelled",
        className:
          "bg-red-400/10 text-red-400",
        icon: XCircle,
      };

    }


    return {
      label:
        booking.status ||
        "Booked",
      className:
        "bg-amber-400/10 text-amber-400",
      icon: Clock3,
    };

  }

  return (

    <div
      className="
        max-w-7xl
        mx-auto
        space-y-8
      "
    >

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-end
          sm:justify-between
          gap-4
        "
      >

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
            Admin Dashboard
          </h1>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Monitor and manage your EV charging network.
          </p>

        </div>


        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="
            w-fit
            flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            border
            border-slate-700
            text-slate-300
            hover:text-white
            hover:border-emerald-400
            transition
            disabled:opacity-50
          "
        >

          <Activity size={16} />

          Refresh

        </button>

      </div>

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >

        {/* STATIONS */}

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


          <p
            className="
              text-sm
              text-slate-500
              mt-5
            "
          >
            Charging Stations
          </p>


          <h2
            className="
              text-3xl
              font-bold
              text-white
              mt-1
            "
          >
            {stations.length}
          </h2>

        </div>


        {/* USERS */}

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
              w-11
              h-11
              rounded-xl
              bg-blue-400/10
              flex
              items-center
              justify-center
            "
          >

            <Users
              size={21}
              className="
                text-blue-400
              "
            />

          </div>


          <p
            className="
              text-sm
              text-slate-500
              mt-5
            "
          >
            Registered Users
          </p>


          <h2
            className="
              text-3xl
              font-bold
              text-white
              mt-1
            "
          >
            {users.length}
          </h2>

        </div>


        {/* BOOKINGS */}

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
              w-11
              h-11
              rounded-xl
              bg-purple-400/10
              flex
              items-center
              justify-center
            "
          >

            <CalendarCheck
              size={21}
              className="
                text-purple-400
              "
            />

          </div>


          <p
            className="
              text-sm
              text-slate-500
              mt-5
            "
          >
            Total Bookings
          </p>


          <h2
            className="
              text-3xl
              font-bold
              text-white
              mt-1
            "
          >
            {bookings.length}
          </h2>

        </div>


        {/* AVAILABLE CHARGERS */}

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
              w-11
              h-11
              rounded-xl
              bg-orange-400/10
              flex
              items-center
              justify-center
            "
          >

            <Zap
              size={21}
              className="
                text-orange-400
              "
            />

          </div>


          <p
            className="
              text-sm
              text-slate-500
              mt-5
            "
          >
            Available Chargers
          </p>


          <h2
            className="
              text-3xl
              font-bold
              text-white
              mt-1
            "
          >
            {stationStats.availableChargers}
          </h2>

        </div>

      </div>

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
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
              gap-3
            "
          >

            <Activity
              size={19}
              className="
                text-emerald-400
              "
            />


            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Active Sessions
            </p>

          </div>


          <p
            className="
              text-2xl
              font-bold
              text-white
              mt-3
            "
          >
            {bookingStats.active}
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
              gap-3
            "
          >

            <CheckCircle2
              size={19}
              className="
                text-blue-400
              "
            />


            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Completed
            </p>

          </div>


          <p
            className="
              text-2xl
              font-bold
              text-white
              mt-3
            "
          >
            {bookingStats.completed}
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
              gap-3
            "
          >

            <TrendingUp
              size={19}
              className="
                text-emerald-400
              "
            />


            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Recorded Revenue
            </p>

          </div>


          <p
            className="
              text-2xl
              font-bold
              text-white
              mt-3
            "
          >
            ₹{bookingStats.totalRevenue.toFixed(2)}
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
              gap-3
            "
          >

            <Zap
              size={19}
              className="
                text-amber-400
              "
            />


            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Total Chargers
            </p>

          </div>


          <p
            className="
              text-2xl
              font-bold
              text-white
              mt-3
            "
          >
            {stationStats.totalChargers}
          </p>

        </div>

      </div>

      <div>

        <div
          className="
            flex
            items-center
            justify-between
            mb-5
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-semibold
                text-white
              "
            >
              Recent Bookings
            </h2>


            <p
              className="
                text-sm
                text-slate-500
                mt-1
              "
            >
              Latest charging activity across your network.
            </p>

          </div>


          <span
            className="
              text-sm
              text-slate-500
            "
          >
            {bookings.length} total
          </span>

        </div>


        {loading ? (

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

            <Loader2
              size={28}
              className="
                mx-auto
                text-emerald-400
                animate-spin
              "
            />

          </div>

        ) : recentBookings.length === 0 ? (

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

            <CalendarCheck
              size={30}
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
              No bookings yet
            </h3>


            <p
              className="
                text-sm
                text-slate-500
                mt-2
              "
            >
              New customer bookings will appear here.
            </p>

          </div>

        ) : (

          <div
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
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                  min-w-[760px]
                "
              >

                <thead>

                  <tr
                    className="
                      border-b
                      border-slate-800
                      text-left
                    "
                  >

                    <th
                      className="
                        px-5
                        py-4
                        text-xs
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Customer
                    </th>


                    <th
                      className="
                        px-5
                        py-4
                        text-xs
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Station
                    </th>


                    <th
                      className="
                        px-5
                        py-4
                        text-xs
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Charger
                    </th>


                    <th
                      className="
                        px-5
                        py-4
                        text-xs
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Amount
                    </th>


                    <th
                      className="
                        px-5
                        py-4
                        text-xs
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Status
                    </th>


                    <th
                      className="
                        px-5
                        py-4
                        text-xs
                        uppercase
                        tracking-wider
                        text-slate-600
                      "
                    >
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentBookings.map(
                    (booking) => {

                      const status =
                        getBookingStatus(
                          booking
                        );


                      const StatusIcon =
                        status.icon;


                      const chargerNumber =
                        booking.chargerIndex !==
                          undefined &&
                        booking.chargerIndex !==
                          null
                          ? Number(
                              booking.chargerIndex
                            ) + 1
                          : "—";


                      return (

                        <tr
                          key={
                            booking.id
                          }
                          className="
                            border-b
                            border-slate-800/70
                            last:border-0
                            hover:bg-slate-800/30
                          "
                        >

                          <td
                            className="
                              px-5
                              py-4
                            "
                          >

                            <p
                              className="
                                text-sm
                                text-white
                                font-medium
                              "
                            >
                              {booking.userName ||
                                booking.name ||
                                "Customer"}
                            </p>


                            <p
                              className="
                                text-xs
                                text-slate-600
                                mt-1
                              "
                            >
                              {booking.userEmail ||
                                booking.email ||
                                ""}
                            </p>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                            "
                          >

                            <p
                              className="
                                text-sm
                                text-slate-300
                              "
                            >
                              {booking.stationName ||
                                "Charging Station"}
                            </p>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                            "
                          >

                            <span
                              className="
                                text-sm
                                text-slate-300
                              "
                            >
                              #{chargerNumber}
                            </span>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-1
                                text-sm
                                text-white
                                font-medium
                              "
                            >

                              <IndianRupee
                                size={13}
                              />

                              {(
                                Number(
                                  booking.amount
                                ) || 0
                              ).toFixed(2)}

                            </div>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                            "
                          >

                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1.5
                                px-3
                                py-1.5
                                rounded-full
                                text-xs
                                font-medium
                                ${status.className}
                              `}
                            >

                              <StatusIcon
                                size={13}
                              />

                              {status.label}

                            </span>

                          </td>


                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              text-slate-500
                            "
                          >
                            {formatDate(
                              booking.createdAt ||
                              booking.updatedAt
                            )}
                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      <div>

        <div
          className="
            flex
            items-center
            justify-between
            mb-5
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-semibold
                text-white
              "
            >
              Charging Stations
            </h2>


            <p
              className="
                text-sm
                text-slate-500
                mt-1
              "
            >
              Manage stations and monitor charger availability.
            </p>

          </div>


          <span
            className="
              text-sm
              text-slate-500
            "
          >
            {stations.length} station
            {stations.length !== 1
              ? "s"
              : ""}
          </span>

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
              size={28}
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
              Loading stations...
            </p>

          </div>

        ) : stations.length === 0 ? (

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

            <MapPin
              size={30}
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
              No charging stations
            </h3>


            <p
              className="
                text-slate-500
                mt-2
              "
            >
              Add your first charging station from the station manager.
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

            {stations.map(
              (station) => {

                const chargers =
                  Array.isArray(
                    station.chargers
                  )
                    ? station.chargers
                    : [];


                const available =
                  chargers.filter(
                    (charger) =>
                      charger.status ===
                      "available"
                  ).length;


                const occupied =
                  chargers.filter(
                    (charger) =>
                      charger.status ===
                      "occupied"
                  ).length;


                const maintenance =
                  chargers.filter(
                    (charger) =>
                      charger.status ===
                      "maintenance"
                  ).length;


                const total =
                  chargers.length;


                return (

                  <div
                    key={station.id}
                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-2xl
                      p-5
                      sm:p-6
                    "
                  >

                    {/* HEADER */}

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
                          gap-4
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

                          <MapPin
                            size={22}
                            className="
                              text-emerald-400
                            "
                          />

                        </div>


                        <div>

                          <h3
                            className="
                              text-lg
                              font-semibold
                              text-white
                            "
                          >
                            {station.name}
                          </h3>


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


                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-medium
                          ${
                            available > 0
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400"
                          }
                        `}
                      >
                        {available > 0
                          ? "Available"
                          : "Full"}
                      </span>

                    </div>


                    {/* LOCATION */}

                    <p
                      className="
                        text-sm
                        text-slate-400
                        mt-5
                      "
                    >

                      {station.address}

                      {station.city &&
                        `, ${station.city}`}

                    </p>


                    {/* COUNTS */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        sm:grid-cols-4
                        gap-3
                        mt-5
                      "
                    >

                      <div
                        className="
                          bg-slate-950
                          rounded-xl
                          p-3
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-600
                          "
                        >
                          Total
                        </p>


                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-1
                          "
                        >
                          {total}
                        </p>

                      </div>


                      <div
                        className="
                          bg-slate-950
                          rounded-xl
                          p-3
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-600
                          "
                        >
                          Available
                        </p>


                        <p
                          className="
                            text-sm
                            text-emerald-400
                            font-medium
                            mt-1
                          "
                        >
                          {available}
                        </p>

                      </div>


                      <div
                        className="
                          bg-slate-950
                          rounded-xl
                          p-3
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-600
                          "
                        >
                          Occupied
                        </p>


                        <p
                          className="
                            text-sm
                            text-red-400
                            font-medium
                            mt-1
                          "
                        >
                          {occupied}
                        </p>

                      </div>


                      <div
                        className="
                          bg-slate-950
                          rounded-xl
                          p-3
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-600
                          "
                        >
                          Maintenance
                        </p>


                        <p
                          className="
                            text-sm
                            text-amber-400
                            font-medium
                            mt-1
                          "
                        >
                          {maintenance}
                        </p>

                      </div>

                    </div>


                    {/* CHARGERS */}

                    {chargers.length > 0 && (

                      <div className="mt-5">

                        <p
                          className="
                            text-xs
                            text-slate-500
                            uppercase
                            tracking-wider
                            mb-3
                          "
                        >
                          Charging Points
                        </p>


                        <div
                          className="
                            space-y-2
                          "
                        >

                          {chargers.map(
                            (
                              charger,
                              index
                            ) => (

                              <div
                                key={
                                  charger.id ||
                                  index
                                }
                                className="
                                  flex
                                  flex-col
                                  sm:flex-row
                                  sm:items-center
                                  sm:justify-between
                                  gap-3
                                  bg-slate-950
                                  border
                                  border-slate-800
                                  rounded-xl
                                  px-4
                                  py-3
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
                                      w-9
                                      h-9
                                      rounded-lg
                                      bg-emerald-400/10
                                      flex
                                      items-center
                                      justify-center
                                    "
                                  >

                                    <Zap
                                      size={16}
                                      className="
                                        text-emerald-400
                                      "
                                    />

                                  </div>


                                  <div>

                                    <p
                                      className="
                                        text-sm
                                        text-white
                                        font-medium
                                      "
                                    >
                                      Charger {index + 1}
                                    </p>


                                    <p
                                      className="
                                        text-xs
                                        text-slate-500
                                        mt-1
                                      "
                                    >

                                      {charger.connectorType ||
                                        "Unknown connector"}

                                      {" • "}

                                      {charger.power ||
                                        0}{" "}
                                      kW

                                      {" • "}

                                      ₹
                                      {charger.pricePerKwh ||
                                        0}
                                      /kWh

                                    </p>

                                  </div>

                                </div>


                                <span
                                  className={`
                                    w-fit
                                    px-3
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-medium
                                    ${
                                      charger.status ===
                                      "available"
                                        ? "bg-emerald-400/10 text-emerald-400"
                                        : charger.status ===
                                          "occupied"
                                        ? "bg-red-400/10 text-red-400"
                                        : "bg-amber-400/10 text-amber-400"
                                    }
                                  `}
                                >
                                  {charger.status ||
                                    "unknown"}
                                </span>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}


                    {/* ACTIONS */}

                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-3
                        mt-6
                      "
                    >

                      <button
                        onClick={() =>
                          setEditingStation({
                            id:
                              station.id,

                            name:
                              station.name ||
                              "",

                            operator:
                              station.operator ||
                              "",

                            address:
                              station.address ||
                              "",

                            city:
                              station.city ||
                              "",

                            rating:
                              station.rating ||
                              0,
                          })
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
                          border
                          border-slate-700
                          text-slate-300
                          hover:text-white
                          hover:border-emerald-400
                          transition
                        "
                      >

                        <Pencil
                          size={17}
                        />

                        Edit

                      </button>


                      <button
                        onClick={() =>
                          handleDelete(
                            station.id
                          )
                        }
                        disabled={
                          deletingId ===
                          station.id
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
                          bg-red-500/10
                          border
                          border-red-500/20
                          text-red-400
                          hover:bg-red-500/20
                          disabled:opacity-50
                          transition
                        "
                      >

                        {deletingId ===
                        station.id ? (

                          <Loader2
                            size={17}
                            className="
                              animate-spin
                            "
                          />

                        ) : (

                          <Trash2
                            size={17}
                          />

                        )}

                        Delete

                      </button>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

      {editingStation && (

        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              w-full
              max-w-xl
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
                justify-between
                mb-6
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Edit Station
                </h2>


                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  Update station information.
                </p>

              </div>


              <button
                onClick={() =>
                  setEditingStation(
                    null
                  )
                }
                className="
                  text-slate-500
                  hover:text-white
                "
              >

                <X size={20} />

              </button>

            </div>


            <form
              onSubmit={
                handleUpdate
              }
              className="
                space-y-4
              "
            >

              <input
                value={
                  editingStation.name
                }
                onChange={(e) =>
                  setEditingStation({
                    ...editingStation,
                    name:
                      e.target.value,
                  })
                }
                placeholder="Station name"
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


              <input
                value={
                  editingStation.operator
                }
                onChange={(e) =>
                  setEditingStation({
                    ...editingStation,
                    operator:
                      e.target.value,
                  })
                }
                placeholder="Operator"
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


              <input
                value={
                  editingStation.address
                }
                onChange={(e) =>
                  setEditingStation({
                    ...editingStation,
                    address:
                      e.target.value,
                  })
                }
                placeholder="Address"
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


              <input
                value={
                  editingStation.city
                }
                onChange={(e) =>
                  setEditingStation({
                    ...editingStation,
                    city:
                      e.target.value,
                  })
                }
                placeholder="City"
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


              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={
                  editingStation.rating
                }
                onChange={(e) =>
                  setEditingStation({
                    ...editingStation,
                    rating:
                      e.target.value,
                  })
                }
                placeholder="Rating"
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


              <div
                className="
                  flex
                  flex-col-reverse
                  sm:flex-row
                  justify-end
                  gap-3
                  pt-3
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setEditingStation(
                      null
                    )
                  }
                  className="
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-slate-700
                    text-slate-300
                    hover:text-white
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    editLoading
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-3
                    rounded-xl
                    bg-emerald-400
                    text-slate-950
                    font-semibold
                    hover:bg-emerald-300
                    disabled:opacity-60
                  "
                >

                  {editLoading && (

                    <Loader2
                      size={17}
                      className="
                        animate-spin
                      "
                    />

                  )}

                  Save Changes

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default AdminDashboard;