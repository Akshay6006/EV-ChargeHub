import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import evHero from "./assets/ev-hero.jpg";
import evCharging from "./assets/ev-charging.jpg";

import {
  Zap,
  ArrowRight,
  BatteryCharging,
  MapPin,
  CalendarDays,
  IndianRupee,
  Menu,
  X,
  ShieldCheck,
  Clock3,
  Leaf,
} from "lucide-react";

import { useState } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";


import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";


import UserLayout from "./layouts/UserLayout";

import Dashboard from "./pages/user/Dashboard";
import Vehicles from "./pages/user/Vehicles";
import Stations from "./pages/user/Stations";
import BookingForm from "./pages/user/BookingForm";
import Bookings from "./pages/user/Bookings";
import Wallet from "./pages/user/Wallet";
import History from "./pages/user/History";
import Favorites from "./pages/user/Favorites";
import Profile from "./pages/user/Profile";

import AdminLayout from "./layouts/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import StationManager from "./pages/admin/StationManager";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminCharging from "./pages/admin/AdminCharging";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminChargers from "./pages/admin/AdminChargers";
import AdminUsers from "./pages/admin/AdminUsers";


function Home() {

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);


  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };


  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
        overflow-hidden
      "
    >

      <nav
        className="
          fixed
          top-0
          left-0
          right-0
          z-50
          border-b
          border-slate-800/70
          bg-slate-950/85
          backdrop-blur-xl
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-5
            sm:px-6
            lg:px-8
          "
        >

          <div
            className="
              h-20
              flex
              items-center
              justify-between
            "
          >

            {/* LOGO */}

            <Link
              to="/"
              onClick={closeMobileMenu}
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
                  border
                  border-emerald-400/20
                  flex
                  items-center
                  justify-center
                "
              >

                <Zap
                  size={22}
                  className="
                    text-emerald-400
                  "
                />

              </div>


              <div>

                <h1
                  className="
                    font-bold
                    text-white
                    leading-tight
                  "
                >
                  EV ChargeHub
                </h1>


                <p
                  className="
                    text-[10px]
                    tracking-[0.2em]
                    text-emerald-400
                    uppercase
                    mt-0.5
                  "
                >
                  Smart EV Charging
                </p>

              </div>

            </Link>


            {/* DESKTOP NAVIGATION */}

            <div
              className="
                hidden
                md:flex
                items-center
                gap-8
              "
            >

              <a
                href="#features"
                className="
                  text-sm
                  text-slate-400
                  hover:text-white
                  transition
                "
              >
                Features
              </a>


              <a
                href="#how-it-works"
                className="
                  text-sm
                  text-slate-400
                  hover:text-white
                  transition
                "
              >
                How it works
              </a>


              <a
                href="#about"
                className="
                  text-sm
                  text-slate-400
                  hover:text-white
                  transition
                "
              >
                About
              </a>

            </div>


            {/* DESKTOP ACTIONS */}

            <div
              className="
                hidden
                md:flex
                items-center
                gap-3
              "
            >

              <Link
                to="/login"
                className="
                  text-sm
                  font-medium
                  text-slate-300
                  hover:text-white
                  transition
                  px-4
                  py-2
                "
              >
                Login
              </Link>


              <Link
                to="/register"
                className="
                  flex
                  items-center
                  gap-2
                  bg-emerald-400
                  hover:bg-emerald-300
                  text-slate-950
                  font-semibold
                  text-sm
                  px-5
                  py-2.5
                  rounded-xl
                  transition
                "
              >

                Get started

                <ArrowRight
                  size={16}
                />

              </Link>

            </div>


            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              className="
                md:hidden
                w-10
                h-10
                rounded-xl
                border
                border-slate-800
                flex
                items-center
                justify-center
                text-slate-300
                hover:text-white
                hover:bg-slate-900
                transition
              "
            >

              {mobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}

            </button>

          </div>


          {/* MOBILE MENU */}

          {mobileMenuOpen && (

            <div
              className="
                md:hidden
                border-t
                border-slate-800
                py-5
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-2
                "
              >

                <a
                  href="#features"
                  onClick={
                    closeMobileMenu
                  }
                  className="
                    px-4
                    py-3
                    rounded-xl
                    text-sm
                    text-slate-400
                    hover:bg-slate-900
                    hover:text-white
                  "
                >
                  Features
                </a>


                <a
                  href="#how-it-works"
                  onClick={
                    closeMobileMenu
                  }
                  className="
                    px-4
                    py-3
                    rounded-xl
                    text-sm
                    text-slate-400
                    hover:bg-slate-900
                    hover:text-white
                  "
                >
                  How it works
                </a>


                <a
                  href="#about"
                  onClick={
                    closeMobileMenu
                  }
                  className="
                    px-4
                    py-3
                    rounded-xl
                    text-sm
                    text-slate-400
                    hover:bg-slate-900
                    hover:text-white
                  "
                >
                  About
                </a>


                <div
                  className="
                    border-t
                    border-slate-800
                    mt-2
                    pt-3
                    flex
                    flex-col
                    gap-2
                  "
                >

                  <Link
                    to="/login"
                    onClick={
                      closeMobileMenu
                    }
                    className="
                      px-4
                      py-3
                      rounded-xl
                      text-sm
                      text-slate-300
                      hover:bg-slate-900
                    "
                  >
                    Login
                  </Link>


                  <Link
                    to="/register"
                    onClick={
                      closeMobileMenu
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-emerald-400
                      hover:bg-emerald-300
                      text-slate-950
                      font-semibold
                      text-sm
                      px-5
                      py-3
                      rounded-xl
                    "
                  >
                    Get started
                    <ArrowRight size={16} />
                  </Link>

                </div>

              </div>

            </div>

          )}

        </div>

      </nav>

      <main className="pt-20">

        <section
          className="
            relative
            min-h-[calc(100vh-80px)]
            flex
            items-center
            overflow-hidden
          "
        >

          {/* BACKGROUND GLOW */}

          <div
            className="
              absolute
              inset-0
              pointer-events-none
            "
          >

            <div
              className="
                absolute
                top-20
                left-1/4
                w-[450px]
                h-[450px]
                bg-emerald-400/10
                blur-[130px]
                rounded-full
              "
            />


            <div
              className="
                absolute
                right-0
                top-1/3
                w-[350px]
                h-[350px]
                bg-cyan-400/5
                blur-[120px]
                rounded-full
              "
            />

          </div>


          <div
            className="
              relative
              max-w-7xl
              mx-auto
              px-5
              sm:px-6
              lg:px-8
              w-full
            "
          >

            <div
              className="
                grid
                lg:grid-cols-2
                gap-12
                lg:gap-16
                items-center
                py-16
                sm:py-20
                lg:py-24
              "
            >

              <div>

                {/* BADGE */}

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    rounded-full
                    bg-emerald-400/10
                    border
                    border-emerald-400/20
                    mb-7
                  "
                >

                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-emerald-400
                      animate-pulse
                    "
                  />

                  <span
                    className="
                      text-xs
                      sm:text-sm
                      text-emerald-400
                      font-medium
                    "
                  >
                    Smarter charging starts here
                  </span>

                </div>


                {/* HEADING */}

                <h2
                  className="
                    text-5xl
                    sm:text-6xl
                    lg:text-7xl
                    font-bold
                    tracking-tight
                    leading-[1.03]
                  "
                >

                  Charge your EV.

                  <br />

                  <span
                    className="
                      text-emerald-400
                    "
                  >
                    Your way.
                  </span>

                </h2>


                {/* DESCRIPTION */}

                <p
                  className="
                    text-base
                    sm:text-lg
                    text-slate-400
                    leading-8
                    max-w-xl
                    mt-7
                  "
                >
                  Find nearby charging stations, reserve your
                  preferred charger, manage your EV, and keep
                  track of every charging session — all from
                  one platform.
                </p>


                {/* BUTTONS */}

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                    mt-9
                  "
                >

                  <Link
                    to="/register"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      bg-emerald-400
                      hover:bg-emerald-300
                      text-slate-950
                      font-semibold
                      px-6
                      py-3.5
                      rounded-xl
                      transition
                      shadow-xl
                      shadow-emerald-400/10
                    "
                  >

                    Start charging

                    <ArrowRight
                      size={18}
                    />

                  </Link>


                  <Link
                    to="/login"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      border
                      border-slate-700
                      hover:border-slate-500
                      hover:bg-slate-900
                      text-white
                      font-medium
                      px-6
                      py-3.5
                      rounded-xl
                      transition
                    "
                  >
                    Sign in
                  </Link>

                </div>


                {/* TRUST ITEMS */}

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-x-6
                    gap-y-3
                    mt-9
                    text-xs
                    text-slate-500
                  "
                >

                  <span
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-emerald-400
                      "
                    />

                    Station discovery

                  </span>


                  <span
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-emerald-400
                      "
                    />

                    Easy booking

                  </span>


                  <span
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-emerald-400
                      "
                    />

                    Wallet management

                  </span>

                </div>

              </div>


              <div
                className="
                  relative
                "
              >

                {/* GLOW */}

                <div
                  className="
                    absolute
                    -inset-6
                    bg-emerald-400/10
                    blur-3xl
                    rounded-[3rem]
                  "
                />


                {/* IMAGE */}

                <div
                  className="
                    relative
                    h-[430px]
                    sm:h-[520px]
                    lg:h-[600px]
                    rounded-[2rem]
                    overflow-hidden
                    border
                    border-slate-800
                    shadow-2xl
                  "
                >

                  <img
                    src={evHero}
                    alt="Electric vehicle charging at a modern charging station"
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                    "
                  />


                  {/* IMAGE OVERLAY */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-slate-950
                      via-slate-950/20
                      to-transparent
                    "
                  />


                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-slate-950/30
                      via-transparent
                      to-transparent
                    "
                  />


                  {/* TOP BADGE */}

                  <div
                    className="
                      absolute
                      top-5
                      left-5
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      rounded-xl
                      bg-slate-950/75
                      backdrop-blur-md
                      border
                      border-white/10
                    "
                  >

                    <span
                      className="
                        w-2
                        h-2
                        rounded-full
                        bg-emerald-400
                        animate-pulse
                      "
                    />

                    <span
                      className="
                        text-xs
                        text-white
                        font-medium
                      "
                    >
                      EV charging network
                    </span>

                  </div>


                  {/* BOTTOM CARD */}

                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      p-5
                      sm:p-7
                    "
                  >

                    <div
                      className="
                        bg-slate-950/75
                        backdrop-blur-xl
                        border
                        border-white/10
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
                            className="
                              text-emerald-400
                            "
                          />

                        </div>


                        <div>

                          <p
                            className="
                              text-xs
                              text-slate-400
                            "
                          >
                            EV ChargeHub
                          </p>


                          <p
                            className="
                              text-sm
                              font-semibold
                              text-white
                              mt-0.5
                            "
                          >
                            Find. Reserve. Charge.
                          </p>

                        </div>

                      </div>


                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-3
                          mt-4
                        "
                      >

                        <div
                          className="
                            rounded-xl
                            bg-white/5
                            border
                            border-white/10
                            p-3
                          "
                        >

                          <p
                            className="
                              text-[11px]
                              text-slate-500
                            "
                          >
                            Discover
                          </p>


                          <p
                            className="
                              text-sm
                              font-semibold
                              text-white
                              mt-1
                            "
                          >
                            Stations
                          </p>

                        </div>


                        <div
                          className="
                            rounded-xl
                            bg-white/5
                            border
                            border-white/10
                            p-3
                          "
                        >

                          <p
                            className="
                              text-[11px]
                              text-slate-500
                            "
                          >
                            Reserve
                          </p>


                          <p
                            className="
                              text-sm
                              font-semibold
                              text-white
                              mt-1
                            "
                          >
                            Your slot
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        <section
          className="
            border-y
            border-slate-900
            bg-slate-900/30
          "
        >

          <div
            className="
              max-w-7xl
              mx-auto
              px-5
              sm:px-6
              lg:px-8
            "
          >

            <div
              className="
                grid
                grid-cols-2
                lg:grid-cols-4
                divide-x
                divide-slate-800
              "
            >

              <TrustItem
                icon={MapPin}
                title="Find"
                description="Nearby stations"
              />


              <TrustItem
                icon={CalendarDays}
                title="Reserve"
                description="Book your charger"
              />


              <TrustItem
                icon={Zap}
                title="Charge"
                description="Start your session"
              />


              <TrustItem
                icon={ShieldCheck}
                title="Manage"
                description="Track everything"
              />

            </div>

          </div>

        </section>

        <section
          id="features"
          className="
            py-24
            lg:py-28
          "
        >

          <div
            className="
              max-w-7xl
              mx-auto
              px-5
              sm:px-6
              lg:px-8
            "
          >

            <div
              className="
                max-w-2xl
              "
            >

              <p
                className="
                  text-sm
                  text-emerald-400
                  font-medium
                "
              >
                Everything in one place
              </p>


              <h2
                className="
                  text-3xl
                  sm:text-4xl
                  font-bold
                  text-white
                  mt-3
                "
              >
                Built for a simpler EV experience.
              </h2>


              <p
                className="
                  text-slate-500
                  mt-4
                  leading-7
                "
              >
                EV ChargeHub brings the most important
                parts of EV charging into one easy-to-use
                platform.
              </p>

            </div>


            {/* IMAGE + FEATURES */}

            <div
              className="
                grid
                lg:grid-cols-2
                gap-10
                lg:gap-16
                items-center
                mt-14
              "
            >

              {/* IMAGE */}

              <div
                className="
                  relative
                  h-[350px]
                  sm:h-[450px]
                  rounded-3xl
                  overflow-hidden
                  border
                  border-slate-800
                  group
                "
              >

                <img
                  src={evCharging}
                  alt="Electric vehicle charging station"
                  className="
                    w-full
                    h-full
                    object-cover
                    transition
                    duration-700
                    group-hover:scale-105
                  "
                />


                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-slate-950/80
                    via-transparent
                    to-transparent
                  "
                />


                <div
                  className="
                    absolute
                    bottom-6
                    left-6
                    right-6
                  "
                >

                  <div
                    className="
                      bg-slate-950/70
                      backdrop-blur-lg
                      border
                      border-white/10
                      rounded-2xl
                      p-5
                    "
                  >

                    <p
                      className="
                        text-xs
                        text-emerald-400
                        font-medium
                      "
                    >
                      SMART CHARGING
                    </p>


                    <p
                      className="
                        text-lg
                        sm:text-xl
                        font-semibold
                        text-white
                        mt-1
                      "
                    >
                      Your charging journey,
                      simplified.
                    </p>

                  </div>

                </div>

              </div>


              {/* FEATURES */}

              <div
                className="
                  grid
                  sm:grid-cols-2
                  gap-4
                "
              >

                <FeatureCard
                  icon={MapPin}
                  title="Find stations"
                  description="Discover charging stations and explore available charging options."
                />


                <FeatureCard
                  icon={CalendarDays}
                  title="Book a charger"
                  description="Reserve a charging slot before you arrive at the station."
                />


                <FeatureCard
                  icon={BatteryCharging}
                  title="Manage your EV"
                  description="Keep your vehicle information organized in one place."
                />


                <FeatureCard
                  icon={IndianRupee}
                  title="Manage payments"
                  description="Track your charging expenses, wallet balance and refunds."
                />

              </div>

            </div>

          </div>

        </section>

        <section
          id="how-it-works"
          className="
            py-24
            lg:py-28
            bg-slate-900/30
            border-y
            border-slate-900
          "
        >

          <div
            className="
              max-w-7xl
              mx-auto
              px-5
              sm:px-6
              lg:px-8
            "
          >

            <div
              className="
                text-center
                max-w-2xl
                mx-auto
              "
            >

              <p
                className="
                  text-sm
                  text-emerald-400
                  font-medium
                "
              >
                Simple process
              </p>


              <h2
                className="
                  text-3xl
                  sm:text-4xl
                  font-bold
                  text-white
                  mt-3
                "
              >
                Charge in three simple steps.
              </h2>


              <p
                className="
                  text-slate-500
                  mt-4
                  leading-7
                "
              >
                From finding a station to completing your
                charging session, everything stays simple.
              </p>

            </div>


            <div
              className="
                grid
                md:grid-cols-3
                gap-5
                mt-14
              "
            >

              <StepCard
                number="01"
                icon={MapPin}
                title="Find a station"
                description="Explore charging stations and choose one that works for your journey."
              />


              <StepCard
                number="02"
                icon={CalendarDays}
                title="Reserve your slot"
                description="Select your charger and reserve a convenient charging time."
              />


              <StepCard
                number="03"
                icon={Zap}
                title="Plug in & charge"
                description="Arrive at the station, connect your EV and start charging."
              />

            </div>

          </div>

        </section>

        <section
          id="about"
          className="
            py-24
            lg:py-28
          "
        >

          <div
            className="
              max-w-7xl
              mx-auto
              px-5
              sm:px-6
              lg:px-8
            "
          >

            <div
              className="
                grid
                lg:grid-cols-2
                gap-12
                lg:gap-20
                items-center
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
                  Why EV ChargeHub
                </p>


                <h2
                  className="
                    text-3xl
                    sm:text-4xl
                    font-bold
                    text-white
                    mt-3
                    leading-tight
                  "
                >
                  Everything you need before,
                  during and after charging.
                </h2>


                <p
                  className="
                    text-slate-500
                    leading-7
                    mt-5
                  "
                >
                  Keep your vehicles, reservations,
                  charging sessions, wallet and history
                  organized in one place.
                </p>


                <div
                  className="
                    space-y-4
                    mt-8
                  "
                >

                  <Benefit
                    icon={Clock3}
                    title="Save time"
                    description="Reserve your charger before reaching the station."
                  />


                  <Benefit
                    icon={ShieldCheck}
                    title="Stay organized"
                    description="Keep bookings, vehicles and charging history together."
                  />


                  <Benefit
                    icon={Leaf}
                    title="Charge smarter"
                    description="Understand your charging activity and energy usage."
                  />

                </div>

              </div>


              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-3xl
                  p-7
                  sm:p-9
                "
              >

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-emerald-400/10
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Zap
                    size={27}
                    className="
                      text-emerald-400
                    "
                  />

                </div>


                <h3
                  className="
                    text-2xl
                    font-bold
                    text-white
                    mt-7
                  "
                >
                  One platform.
                  <br />
                  Complete charging control.
                </h3>


                <p
                  className="
                    text-slate-500
                    leading-7
                    mt-4
                  "
                >
                  Find stations, reserve chargers, manage
                  your vehicle and keep track of your charging
                  journey without jumping between different
                  systems.
                </p>


                <Link
                  to="/register"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    mt-7
                    text-sm
                    font-semibold
                    text-emerald-400
                    hover:text-emerald-300
                    transition
                  "
                >

                  Create your account

                  <ArrowRight
                    size={17}
                  />

                </Link>

              </div>

            </div>

          </div>

        </section>

        <section
          className="
            pb-24
          "
        >

          <div
            className="
              max-w-5xl
              mx-auto
              px-5
              sm:px-6
              lg:px-8
            "
          >

            <div
              className="
                relative
                overflow-hidden
                bg-slate-900
                border
                border-slate-800
                rounded-3xl
                p-8
                sm:p-12
                lg:p-16
                text-center
              "
            >

              {/* GLOW */}

              <div
                className="
                  absolute
                  top-0
                  left-1/2
                  -translate-x-1/2
                  w-80
                  h-40
                  bg-emerald-400/10
                  blur-3xl
                  rounded-full
                "
              />


              <div
                className="
                  relative
                "
              >

                <div
                  className="
                    w-14
                    h-14
                    mx-auto
                    rounded-2xl
                    bg-emerald-400/10
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Zap
                    size={26}
                    className="
                      text-emerald-400
                    "
                  />

                </div>


                <h2
                  className="
                    text-3xl
                    sm:text-4xl
                    font-bold
                    text-white
                    mt-6
                  "
                >
                  Ready to charge smarter?
                </h2>


                <p
                  className="
                    text-slate-500
                    max-w-xl
                    mx-auto
                    mt-4
                    leading-7
                  "
                >
                  Create your account and start managing
                  your EV charging experience from one place.
                </p>


                <Link
                  to="/register"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    mt-8
                    bg-emerald-400
                    hover:bg-emerald-300
                    text-slate-950
                    font-semibold
                    px-6
                    py-3.5
                    rounded-xl
                    transition
                  "
                >

                  Create your account

                  <ArrowRight
                    size={18}
                  />

                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

      <footer
        className="
          border-t
          border-slate-900
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-5
            sm:px-6
            lg:px-8
          "
        >

          <div
            className="
              py-8
              flex
              flex-col
              sm:flex-row
              items-center
              justify-between
              gap-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <Zap
                size={17}
                className="
                  text-emerald-400
                "
              />


              <span
                className="
                  text-sm
                  font-medium
                  text-white
                "
              >
                EV ChargeHub
              </span>

            </div>


            <p
              className="
                text-xs
                text-slate-600
              "
            >
              Smart EV charging management platform
            </p>


            <div
              className="
                flex
                items-center
                gap-5
              "
            >

              <Link
                to="/login"
                className="
                  text-xs
                  text-slate-500
                  hover:text-white
                  transition
                "
              >
                Login
              </Link>


              <Link
                to="/register"
                className="
                  text-xs
                  text-slate-500
                  hover:text-white
                  transition
                "
              >
                Register
              </Link>

            </div>

          </div>

        </div>

      </footer>

    </div>

  );
}


