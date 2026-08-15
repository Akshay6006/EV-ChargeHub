import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  Link,
  useNavigate
} from "react-router-dom";

import { auth, db } from "../../firebase/firebase";

import {
  Zap,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
  X
} from "lucide-react";


function Register() {

  const navigate = useNavigate();

  // ==========================================
  // FORM STATE
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ==========================================
  // PASSWORD RULES
  // ==========================================

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };


  const strongPassword =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;


  // ==========================================
  // NAME VALIDATION
  // ==========================================

  const validateName = () => {

    const cleanName = name.trim();

    if (!cleanName) {
      return "Please enter your full name.";
    }

    if (cleanName.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (cleanName.length > 50) {
      return "Name cannot exceed 50 characters.";
    }

    if (!/^[A-Za-z ]+$/.test(cleanName)) {
      return "Name can contain only letters and spaces.";
    }

    return null;
  };


  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  const validateEmail = () => {

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      return "Please enter your email address.";
    }

    // Proper email format
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(cleanEmail)) {
      return "Please enter a valid email address.";
    }

    return null;
  };


  // ==========================================
  // PHONE VALIDATION
  // ==========================================

  const validatePhone = () => {

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      return "Please enter your mobile number.";
    }

    // Exactly 10 digits and starts with 6-9
    const phoneRegex =
      /^[6-9][0-9]{9}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    return null;
  };


  // ==========================================
  // PASSWORD VALIDATION
  // ==========================================

  const validatePassword = () => {

    if (!password) {
      return "Please create a password.";
    }

    if (!strongPassword) {
      return "Password does not meet the required security rules.";
    }

    return null;
  };


  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");


    // Validate everything
    const nameError = validateName();

    if (nameError) {
      setError(nameError);
      return;
    }


    const emailError = validateEmail();

    if (emailError) {
      setError(emailError);
      return;
    }


    const phoneError = validatePhone();

    if (phoneError) {
      setError(phoneError);
      return;
    }


    const passwordError = validatePassword();

    if (passwordError) {
      setError(passwordError);
      return;
    }


    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }


    try {

      setLoading(true);


      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();


      // ==========================================
      // CREATE FIREBASE ACCOUNT
      // ==========================================

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );


      const user = credential.user;

      // ==========================================
      // UPDATE FIREBASE DISPLAY NAME
      // ==========================================

      await updateProfile(user, {
        displayName: cleanName
      });


      // ==========================================
      // CREATE FIRESTORE USER PROFILE
      // ==========================================

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: "user",

          // Future EV features
          vehicleId: null,
          profileImage: null,

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );
    // Send email verification
await sendEmailVerification(user);

      console.log(
        "Registration successful:",
        user.uid
      );


      // ==========================================
      // REDIRECT
      // ==========================================

      navigate("/verify-email");

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );


      switch (error.code) {

        case "auth/email-already-in-use":

          setError(
            "An account already exists with this email."
          );

          break;


        case "auth/invalid-email":

          setError(
            "Please enter a valid email address."
          );

          break;


        case "auth/weak-password":

          setError(
            "Your password is too weak."
          );

          break;


        case "auth/network-request-failed":

          setError(
            "Network error. Please check your internet connection."
          );

          break;


        default:

          setError(
            "Registration failed. Please try again."
          );

      }

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // PASSWORD RULE COMPONENT
  // ==========================================

  const PasswordRule = ({ valid, children }) => (

    <div
      className={`flex items-center gap-2 text-xs ${
        valid
          ? "text-emerald-400"
          : "text-slate-500"
      }`}
    >

      {valid ? (
        <Check size={14} />
      ) : (
        <X size={14} />
      )}

      <span>{children}</span>

    </div>

  );


  return (

    <div className="min-h-screen bg-slate-950 flex">


      {/* =====================================
          LEFT SIDE
      ====================================== */}

      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-slate-950 to-cyan-500/10" />

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


          {/* Main content */}

          <div className="max-w-lg">

            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-[0.2em] mb-5">
              Join the network
            </p>


            <h2 className="text-5xl font-bold text-white leading-tight">

              Your next charge
              <span className="text-emerald-400">
                {" "}starts here.
              </span>

            </h2>


            <p className="text-slate-400 mt-6 text-lg leading-8">

              Create your account to discover
              charging stations, reserve slots,
              track your sessions and manage
              your EV journey.

            </p>


            <div className="grid grid-cols-2 gap-4 mt-10">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                <p className="text-emerald-400 font-semibold">
                  Smart
                </p>

                <p className="text-slate-500 text-sm mt-1">
                  Station discovery
                </p>

              </div>


              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                <p className="text-emerald-400 font-semibold">
                  Simple
                </p>

                <p className="text-slate-500 text-sm mt-1">
                  Slot booking
                </p>

              </div>

            </div>

          </div>


          <p className="text-slate-600 text-sm">
            © 2026 EV ChargeHub
          </p>

        </div>

      </div>


      {/* =====================================
          RIGHT SIDE
      ====================================== */}

      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 py-10 overflow-y-auto">


        <div className="w-full max-w-lg">


          {/* Mobile logo */}

          <div className="lg:hidden flex items-center gap-3 mb-8">

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

          <div className="mb-7">

            <p className="text-emerald-400 text-sm font-medium mb-2">
              Get started
            </p>

            <h2 className="text-3xl font-bold text-white">
              Create your account
            </h2>

            <p className="text-slate-500 mt-2">
              Join EV ChargeHub and start charging smarter.
            </p>

          </div>


          {/* Error */}

          {error && (

            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>

          )}


          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >


            {/* NAME */}

            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Full name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  maxLength={50}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 placeholder:text-slate-600"
                />

              </div>

            </div>


            {/* EMAIL */}

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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 placeholder:text-slate-600"
                />

              </div>

            </div>


            {/* PHONE */}

            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Mobile number
              </label>

              <div className="relative">

                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />


                <div className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  +91
                </div>


                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    const value =
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                    setPhone(value);
                  }}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 pl-20 pr-4 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 placeholder:text-slate-600"
                />

              </div>

              <p className="text-xs text-slate-600 mt-1.5">
                Enter a valid 10-digit Indian mobile number.
              </p>

            </div>


            {/* PASSWORD */}

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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-12 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>


              {/* Password requirements */}

              {password && (

                <div className="mt-3 grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">

                  <PasswordRule valid={passwordRules.length}>
                    At least 8 characters
                  </PasswordRule>

                  <PasswordRule valid={passwordRules.uppercase}>
                    One uppercase letter
                  </PasswordRule>

                  <PasswordRule valid={passwordRules.lowercase}>
                    One lowercase letter
                  </PasswordRule>

                  <PasswordRule valid={passwordRules.number}>
                    One number
                  </PasswordRule>

                  <PasswordRule valid={passwordRules.special}>
                    One special character
                  </PasswordRule>

                </div>

              )}

            </div>


            {/* CONFIRM PASSWORD */}

            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Confirm password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-12 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >

                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>


              {confirmPassword && (

                <p
                  className={`text-xs mt-2 ${
                    password === confirmPassword
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >

                  {password === confirmPassword
                    ? "Passwords match."
                    : "Passwords do not match."}

                </p>

              )}

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3.5 mt-2 flex items-center justify-center gap-2 transition"
            >

              {loading ? (

                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Creating account...

                </>

              ) : (

                <>
                  Create account

                  <ArrowRight size={18} />

                </>

              )}

            </button>


          </form>


          {/* LOGIN LINK */}

          <p className="text-center text-slate-500 text-sm mt-7">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Sign in
            </Link>

          </p>


        </div>

      </div>

    </div>

  );
}


export default Register;