import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import {
  Search,
  Users,
  ShieldCheck,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Loader2,
  RefreshCw,
  UserCog,
} from "lucide-react";

import { db } from "../../firebase/firebase";


function AdminUsers() {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [updating, setUpdating] =
    useState(null);

  const [error, setError] = useState("");


  // ==========================================
  // LOAD REAL USERS
  // ==========================================

  useEffect(() => {

    const usersRef =
      collection(db, "users");


    const unsubscribe =
      onSnapshot(

        usersRef,

        (snapshot) => {

          const userList =
            snapshot.docs.map(
              (userDoc) => ({

                id: userDoc.id,

                ...userDoc.data(),

              })
            );


          setUsers(userList);

          setLoading(false);

          setError("");

        },

        (error) => {

          console.error(
            "Admin users loading error:",
            error
          );

          setError(
            "Unable to load users."
          );

          setLoading(false);

        }

      );


    return () =>
      unsubscribe();

  }, []);


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    value
  ) => {

    if (!value) {
      return "—";
    }


    let date;


    if (
      typeof value?.toDate ===
      "function"
    ) {

      date =
        value.toDate();

    } else {

      date =
        new Date(value);

    }


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

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


  // ==========================================
  // FILTER USERS
  // ==========================================

  const filteredUsers =
    useMemo(() => {

      const searchValue =
        search
          .toLowerCase()
          .trim();


      return users.filter(
        (user) => {

          const name =
            String(
              user.name || ""
            ).toLowerCase();


          const email =
            String(
              user.email || ""
            ).toLowerCase();


          const phone =
            String(
              user.phone || ""
            ).toLowerCase();


          const role =
            String(
              user.role || "user"
            ).toLowerCase();


          const matchesSearch =
            !searchValue ||
            name.includes(
              searchValue
            ) ||
            email.includes(
              searchValue
            ) ||
            phone.includes(
              searchValue
            );


          const matchesRole =
            roleFilter ===
              "all" ||
            role ===
              roleFilter;


          return (
            matchesSearch &&
            matchesRole
          );

        }
      );

    }, [
      users,
      search,
      roleFilter,
    ]);


  // ==========================================
  // COUNTS
  // ==========================================

  const totalUsers =
    users.length;


  const adminUsers =
    users.filter(
      (user) =>
        String(
          user.role || "user"
        ).toLowerCase() ===
        "admin"
    ).length;


  const normalUsers =
    users.filter(
      (user) =>
        String(
          user.role || "user"
        ).toLowerCase() !==
        "admin"
    ).length;


  // ==========================================
  // CHANGE ROLE
  // ==========================================

  const changeRole = async (
    user
  ) => {

    const currentRole =
      String(
        user.role || "user"
      ).toLowerCase();


    const newRole =
      currentRole ===
      "admin"
        ? "user"
        : "admin";


    const confirmed =
      window.confirm(
        `Change ${user.name || user.email || "this user"} role to ${newRole}?`
      );


    if (!confirmed) {
      return;
    }


    setUpdating(
      user.id
    );

    setError("");


    try {

      await updateDoc(

        doc(
          db,
          "users",
          user.id
        ),

        {
          role:
            newRole,
        }

      );

    } catch (error) {

      console.error(
        "Role update error:",
        error
      );

      setError(
        "Unable to update user role."
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
            Loading users...
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
            Users
          </h1>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Manage registered users and administrator access.
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
          grid-cols-1
          sm:grid-cols-3
          gap-4
        "
      >

        <SummaryCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
        />


        <SummaryCard
          title="Regular Users"
          value={normalUsers}
          icon={UserRound}
          valueClass="text-emerald-400"
        />


        <SummaryCard
          title="Administrators"
          value={adminUsers}
          icon={ShieldCheck}
          valueClass="text-amber-400"
        />

      </div>


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
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name, email or phone..."
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


        {/* ROLE FILTER */}

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(
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
            focus:border-emerald-400/50
          "
        >

          <option value="all">
            All Users
          </option>

          <option value="user">
            Users
          </option>

          <option value="admin">
            Administrators
          </option>

        </select>

      </div>


      {/* ======================================
          USERS TABLE
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
            p-5
            sm:p-6
            border-b
            border-slate-800
            flex
            items-center
            justify-between
            gap-4
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
              Registered Users
            </h2>


            <p
              className="
                text-xs
                text-slate-600
                mt-1
              "
            >
              Showing{" "}
              {filteredUsers.length}{" "}
              of{" "}
              {users.length}{" "}
              users
            </p>

          </div>


          <UserCog
            size={20}
            className="
              text-slate-600
            "
          />

        </div>


        {filteredUsers.length ===
        0 ? (

          <div
            className="
              p-12
              text-center
            "
          >

            <Users
              size={35}
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
              No users found.
            </p>

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
                min-w-[900px]
              "
            >

              <thead>

                <tr
                  className="
                    border-b
                    border-slate-800
                    text-left
                    text-xs
                    text-slate-600
                  "
                >

                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    User
                  </th>


                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Contact
                  </th>


                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Role
                  </th>


                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                    "
                  >
                    Joined
                  </th>


                  <th
                    className="
                      px-6
                      py-4
                      font-medium
                      text-right
                    "
                  >
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredUsers.map(
                  (user) => {

                    const role =
                      String(
                        user.role ||
                          "user"
                      ).toLowerCase();


                    const isAdmin =
                      role ===
                      "admin";


                    return (

                      <tr
                        key={
                          user.id
                        }
                        className="
                          border-b
                          border-slate-800/70
                          last:border-0
                          hover:bg-slate-950/50
                          transition
                        "
                      >

                        {/* USER */}

                        <td
                          className="
                            px-6
                            py-5
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
                              className={`
                                w-10
                                h-10
                                rounded-full
                                flex
                                items-center
                                justify-center
                                font-semibold
                                ${
                                  isAdmin
                                    ? "bg-amber-400/10 text-amber-400"
                                    : "bg-emerald-400/10 text-emerald-400"
                                }
                              `}
                            >

                              {(
                                user.name ||
                                user.email ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>


                            <div
                              className="
                                min-w-0
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  font-medium
                                  text-white
                                  truncate
                                  max-w-[220px]
                                "
                              >
                                {user.name ||
                                  "Unnamed User"}
                              </p>


                              <p
                                className="
                                  text-xs
                                  text-slate-600
                                  mt-1
                                "
                              >
                                UID:{" "}
                                {user.id}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* CONTACT */}

                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <div
                            className="
                              space-y-2
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-slate-400
                              "
                            >

                              <Mail
                                size={13}
                              />

                              <span>
                                {user.email ||
                                  "—"}
                              </span>

                            </div>


                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-slate-600
                              "
                            >

                              <Phone
                                size={13}
                              />

                              <span>
                                {user.phone ||
                                  "—"}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* ROLE */}

                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              px-2.5
                              py-1.5
                              rounded-full
                              text-[11px]
                              font-semibold
                              ${
                                isAdmin
                                  ? "bg-amber-400/10 text-amber-400"
                                  : "bg-emerald-400/10 text-emerald-400"
                              }
                            `}
                          >

                            {isAdmin ? (
                              <ShieldCheck
                                size={13}
                              />
                            ) : (
                              <UserRound
                                size={13}
                              />
                            )}

                            {isAdmin
                              ? "Administrator"
                              : "User"}

                          </span>

                        </td>


                        {/* JOINED */}

                        <td
                          className="
                            px-6
                            py-5
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              text-xs
                              text-slate-500
                            "
                          >

                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              user.createdAt ||
                              user.created_at ||
                              user.registrationDate
                            )}

                          </div>

                        </td>


                        {/* ACTION */}

                        <td
                          className="
                            px-6
                            py-5
                            text-right
                          "
                        >

                          <button
                            type="button"
                            disabled={
                              updating ===
                              user.id
                            }
                            onClick={() =>
                              changeRole(
                                user
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              px-3
                              py-2
                              rounded-lg
                              bg-slate-950
                              border
                              border-slate-800
                              text-xs
                              text-slate-400
                              hover:text-white
                              hover:border-slate-700
                              transition
                              disabled:opacity-50
                            "
                          >

                            {updating ===
                            user.id ? (

                              <Loader2
                                size={14}
                                className="
                                  animate-spin
                                "
                              />

                            ) : (

                              <UserCog
                                size={14}
                              />

                            )}

                            {isAdmin
                              ? "Remove Admin"
                              : "Make Admin"}

                          </button>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

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


export default AdminUsers;