function FeatureCard({
  icon: Icon,
  title,
  description,
}) {

  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        hover:border-slate-700
        hover:-translate-y-1
        transition
        duration-300
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

        <Icon
          size={20}
          className="
            text-emerald-400
          "
        />

      </div>


      <h3
        className="
          text-white
          font-semibold
          mt-5
        "
      >
        {title}
      </h3>


      <p
        className="
          text-sm
          text-slate-500
          leading-6
          mt-2
        "
      >
        {description}
      </p>

    </div>

  );
}


function StepCard({
  number,
  icon: Icon,
  title,
  description,
}) {

  return (

    <div
      className="
        relative
        bg-slate-950
        border
        border-slate-800
        rounded-2xl
        p-7
        hover:border-emerald-400/20
        transition
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
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

          <Icon
            size={20}
            className="
              text-emerald-400
            "
          />

        </div>


        <span
          className="
            text-4xl
            font-bold
            text-slate-800
          "
        >
          {number}
        </span>

      </div>


      <h3
        className="
          text-lg
          font-semibold
          text-white
          mt-7
        "
      >
        {title}
      </h3>


      <p
        className="
          text-sm
          text-slate-500
          leading-6
          mt-2
        "
      >
        {description}
      </p>

    </div>

  );
}

function TrustItem({
  icon: Icon,
  title,
  description,
}) {

  return (

    <div
      className="
        px-4
        sm:px-6
        lg:px-8
        py-6
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
          bg-emerald-400/10
          flex
          items-center
          justify-center
          shrink-0
        "
      >

        <Icon
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
          {title}
        </p>


        <p
          className="
            text-xs
            text-slate-600
            mt-0.5
          "
        >
          {description}
        </p>

      </div>

    </div>

  );
}

