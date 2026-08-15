import { useState } from "react";

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  Link,
  useNavigate
} from "react-router-dom";

import { auth, db } from "../../firebase/firebase";

import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2
} from "lucide-react";


function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");


    if (!email || !password) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {

      setLoading(true);


      // Firebase authentication
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        credential.user;


      // Get Firestore profile
      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const userSnapshot =
        await getDoc(userRef);


      if (userSnapshot.exists()) {

        const userData =
          userSnapshot.data();


        // Admin
        if (
          userData.role === "admin"
        ) {

          navigate("/admin");

        }

        // Normal user
        else {

          navigate("/dashboard");

        }

      }

      else {

        setError(
          "User profile not found. Please contact support."
        );

      }

    }

    catch (error) {

      console.error(
        "Login error:",
        error
      );


      switch (error.code) {

        case "auth/invalid-credential":

          setError(
            "Invalid email or password."
          );

          break;


        case "auth/user-not-found":

          setError(
            "No account found with this email."
          );

          break;


        case "auth/wrong-password":

          setError(
            "Incorrect password."
          );

          break;


        case "auth/invalid-email":

          setError(
            "Please enter a valid email."
          );

          break;


        default:

          setError(
            "Something went wrong. Please try again."
          );

      }

    }

    finally {

      setLoading(false);

    }

  };


  return (

    <div className="min-h-screen bg-slate-950 flex">


      {/* =====================================
          LEFT SIDE
      ====================================== */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">


        {/* Background */}

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-slate-950 to-cyan-500/10" />


        {/* Glow */}

        <div className="absolute w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -top-20 -left-20" />

        <div className="absolute w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl bottom-0 right-0" />


        <div className="relative z-10 flex flex-col justify-between p-12 w-full">


          {/* Logo */}

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-emerald-400 flex items-center justify-center">

              <Zap
                size={23}
                className="text-slate-950"
                fill="currentColor"
              />

            </div>


            <div>

              <h1 className="text-white font-bold text-xl">

                EV ChargeHub

              </h1>

              <p className="text-slate-400 text-xs">

                Smart EV Charging

              </p>

            </div>

          </div>


          {/* Main message */}

          <div className="max-w-lg">

            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-[0.2em] mb-5">

              Charge smarter

            </p>


            <h2 className="text-5xl font-bold text-white leading-tight">

              Power your journey.

              <span className="text-emerald-400">

                {" "}Charge smarter.

              </span>

            </h2>


            <p className="text-slate-400 mt-6 text-lg leading-8">

              Find nearby charging stations,
              reserve your slot and get back
              on the road with confidence.

            </p>


            <div className="flex gap-8 mt-10">


              <div>

                <p className="text-white text-2xl font-bold">

                  24/7

                </p>

                <p className="text-slate-500 text-sm">

                  Charging access

                </p>

              </div>


              <div>

                <p className="text-white text-2xl font-bold">

                  Fast

                </p>

                <p className="text-slate-500 text-sm">

                  Easy booking

                </p>

              </div>


              <div>

                <p className="text-white text-2xl font-bold">

                  Smart

                </p>

                <p className="text-slate-500 text-sm">

                  EV experience

                </p>

              </div>


            </div>

          </div>


          {/* Footer */}

          <p className="text-slate-600 text-sm">

            © 2026 EV ChargeHub

          </p>


        </div>

      </div>


      {/* =====================================
          RIGHT SIDE
      ====================================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">


        <div className="w-full max-w-md">


          {/* Mobile logo */}

          <div className="lg:hidden flex items-center gap-3 mb-10">

            <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center">

              <Zap
                size={21}
                className="text-slate-950"
                fill="currentColor"
              />

            </div>


            <div>

              <h1 className="text-white font-bold">

                EV ChargeHub

              </h1>

              <p className="text-slate-500 text-xs">

                Smart EV Charging

              </p>

            </div>

          </div>


          {/* Heading */}

          <div className="mb-8">

            <p className="text-emerald-400 text-sm font-medium mb-2">

              Welcome back

            </p>


            <h2 className="text-3xl font-bold text-white">

              Sign in to your account

            </h2>


            <p className="text-slate-500 mt-2">

              Continue your EV charging journey.

            </p>

          </div>


          {/* Error */}

          {error && (

            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">

              {error}

            </div>

          )}


          {/* Form */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >


            {/* Email */}

            <div>

              <label className="block text-sm text-slate-300 mb-2">

                Email address

              </label>


              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />


                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 placeholder:text-slate-600"
                />

              </div>

            </div>


            {/* Password */}

            <div>

              <label className="block text-sm text-slate-300 mb-2">

                Password

              </label>


              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />


                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-12 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 placeholder:text-slate-600"
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* Forgot password */}

            <div className="flex justify-end">

              <button
                type="button"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >

                Forgot password?

              </button>

            </div>


            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition"
            >

              {loading ? (

                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Signing in...

                </>

              ) : (

                <>
                  Sign in

                  <ArrowRight size={18} />

                </>

              )}

            </button>


          </form>


          {/* Register */}

          <p className="text-center text-slate-500 text-sm mt-8">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >

              Create one

            </Link>

          </p>


        </div>

      </div>

    </div>

  );
}


export default Login;