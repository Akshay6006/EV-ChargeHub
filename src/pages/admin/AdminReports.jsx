import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import {
  BarChart3,
  BatteryCharging,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Loader2,
  RefreshCw,
  RotateCcw,
  TrendingUp,
  Zap,
} from "lucide-react";

import { db } from "../../firebase/firebase";


function AdminReports() {

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState("30");


  useEffect(() => {

    const bookingsQuery =
      query(
        collection(
          db,
          "bookings"
        )
      );


    const unsubscribe =
      onSnapshot(

        bookingsQuery,

        (snapshot) => {

          const data =
            snapshot.docs.map(
              (bookingDoc) => ({
                id:
                  bookingDoc.id,

                ...bookingDoc.data(),
              })
            );


          setBookings(data);

          setLoading(false);

        },

        (error) => {

          console.error(
            "Reports loading error:",
            error
          );

          setBookings([]);

          setLoading(false);

        }

      );


    return () =>
      unsubscribe();

  }, []);


  const getDate =
    (value) => {

      if (!value) {
        return null;
      }


      if (
        typeof value.toDate ===
        "function"
      ) {

        return value.toDate();

      }


      const date =
        new Date(value);


      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;

    };


  const formatCurrency =
    (value) =>
      `₹${Number(
        value || 0
      ).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;

  const filteredBookings =
    useMemo(() => {

      if (period === "all") {

        return bookings;

      }


      const days =
        Number(period);


      const cutoff =
        new Date();


      cutoff.setDate(
        cutoff.getDate() -
        days
      );


      return bookings.filter(
        (booking) => {

          const date =
            getDate(
              booking.createdAt ||
              booking.paidAt ||
              booking.date
            );


          if (!date) {
            return false;
          }


          return date >= cutoff;

        }
      );

    }, [
      bookings,
      period,
    ]);


  const report =
    useMemo(() => {

      let totalPaid = 0;

      let totalRefunded = 0;

      let totalEnergy = 0;

      let activeSessions = 0;

      let completedSessions = 0;

      let cancelledSessions = 0;


      filteredBookings.forEach(
        (booking) => {

          const amount =
            Number(
              booking.amount
            ) || 0;


          const refund =
            Number(
              booking.refundAmount
            ) || 0;


          const energy =
            Number(
              booking.energy
            ) || 0;


          if (
            booking.paymentStatus ===
              "paid" ||
            amount > 0
          ) {

            totalPaid +=
              amount;

          }


          totalRefunded +=
            refund;


          totalEnergy +=
            energy;


          if (
            booking.status ===
            "active"
          ) {

            activeSessions++;

          }


          if (
            booking.status ===
            "completed"
          ) {

            completedSessions++;

          }


          if (
            booking.status ===
            "cancelled"
          ) {

            cancelledSessions++;

          }

        }
      );


      const netRevenue =
        totalPaid -
        totalRefunded;


      return {

        totalPaid,

        totalRefunded,

        netRevenue,

        totalEnergy,

        activeSessions,

        completedSessions,

        cancelledSessions,

        totalBookings:
          filteredBookings.length,

      };

    }, [
      filteredBookings,
    ]);


  const stationPerformance =
    useMemo(() => {

      const stations = {};


      filteredBookings.forEach(
        (booking) => {

          const stationName =
            booking.stationName ||
            "Unknown Station";


          if (
            !stations[
              stationName
            ]
          ) {

            stations[
              stationName
            ] = {

              name:
                stationName,

              sessions:
                0,

              revenue:
                0,

              refunds:
                0,

              energy:
                0,

            };

          }


          const station =
            stations[
              stationName
            ];


          station.sessions += 1;


          station.revenue +=
            Number(
              booking.amount
            ) || 0;


          station.refunds +=
            Number(
              booking.refundAmount
            ) || 0;


          station.energy +=
            Number(
              booking.energy
            ) || 0;

        }
      );


      return Object.values(
        stations
      )
        .map(
          (station) => ({

            ...station,

            netRevenue:
              station.revenue -
              station.refunds,

          })
        )
        .sort(
          (a, b) =>
            b.netRevenue -
            a.netRevenue
        );

    }, [
      filteredBookings,
    ]);


  const dailyRevenue =
    useMemo(() => {

      const days = {};


      filteredBookings.forEach(
        (booking) => {

          const date =
            getDate(
              booking.createdAt ||
              booking.paidAt ||
              booking.date
            );


          if (!date) {
            return;
          }


          const key =
            date.toISOString()
              .split("T")[0];


          if (!days[key]) {

            days[key] = {

              date:
                key,

              revenue:
                0,

              refunds:
                0,

              sessions:
                0,

            };

          }


          days[key].revenue +=
            Number(
              booking.amount
            ) || 0;


          days[key].refunds +=
            Number(
              booking.refundAmount
            ) || 0;


          days[key].sessions +=
            1;

        }
      );


      return Object.values(
        days
      )
        .sort(
          (a, b) =>
            new Date(a.date) -
            new Date(b.date)
        )
        .slice(-14);

    }, [
      filteredBookings,
    ]);


  const maxDailyRevenue =
    Math.max(
      ...dailyRevenue.map(
        (item) =>
          item.revenue
      ),
      1
    );


  const recentTransactions =
    useMemo(() => {

      return [
        ...filteredBookings,
      ]
        .sort(
          (a, b) => {

            const dateA =
              getDate(
                a.createdAt ||
                a.paidAt ||
                a.date
              );


            const dateB =
              getDate(
                b.createdAt ||
                b.paidAt ||
                b.date
              );


            return (
              (dateB?.getTime() || 0) -
              (dateA?.getTime() || 0)
            );

          }
        )
        .slice(0, 8);

    }, [
      filteredBookings,
    ]);


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
              mt-4
              text-slate-500
            "
          >
            Loading real report data...
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
            Reports
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
            Revenue & Analytics
          </h1>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Real-time business performance from your charging data.
          </p>

        </div>


        {/* PERIOD */}

        <div
          className="
            flex
            items-center
            gap-2
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            p-1
          "
        >

          {[
            {
              label: "7 Days",
              value: "7",
            },

            {
              label: "30 Days",
              value: "30",
            },

            {
              label: "All Time",
              value: "all",
            },

          ].map(
            (item) => (

              <button
                key={
                  item.value
                }
                onClick={() =>
                  setPeriod(
                    item.value
                  )
                }
                className={`
                  px-3
                  py-2
                  rounded-lg
                  text-xs
                  font-medium
                  transition
                  ${
                    period ===
                    item.value
                      ? "bg-emerald-400 text-slate-950"
                      : "text-slate-500 hover:text-white"
                  }
                `}
              >

                {item.label}

              </button>

            )
          )}

        </div>

      </div>

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >

        <ReportCard
          title="Total Revenue"
          value={formatCurrency(
            report.totalPaid
          )}
          subtitle="Before refunds"
          icon={CircleDollarSign}
        />


        <ReportCard
          title="Net Revenue"
          value={formatCurrency(
            report.netRevenue
          )}
          subtitle="After refunds"
          icon={TrendingUp}
        />


        <ReportCard
          title="Total Refunded"
          value={formatCurrency(
            report.totalRefunded
          )}
          subtitle="Credited back to users"
          icon={RotateCcw}
        />


        <ReportCard
          title="Energy Consumed"
          value={`${report.totalEnergy.toFixed(2)} kWh`}
          subtitle={`${report.totalBookings} total bookings`}
          icon={BatteryCharging}
        />

      </div>

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-4
        "
      >

        <SmallCard
          title="Total Bookings"
          value={
            report.totalBookings
          }
          icon={CalendarDays}
        />


        <SmallCard
          title="Active Sessions"
          value={
            report.activeSessions
          }
          icon={Zap}
        />


        <SmallCard
          title="Completed"
          value={
            report.completedSessions
          }
          icon={CircleDollarSign}
        />


        <SmallCard
          title="Cancelled"
          value={
            report.cancelledSessions
          }
          icon={RotateCcw}
        />

      </div>

      <section
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
            items-center
            gap-3
            mb-6
          "
        >

          <BarChart3
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
              Revenue Overview
            </h2>

            <p
              className="
                text-xs
                text-slate-600
                mt-1
              "
            >
              Actual booking revenue by day
            </p>

          </div>

        </div>


        {dailyRevenue.length === 0 ? (

          <div
            className="
              h-64
              flex
              items-center
              justify-center
              text-slate-600
              text-sm
            "
          >
            No revenue data for this period.
          </div>

        ) : (

          <div
            className="
              h-64
              flex
              items-end
              gap-2
              sm:gap-4
              overflow-x-auto
              pb-7
            "
          >

            {dailyRevenue.map(
              (item) => {

                const height =
                  Math.max(
                    5,
                    (
                      item.revenue /
                      maxDailyRevenue
                    ) *
                    100
                  );


                const label =
                  new Date(
                    item.date
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  );


                return (

                  <div
                    key={item.date}
                    className="
                      min-w-[34px]
                      flex-1
                      h-full
                      flex
                      flex-col
                      justify-end
                      items-center
                      gap-2
                    "
                    title={`${label}: ${formatCurrency(item.revenue)}`}
                  >

                    <div
                      className="
                        w-full
                        max-w-10
                        rounded-t-lg
                        bg-emerald-400/80
                        hover:bg-emerald-400
                        transition
                      "
                      style={{
                        height:
                          `${height}%`,
                      }}
                    />

                    <span
                      className="
                        text-[10px]
                        text-slate-600
                        whitespace-nowrap
                      "
                    >
                      {label}
                    </span>

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>
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
            p-5
            sm:p-6
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
            Station Performance
          </h2>


          <p
            className="
              text-xs
              text-slate-600
              mt-1
            "
          >
            Calculated from actual bookings
          </p>

        </div>


        {stationPerformance.length ===
        0 ? (

          <div
            className="
              p-10
              text-center
              text-sm
              text-slate-600
            "
          >
            No station data available.
          </div>

        ) : (

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                min-w-[700px]
              "
            >

              <thead>

                <tr
                  className="
                    text-left
                    text-xs
                    text-slate-600
                    border-b
                    border-slate-800
                  "
                >

                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Station
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Sessions
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Energy
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Revenue
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Refunds
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Net Revenue
                  </th>

                </tr>

              </thead>


              <tbody>

                {stationPerformance.map(
                  (station) => (

                    <tr
                      key={
                        station.name
                      }
                      className="
                        border-b
                        border-slate-800/70
                        last:border-0
                      "
                    >

                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-white
                          font-medium
                        "
                      >
                        {station.name}
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-slate-400
                        "
                      >
                        {station.sessions}
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-slate-400
                        "
                      >
                        {station.energy.toFixed(
                          2
                        )}{" "}
                        kWh
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-slate-300
                        "
                      >
                        {formatCurrency(
                          station.revenue
                        )}
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-red-400
                        "
                      >
                        {formatCurrency(
                          station.refunds
                        )}
                      </td>


                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-emerald-400
                          font-semibold
                        "
                      >
                        {formatCurrency(
                          station.netRevenue
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

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
            p-5
            sm:p-6
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
            Recent Transactions
          </h2>


          <p
            className="
              text-xs
              text-slate-600
              mt-1
            "
          >
            Latest real bookings from Firestore
          </p>

        </div>


        {recentTransactions.length ===
        0 ? (

          <div
            className="
              p-10
              text-center
              text-sm
              text-slate-600
            "
          >
            No transactions available.
          </div>

        ) : (

          <div
            className="
              divide-y
              divide-slate-800
            "
          >

            {recentTransactions.map(
              (booking) => {

                const date =
                  getDate(
                    booking.createdAt ||
                    booking.paidAt ||
                    booking.date
                  );


                return (

                  <div
                    key={
                      booking.id
                    }
                    className="
                      p-5
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-4
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          font-medium
                          text-white
                        "
                      >
                        {booking.stationName ||
                          "Charging Station"}
                      </p>


                      <p
                        className="
                          text-xs
                          text-slate-600
                          mt-1
                        "
                      >
                        {booking.userEmail ||
                          booking.userId ||
                          "User"}
                      </p>


                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-3
                          mt-2
                        "
                      >

                        <span
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          {booking.status ||
                            "unknown"}
                        </span>


                        {date && (

                          <span
                            className="
                              flex
                              items-center
                              gap-1
                              text-xs
                              text-slate-600
                            "
                          >

                            <Clock3
                              size={11}
                            />

                            {date.toLocaleDateString(
                              "en-IN"
                            )}

                          </span>

                        )}

                      </div>

                    </div>


                    <div
                      className="
                        sm:text-right
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-white
                        "
                      >
                        {formatCurrency(
                          Number(
                            booking.amount
                          ) || 0
                        )}
                      </p>


                      {Number(
                        booking.refundAmount
                      ) > 0 && (

                        <p
                          className="
                            text-xs
                            text-emerald-400
                            mt-1
                          "
                        >
                          Refund:{" "}
                          {formatCurrency(
                            booking.refundAmount
                          )}
                        </p>

                      )}

                    </div>

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

function ReportCard({
  title,
  value,
  subtitle,
  icon: Icon,
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
            text-emerald-400
          "
        />

      </div>


      <p
        className="
          text-2xl
          font-bold
          text-white
          mt-3
        "
      >
        {value}
      </p>


      <p
        className="
          text-xs
          text-slate-600
          mt-1
        "
      >
        {subtitle}
      </p>

    </div>

  );

}
function SmallCard({
  title,
  value,
  icon: Icon,
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
          size={17}
          className="
            text-slate-500
          "
        />

      </div>


      <p
        className="
          text-2xl
          font-bold
          text-white
          mt-3
        "
      >
        {value}
      </p>

    </div>

  );

}


export default AdminReports;