function Benefit({
  icon: Icon,
  title,
  description,
}) {

  return (

    <div
      className="
        flex
        items-start
        gap-4
      "
    >

      <div
        className="
          w-10
          h-10
          rounded-xl
          bg-emerald-400/10
          flex
          items-center
          justify-center
          shrink-0
        "
      >

        <Icon
          size={18}
          className="
            text-emerald-400
          "
        />

      </div>


      <div>

        <h3
          className="
            text-sm
            font-semibold
            text-white
          "
        >
          {title}
        </h3>


        <p
          className="
            text-sm
            text-slate-500
            leading-6
            mt-1
          "
        >
          {description}
        </p>

      </div>

    </div>

  );
}

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route

          element={

            <ProtectedRoute>

              <UserLayout />

            </ProtectedRoute>

          }

        >

          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* STATIONS */}

          <Route
            path="/stations"
            element={<Stations />}
          />


          {/* BOOKINGS */}

          <Route
            path="/bookings"
            element={<Bookings />}
          />


          {/* NEW BOOKING */}

          <Route
            path="/bookings/new"
            element={<BookingForm />}
          />


          {/* VEHICLES */}

          <Route
            path="/vehicles"
            element={<Vehicles />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          <Route
            path="/wallet"
            element={<Wallet />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

        <Route

          element={

            <AdminRoute>

              <AdminLayout />

            </AdminRoute>

          }

        >

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/stations"
            element={<StationManager />}
          />

          <Route
            path="/admin/bookings"
            element={<AdminBookings />}
          />

          <Route
            path="/admin/charging"
            element={<AdminCharging />}
          />

          <Route
            path="/admin/reports"
            element={<AdminReports />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettings />}
          />

          <Route
            path="/admin/chargers"
            element={<AdminChargers />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

        </Route>


      </Routes>

    </BrowserRouter>

  );

}


export default App;