import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
} from "lucide-react";
import {
  LayoutDashboard,
  MapPin,
  Users,
  CalendarCheck,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

import { useState } from "react";

import { signOut } from "firebase/auth";

import { auth } from "../firebase/firebase";

import { useAuth } from "../context/AuthContext";


function AdminLayout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const { user, userData } = useAuth();


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {

    try {

      await signOut(auth);

      navigate("/login");

    } catch (error) {

      console.error(
        "Admin logout error:",
        error
      );

    }

  };


  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigation = [

    {
      name: "Overview",
      path: "/admin",
      icon: LayoutDashboard
    },

    {
      name: "Charging Stations",
      path: "/admin/stations",
      icon: MapPin
    },

    {
      name: "Charging Sessions",
      path: "/admin/charging",
      icon: Activity,
   },

    {
      name: "Users",
      path: "/admin/users",
      icon: Users
    },

    {
      name: "Bookings",
      path: "/admin/bookings",
      icon: CalendarCheck
    },

    {
      name: "Chargers",
      path: "/admin/chargers",
      icon: Zap
    },

    {
      name: "Reports",
      path: "/admin/reports",
      icon: BarChart3
    },

    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings
    }

  ];


  // ==========================================
  // SIDEBAR
  // ==========================================

  const Sidebar = () => (

    <aside
      className={`
        fixed
        top-0
        left-0
        bottom-0
        z-50
        w-72
        bg-slate-950
        border-r
        border-slate-800
        flex
        flex-col
        transition-transform
        duration-300
        lg:translate-x-0
        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >

      {/* ====================================
          BRAND
      ===================================== */}

      <div className="h-20 px-6 border-b border-slate-800 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">

              <Zap
                size={21}
                className="text-emerald-400"
              />

            </div>

            <div>

              <h1 className="text-white font-bold">
                EV ChargeHub
              </h1>

              <p className="text-xs text-emerald-400 mt-0.5">
                ADMIN PANEL
              </p>

            </div>

          </div>

        </div>


        {/* Mobile close */}

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-slate-500 hover:text-white"
        >

          <X size={20} />

        </button>

      </div>


      {/* ====================================
          ADMIN PROFILE
      ===================================== */}

      <div className="p-4">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center">

              <span className="text-emerald-400 font-bold">

                {(userData?.name || "A")
                  .charAt(0)
                  .toUpperCase()}

              </span>

            </div>


            <div className="min-w-0">

              <p className="text-sm font-semibold text-white truncate">

                {userData?.name || "Administrator"}

              </p>

              <p className="text-xs text-emerald-400 mt-0.5">
                Administrator
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================
          NAVIGATION
      ===================================== */}

      <nav className="flex-1 px-4 overflow-y-auto">

        <p className="px-3 mb-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Management
        </p>


        <div className="space-y-1">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({ isActive }) => `
                  flex
                  items-center
                  gap-3
                  px-3
                  py-3
                  rounded-xl
                  text-sm
                  font-medium
                  transition
                  ${
                    isActive
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }
                `}
              >

                <Icon size={19} />

                <span>
                  {item.name}
                </span>

              </NavLink>

            );

          })}

        </div>

      </nav>


      {/* ====================================
          FOOTER
      ===================================== */}

      <div className="p-4 border-t border-slate-800">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >

          <LogOut size={19} />

          Logout

        </button>

      </div>

    </aside>

  );


  return (

    <div className="min-h-screen bg-slate-950 text-white">


      {/* ====================================
          SIDEBAR
      ===================================== */}

      <Sidebar />


      {/* ====================================
          MOBILE OVERLAY
      ===================================== */}

      {sidebarOpen && (

        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}


      {/* ====================================
          MAIN
      ===================================== */}

      <div className="lg:ml-72 min-h-screen min-w-0">


        {/* ==================================
            HEADER
        =================================== */}

        <header className="h-16 sm:h-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">

          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">


            {/* Mobile menu */}

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="lg:hidden text-slate-400 hover:text-white"
            >

              <Menu size={22} />

            </button>


            {/* Desktop title */}

            <div className="hidden lg:block">

              <p className="text-sm text-slate-500">
                Administration
              </p>

              <p className="text-sm font-medium text-white mt-0.5">
                EV ChargeHub Control Center
              </p>

            </div>


            {/* Right side */}

            <div className="flex items-center gap-3 ml-auto">

              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400/10">

                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                <span className="text-xs text-emerald-400 font-medium">
                  System Online
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* ==================================
            PAGE CONTENT
        =================================== */}

        <main className="p-4 sm:p-6 lg:p-8 w-full min-w-0">

          <Outlet />

        </main>

      </div>

    </div>

  );

}


export default AdminLayout;