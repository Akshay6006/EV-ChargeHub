import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  reload,
  sendEmailVerification
} from "firebase/auth";

import {
  useNavigate
} from "react-router-dom";

import {
  CheckCircle2,
  Mail,
  RefreshCw,
  ArrowRight,
  Zap,
  Loader2
} from "lucide-react";

import { auth } from "../../firebase/firebase";


function VerifyEmail() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          if (!currentUser) {

            navigate("/login", {
              replace: true
            });

            return;
          }

          await reload(currentUser);


          if (currentUser.emailVerified) {

            navigate("/dashboard", {
              replace: true
            });

            return;
          }


          setUser(currentUser);
          setLoading(false);

        }
      );


    return () => unsubscribe();

  }, [navigate]);

  const checkVerification = async () => {

    if (!auth.currentUser) {
      return;
    }


    try {

      setChecking(true);
      setError("");
      setMessage("");


      await reload(auth.currentUser);


      if (auth.currentUser.emailVerified) {

        setMessage(
          "Email verified successfully! Redirecting..."
        );


        setTimeout(() => {

          navigate("/dashboard", {
            replace: true
          });

        }, 1000);


      } else {

        setError(
          "Your email is not verified yet. Please check your inbox and click the verification link."
        );

      }

    } catch (error) {

      console.error(
        "Verification check error:",
        error
      );

      setError(
        "Unable to check verification status. Please try again."
      );

    } finally {

      setChecking(false);

    }

  };

  const resendVerification = async () => {

    if (!auth.currentUser) {
      return;
    }


    try {

      setResending(true);
      setError("");
      setMessage("");


      await sendEmailVerification(
        auth.currentUser
      );


      setMessage(
        "A new verification email has been sent. Please check your inbox."
      );

    } catch (error) {

      console.error(
        "Resend verification error:",
        error
      );


      if (
        error.code ===
        "auth/too-many-requests"
      ) {

        setError(
          "Too many requests. Please wait a little before requesting another email."
        );

      } else {

        setError(
          "Unable to send verification email. Please try again."
        );

      }

    } finally {

      setResending(false);

    }

  };

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center">

        <Loader2
          size={30}
          className="text-emerald-400 animate-spin"
        />

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">


      {/* Background glow */}

      <div className="absolute w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -top-32 -left-32" />

      <div className="absolute w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -bottom-32 -right-32" />


      <div className="relative z-10 w-full max-w-md">


        {/* Logo */}

        <div className="flex justify-center mb-8">

          <div className="w-14 h-14 rounded-2xl bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/20">

            <Zap
              size={27}
              className="text-slate-950"
              fill="currentColor"
            />

          </div>

        </div>


        {/* Card */}

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">


          {/* Icon */}

          <div className="flex justify-center mb-6">

            <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">

              <Mail
                size={30}
                className="text-emerald-400"
              />

            </div>

          </div>


          {/* Heading */}

          <div className="text-center">

            <p className="text-emerald-400 text-sm font-medium mb-2">
              Almost there
            </p>


            <h1 className="text-2xl font-bold text-white">
              Verify your email
            </h1>


            <p className="text-slate-500 mt-3 leading-6">
              We've sent a verification link to:
            </p>


            <p className="text-white font-medium mt-2 break-all">
              {user?.email}
            </p>

          </div>


          {/* Information */}

          <div className="mt-7 p-4 rounded-2xl bg-slate-950 border border-slate-800">

            <div className="flex gap-3">

              <CheckCircle2
                size={20}
                className="text-emerald-400 shrink-0 mt-0.5"
              />

              <div>

                <p className="text-sm text-slate-300 font-medium">
                  Check your inbox
                </p>

                <p className="text-xs text-slate-500 mt-1 leading-5">
                  Open the email from Firebase and
                  click the verification link. Then
                  return here and click "I've verified my email".
                </p>

              </div>

            </div>

          </div>


          {/* Error */}

          {error && (

            <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-5">

              {error}

            </div>

          )}


          {/* Success */}

          {message && (

            <div className="mt-5 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm leading-5">

              {message}

            </div>

          )}


          {/* Check button */}

          <button
            type="button"
            onClick={checkVerification}
            disabled={checking}
            className="w-full mt-6 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition"
          >

            {checking ? (

              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Checking...

              </>

            ) : (

              <>
                I've verified my email

                <ArrowRight size={18} />

              </>

            )}

          </button>


          {/* Resend */}

          <button
            type="button"
            onClick={resendVerification}
            disabled={resending}
            className="w-full mt-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white disabled:opacity-50 rounded-xl py-3 flex items-center justify-center gap-2 transition"
          >

            <RefreshCw
              size={17}
              className={
                resending
                  ? "animate-spin"
                  : ""
              }
            />

            {resending
              ? "Sending..."
              : "Resend verification email"}

          </button>


          {/* Footer */}

          <p className="text-center text-slate-600 text-xs mt-6 leading-5">

            Didn't receive it? Check your
            <span className="text-slate-400">
              {" "}spam or promotions folder.
            </span>

          </p>


        </div>


        {/* Brand */}

        <p className="text-center text-slate-700 text-xs mt-6">

          EV ChargeHub · Smart EV Charging

        </p>


      </div>

    </div>

  );
}


export default VerifyEmail;