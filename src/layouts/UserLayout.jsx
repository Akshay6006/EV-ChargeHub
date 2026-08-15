import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  BatteryCharging,
  Car,
  Heart,
  CreditCard,
  UserRound,
  Bell,
  LogOut,
  Zap,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

import { signOut } from "firebase/auth";

import { auth } from "../firebase/firebase";

import { useAuth } from "../context/AuthContext";


function UserLayout() {

  const navigate = useNavigate();

  const { userData } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {

    await signOut(auth);

    navigate("/login");

  };


  // ==========================================
  // SIDEBAR NAVIGATION
  // ==========================================

  const navItems = [

    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      label: "Find Chargers",
      path: "/stations",
      icon: MapPin,
    },

    {
      label: "My Bookings",
      path: "/bookings",
      icon: CalendarDays,
    },

    {
      label: "Charging History",
      path: "/history",
      icon: BatteryCharging,
    },

    {
      label: "My Vehicles",
      path: "/vehicles",
      icon: Car,
    },

    {
      label: "Favorites",
      path: "/favorites",
      icon: Heart,
    },

    // ========================================
    // WALLET
    // ========================================

    {
      label: "My Wallet",
      path: "/wallet",
      icon: CreditCard,
    },

    // {
    //   label: "Payment",
    //   path: "/payment",
    //   icon: CreditCard,
    // },

    {
      label: "Profile",
      path: "/profile",
      icon: UserRound,
    },

  ];


  return (

    <div className="
      min-h-screen
      bg-slate-950
      text-white
    ">


      {/* ======================================
          MOBILE OVERLAY
      ======================================= */}

      {sidebarOpen && (

        <div
          className="
            fixed
            inset-0
            bg-black/60
            z-40
            lg:hidden
          "
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}


      {/* ======================================
          SIDEBAR
      ======================================= */}

      <aside
        className={`
          fixed
          top-0
          left-0
          bottom-0
          z-50
          w-72
          bg-slate-900
          border-r
          border-slate-800
          flex
          flex-col
          transition-transform
          duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >


        {/* ====================================
            LOGO
        ===================================== */}

        <div className="
          h-20
          px-6
          flex
          items-center
          justify-between
          border-b
          border-slate-800
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-10
              h-10
              rounded-xl
              bg-emerald-400
              flex
              items-center
              justify-center
            ">

              <Zap
                size={21}
                className="
                  text-slate-950
                "
                fill="currentColor"
              />

            </div>


            <div>

              <h1 className="
                font-bold
                text-lg
              ">
                EV ChargeHub
              </h1>


              <p className="
                text-xs
                text-slate-500
              ">
                Smart charging
              </p>

            </div>

          </div>


          {/* MOBILE CLOSE */}

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="
              lg:hidden
              text-slate-400
              hover:text-white
            "
          >

            <X size={21} />

          </button>

        </div>


        {/* ====================================
            NAVIGATION
        ===================================== */}

        <nav className="
          flex-1
          px-4
          py-6
          space-y-1
          overflow-y-auto
        ">

          <p className="
            px-3
            mb-3
            text-[11px]
            uppercase
            tracking-widest
            text-slate-600
            font-semibold
          ">
            Workspace
          </p>


          {navItems.map(
            (item) => {

              const Icon =
                item.icon;


              return (

                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className={({
                    isActive,
                  }) => `
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    text-sm
                    transition

                    ${
                      isActive
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >

                  <Icon size={18} />


                  <span>
                    {item.label}
                  </span>

                </NavLink>

              );

            }
          )}

        </nav>


        {/* ====================================
            USER SECTION
        ===================================== */}

        <div className="
          p-4
          border-t
          border-slate-800
        ">


          <div className="
            flex
            items-center
            gap-3
            px-2
            py-3
          ">


            {/* AVATAR */}

            <div className="
              w-10
              h-10
              rounded-full
              bg-emerald-400/10
              text-emerald-400
              flex
              items-center
              justify-center
              font-semibold
              shrink-0
            ">

              {(userData?.name || "U")
                .charAt(0)
                .toUpperCase()}

            </div>


            {/* USER INFO */}

            <div className="
              flex-1
              min-w-0
            ">

              <p className="
                text-sm
                font-medium
                truncate
              ">

                {userData?.name ||
                  "User"}

              </p>


              <p className="
                text-xs
                text-slate-500
                truncate
              ">

                {userData?.email ||
                  ""}

              </p>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-3
              rounded-xl
              text-sm
              text-slate-400
              hover:bg-red-500/10
              hover:text-red-400
              transition
            "
          >

            <LogOut size={18} />

            Sign out

          </button>

        </div>

      </aside>


      {/* ======================================
          MAIN AREA
      ======================================= */}

      <div className="
        lg:ml-72
        min-h-screen
        min-w-0
      ">


        {/* ====================================
            TOP BAR
        ===================================== */}

        <header className="
          h-16
          sm:h-20
          border-b
          border-slate-800
          bg-slate-950/80
          backdrop-blur
          sticky
          top-0
          z-30
        ">

          <div className="
            h-full
            px-4
            sm:px-6
            lg:px-8
            flex
            items-center
            justify-between
          ">


            {/* MOBILE MENU */}

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="
                lg:hidden
                w-10
                h-10
                rounded-xl
                bg-slate-900
                border
                border-slate-800
                flex
                items-center
                justify-center
              "
            >

              <Menu size={20} />

            </button>


            {/* DESKTOP TITLE */}

            <div className="
              hidden
              lg:block
            ">

              <p className="
                text-sm
                text-slate-500
              ">
                EV ChargeHub
              </p>

            </div>


            {/* RIGHT */}

            <div className="
              flex
              items-center
              gap-3
            ">


              {/* NOTIFICATION */}

              <button
                className="
                  relative
                  w-10
                  h-10
                  rounded-xl
                  bg-slate-900
                  border
                  border-slate-800
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  hover:text-white
                  transition
                "
              >

                <Bell size={18} />


                <span className="
                  absolute
                  top-2
                  right-2
                  w-2
                  h-2
                  bg-emerald-400
                  rounded-full
                " />

              </button>


              {/* USER */}

              <div className="
                hidden
                sm:flex
                items-center
                gap-3
                pl-3
                border-l
                border-slate-800
              ">

                <div className="
                  text-right
                ">

                  <p className="
                    text-sm
                    font-medium
                  ">

                    {userData?.name ||
                      "User"}

                  </p>


                  <p className="
                    text-xs
                    text-slate-500
                  ">
                    EV Driver
                  </p>

                </div>


                <div className="
                  w-10
                  h-10
                  rounded-full
                  bg-emerald-400
                  text-slate-950
                  flex
                  items-center
                  justify-center
                  font-bold
                ">

                  {(userData?.name || "U")
                    .charAt(0)
                    .toUpperCase()}

                </div>

              </div>

            </div>

          </div>

        </header>


        {/* ====================================
            PAGE CONTENT
        ===================================== */}

        <main className="
          p-3
          sm:p-5
          lg:p-8
          w-full
          min-w-0
        ">

          <Outlet />

        </main>

      </div>

    </div>

  );

}


export default UserLayout;