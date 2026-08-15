import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import {
  Bell,
  CheckCircle2,
  Loader2,
  Save,
  Settings as SettingsIcon,
  Wrench,
  Zap,
} from "lucide-react";

import { db } from "../../firebase/firebase";


function AdminSettings() {

  const [settings, setSettings] = useState({
    chargingRate: 12,
    minBookingMinutes: 30,
    maxBookingMinutes: 240,
    allowBookings: true,
    maintenanceMode: false,
    bookingNotifications: true,
    chargingNotifications: true,
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD SETTINGS
  // ==========================================

  useEffect(() => {

    const loadSettings =
      async () => {

        try {

          const settingsRef =
            doc(
              db,
              "settings",
              "platform"
            );

          const snapshot =
            await getDoc(
              settingsRef
            );


          if (
            snapshot.exists()
          ) {

            setSettings(
              (previous) => ({
                ...previous,
                ...snapshot.data(),
              })
            );

          }

        } catch (error) {

          console.error(
            "Unable to load settings:",
            error
          );

          setError(
            "Unable to load settings."
          );

        } finally {

          setLoading(false);

        }

      };


    loadSettings();

  }, []);


  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const updateSetting = (
    key,
    value
  ) => {

    setSettings(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );

    setSaved(false);

  };


  // ==========================================
  // SAVE
  // ==========================================

  const handleSave =
    async () => {

      setSaving(true);

      setSaved(false);

      setError("");


      try {

        await setDoc(

          doc(
            db,
            "settings",
            "platform"
          ),

          {
            chargingRate:
              Number(
                settings.chargingRate
              ),

            minBookingMinutes:
              Number(
                settings.minBookingMinutes
              ),

            maxBookingMinutes:
              Number(
                settings.maxBookingMinutes
              ),

            allowBookings:
              Boolean(
                settings.allowBookings
              ),

            maintenanceMode:
              Boolean(
                settings.maintenanceMode
              ),

            bookingNotifications:
              Boolean(
                settings.bookingNotifications
              ),

            chargingNotifications:
              Boolean(
                settings.chargingNotifications
              ),

            updatedAt:
              new Date(),
          },

          {
            merge: true,
          }

        );


        setSaved(true);

        setTimeout(
          () => {
            setSaved(false);
          },
          3000
        );

      } catch (error) {

        console.error(
          "Unable to save settings:",
          error
        );

        setError(
          "Unable to save settings."
        );

      } finally {

        setSaving(false);

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
              text-slate-500
              mt-4
            "
          >
            Loading settings...
          </p>

        </div>

      </div>

    );

  }


  return (

    <div
      className="
        max-w-5xl
        mx-auto
        space-y-7
      "
    >

      {/* HEADER */}

      <div>

        <div
          className="
            flex
            items-center
            gap-2
            text-emerald-400
            text-sm
            font-medium
          "
        >

          <SettingsIcon
            size={16}
          />

          Platform Settings

        </div>


        <h1
          className="
            text-3xl
            sm:text-4xl
            font-bold
            text-white
            mt-2
          "
        >
          Settings
        </h1>


        <p
          className="
            text-slate-500
            mt-2
          "
        >
          Manage charging and platform behaviour.
        </p>

      </div>


      {/* ERROR */}

      {error && (

        <div
          className="
            bg-red-500/10
            border
            border-red-500/20
            text-red-400
            rounded-xl
            px-4
            py-3
            text-sm
          "
        >
          {error}
        </div>

      )}


      {/* CHARGING */}

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
            "
          >

            <Zap
              size={20}
              className="
                text-emerald-400
              "
            />

          </div>


          <div>

            <h2
              className="
                text-lg
                font-semibold
                text-white
              "
            >
              Charging Settings
            </h2>

            <p
              className="
                text-xs
                text-slate-600
                mt-1
              "
            >
              Configure charging prices and booking limits.
            </p>

          </div>

        </div>


        <div
          className="
            p-5
            sm:p-6
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-5
          "
        >

          <SettingInput
            label="Charging Rate"
            suffix="₹ / kWh"
            type="number"
            value={
              settings.chargingRate
            }
            onChange={(value) =>
              updateSetting(
                "chargingRate",
                value
              )
            }
          />


          <SettingInput
            label="Minimum Booking"
            suffix="minutes"
            type="number"
            value={
              settings.minBookingMinutes
            }
            onChange={(value) =>
              updateSetting(
                "minBookingMinutes",
                value
              )
            }
          />


          <SettingInput
            label="Maximum Booking"
            suffix="minutes"
            type="number"
            value={
              settings.maxBookingMinutes
            }
            onChange={(value) =>
              updateSetting(
                "maxBookingMinutes",
                value
              )
            }
          />

        </div>

      </section>


      {/* PLATFORM */}

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
            Platform Controls
          </h2>

        </div>


        <div
          className="
            divide-y
            divide-slate-800
          "
        >

          <ToggleRow
            icon={Zap}
            title="Allow New Bookings"
            description="Users can create new charging bookings."
            checked={
              settings.allowBookings
            }
            onChange={(value) =>
              updateSetting(
                "allowBookings",
                value
              )
            }
          />


          <ToggleRow
            icon={Wrench}
            title="Maintenance Mode"
            description="Indicate that the charging platform is under maintenance."
            checked={
              settings.maintenanceMode
            }
            onChange={(value) =>
              updateSetting(
                "maintenanceMode",
                value
              )
            }
          />

        </div>

      </section>


      {/* NOTIFICATIONS */}

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
            gap-3
          "
        >

          <Bell
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
              Notifications
            </h2>

          </div>

        </div>


        <div
          className="
            divide-y
            divide-slate-800
          "
        >

          <ToggleRow
            icon={Bell}
            title="Booking Notifications"
            description="Enable booking-related notifications."
            checked={
              settings.bookingNotifications
            }
            onChange={(value) =>
              updateSetting(
                "bookingNotifications",
                value
              )
            }
          />


          <ToggleRow
            icon={Bell}
            title="Charging Notifications"
            description="Enable charging session notifications."
            checked={
              settings.chargingNotifications
            }
            onChange={(value) =>
              updateSetting(
                "chargingNotifications",
                value
              )
            }
          />

        </div>

      </section>


      {/* SAVE */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-end
          gap-4
        "
      >

        {saved && (

          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-emerald-400
            "
          >

            <CheckCircle2
              size={17}
            />

            Settings saved successfully.

          </div>

        )}


        <button
          onClick={
            handleSave
          }
          disabled={
            saving
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            px-5
            py-3
            rounded-xl
            bg-emerald-400
            text-slate-950
            font-semibold
            text-sm
            hover:bg-emerald-300
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >

          {saving ? (

            <Loader2
              size={17}
              className="
                animate-spin
              "
            />

          ) : (

            <Save
              size={17}
            />

          )}

          {saving
            ? "Saving..."
            : "Save Settings"}

        </button>

      </div>

    </div>

  );

}


// ==========================================
// INPUT
// ==========================================

function SettingInput({
  label,
  suffix,
  type,
  value,
  onChange,
}) {

  return (

    <div>

      <label
        className="
          block
          text-xs
          text-slate-500
          mb-2
        "
      >
        {label}
      </label>


      <div className="relative">

        <input
          type={type}
          min="0"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="
            w-full
            bg-slate-950
            border
            border-slate-800
            rounded-xl
            px-4
            py-3
            pr-20
            text-white
            outline-none
            focus:border-emerald-400/50
          "
        />


        <span
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-xs
            text-slate-600
          "
        >
          {suffix}
        </span>

      </div>

    </div>

  );

}


// ==========================================
// TOGGLE
// ==========================================

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {

  return (

    <div
      className="
        p-5
        sm:p-6
        flex
        items-center
        justify-between
        gap-5
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
          min-w-0
        "
      >

        <div
          className="
            w-9
            h-9
            rounded-lg
            bg-slate-950
            flex
            items-center
            justify-center
            shrink-0
          "
        >

          <Icon
            size={17}
            className="
              text-slate-500
            "
          />

        </div>


        <div>

          <p
            className="
              text-sm
              font-medium
              text-white
            "
          >
            {title}
          </p>


          <p
            className="
              text-xs
              text-slate-600
              mt-1
            "
          >
            {description}
          </p>

        </div>

      </div>


      <button
        type="button"
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`
          relative
          w-11
          h-6
          rounded-full
          shrink-0
          transition
          ${
            checked
              ? "bg-emerald-400"
              : "bg-slate-700"
          }
        `}
      >

        <span
          className={`
            absolute
            top-1
            w-4
            h-4
            rounded-full
            bg-white
            transition
            ${
              checked
                ? "left-6"
                : "left-1"
            }
          `}
        />

      </button>

    </div>

  );

}


export default AdminSettings;