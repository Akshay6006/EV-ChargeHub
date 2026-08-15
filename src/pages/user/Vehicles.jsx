import { useEffect, useState } from "react";

import {
  Car,
  Plus,
  BatteryCharging,
  X,
  Loader2,
  Pencil,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";


function Vehicles() {

  const { user } = useAuth();

  const [showForm, setShowForm] =
    useState(false);

  const [editingVehicle, setEditingVehicle] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [vehicles, setVehicles] =
    useState([]);

  const [fetchingVehicles, setFetchingVehicles] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    brand: "",
    model: "",
    registrationNumber: "",
    batteryCapacity: "",
    connectorType: "CCS2",
    currentBattery: "",
  });

  const fetchVehicles = async () => {

    if (!user?.uid) {
      setFetchingVehicles(false);
      return;
    }

    try {

      setFetchingVehicles(true);
      setError("");

      const vehiclesQuery = query(
        collection(db, "vehicles"),
        where("userId", "==", user.uid)
      );

      const snapshot =
        await getDocs(vehiclesQuery);

      const vehicleList =
        snapshot.docs.map(
          (vehicleDoc) => ({
            id: vehicleDoc.id,
            ...vehicleDoc.data(),
          })
        );

      setVehicles(vehicleList);

    } catch (error) {

      console.error(
        "Fetching vehicles error:",
        error
      );

      setError(
        "Unable to load your vehicles."
      );

    } finally {

      setFetchingVehicles(false);

    }

  };


  useEffect(() => {

    fetchVehicles();

  }, [user]);

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };

  const resetForm = () => {

    setForm({
      brand: "",
      model: "",
      registrationNumber: "",
      batteryCapacity: "",
      connectorType: "CCS2",
      currentBattery: "",
    });

    setEditingVehicle(null);
    setShowForm(false);
    setError("");

  };

  const handleAddVehicle = () => {

    resetForm();

    setShowForm(true);

    setSuccess("");

  };

  const handleEditVehicle = (vehicle) => {

    setEditingVehicle(vehicle);

    setForm({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      registrationNumber:
        vehicle.registrationNumber || "",
      batteryCapacity:
        vehicle.batteryCapacity ?? "",
      connectorType:
        vehicle.connectorType || "CCS2",
      currentBattery:
        vehicle.currentBattery ?? "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  const validateForm = () => {

    if (
      !form.brand.trim() ||
      !form.model.trim() ||
      !form.registrationNumber.trim() ||
      form.batteryCapacity === ""
    ) {

      setError(
        "Please fill in all required fields."
      );

      return false;

    }


    const capacity =
      Number(form.batteryCapacity);


    if (
      Number.isNaN(capacity) ||
      capacity <= 0
    ) {

      setError(
        "Battery capacity must be greater than 0."
      );

      return false;

    }


    return true;

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!user?.uid) {

      setError(
        "You must be logged in to manage vehicles."
      );

      return;

    }


    if (!validateForm()) {
      return;
    }


    try {

      setLoading(true);


      const vehicleData = {

        brand:
          form.brand.trim(),

        model:
          form.model.trim(),

        registrationNumber:
          form.registrationNumber
            .trim()
            .toUpperCase(),

        batteryCapacity:
          Number(form.batteryCapacity),

        connectorType:
          form.connectorType,

        currentBattery:
          editingVehicle
            ? Number(form.currentBattery)
            : 100,

        updatedAt:
          serverTimestamp(),

      };

      if (editingVehicle) {

        const vehicleRef =
          doc(
            db,
            "vehicles",
            editingVehicle.id
          );


        await updateDoc(
          vehicleRef,
          vehicleData
        );


        setSuccess(
          "Vehicle updated successfully."
        );

      }

      else {

        await addDoc(
          collection(
            db,
            "vehicles"
          ),
          {
            userId:
              user.uid,

            ...vehicleData,

            createdAt:
              serverTimestamp(),
          }
        );


        setSuccess(
          "Vehicle added successfully."
        );

      }


      await fetchVehicles();


      setForm({
        brand: "",
        model: "",
        registrationNumber: "",
        batteryCapacity: "",
        connectorType: "CCS2",
        currentBattery: "",
      });

      setEditingVehicle(null);
      setShowForm(false);


    } catch (error) {

      console.error(
        "Vehicle save error:",
        error
      );

      setError(
        editingVehicle
          ? "Unable to update vehicle. Please try again."
          : "Unable to add vehicle. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };

  const handleDeleteVehicle = async (vehicle) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${vehicle.brand} ${vehicle.model}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(vehicle.id);

      setError("");
      setSuccess("");


      const vehicleRef =
        doc(
          db,
          "vehicles",
          vehicle.id
        );


      await deleteDoc(
        vehicleRef
      );


      setVehicles(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== vehicle.id
          )
      );


      setSuccess(
        "Vehicle deleted successfully."
      );


    } catch (error) {

      console.error(
        "Vehicle deletion error:",
        error
      );

      setError(
        "Unable to delete vehicle. Please try again."
      );

    } finally {

      setDeletingId(null);

    }

  };


  const handleCloseForm = () => {

    resetForm();

  };

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
            Your garage
          </p>


          <h1
            className="
              text-3xl
              sm:text-4xl
              font-bold
              text-white
            "
          >
            My Vehicles
          </h1>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Manage the EVs connected to your account.
          </p>

        </div>


        {!showForm && (

          <button
            onClick={handleAddVehicle}
            className="
              w-fit
              flex
              items-center
              gap-2
              bg-emerald-400
              hover:bg-emerald-300
              text-slate-950
              font-semibold
              px-5
              py-3
              rounded-xl
              transition
            "
          >

            <Plus size={18} />

            Add vehicle

          </button>

        )}

      </div>

      {(error || success) && (

        <div
          className={`
            flex
            items-center
            gap-2
            p-4
            rounded-xl
            text-sm
            ${
              error
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400"
            }
          `}
        >

          {error ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}

          {error || success}

        </div>

      )}

      {showForm && (

        <div
          className="
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
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {editingVehicle
                  ? "Edit vehicle"
                  : "Add your EV"}
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                {editingVehicle
                  ? "Update your vehicle details."
                  : "Enter your vehicle details."}
              </p>

            </div>


            <button
              onClick={handleCloseForm}
              className="
                text-slate-500
                hover:text-white
              "
            >

              <X size={20} />

            </button>

          </div>


          <form
            onSubmit={handleSubmit}
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-5
            "
          >


            {/* BRAND */}

            <div>

              <label
                className="
                  block
                  text-sm
                  text-slate-300
                  mb-2
                "
              >
                Vehicle brand *
              </label>


              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Tata"
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

            </div>


            {/* MODEL */}

            <div>

              <label
                className="
                  block
                  text-sm
                  text-slate-300
                  mb-2
                "
              >
                Model *
              </label>


              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Nexon EV"
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

            </div>


            {/* REGISTRATION */}

            <div>

              <label
                className="
                  block
                  text-sm
                  text-slate-300
                  mb-2
                "
              >
                Registration number *
              </label>


              <input
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                placeholder="KA01AB1234"
                className="
                  w-full
                  bg-slate-950
                  border
                  border-slate-800
                  rounded-xl
                  px-4
                  py-3
                  text-white
                  uppercase
                  outline-none
                  focus:border-emerald-400
                "
              />

            </div>


            {/* BATTERY CAPACITY */}

            <div>

              <label
                className="
                  block
                  text-sm
                  text-slate-300
                  mb-2
                "
              >
                Battery capacity (kWh) *
              </label>


              <input
                name="batteryCapacity"
                type="number"
                min="1"
                step="0.1"
                value={form.batteryCapacity}
                onChange={handleChange}
                placeholder="40.5"
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

            </div>


            {/* CONNECTOR */}

            <div>

              <label
                className="
                  block
                  text-sm
                  text-slate-300
                  mb-2
                "
              >
                Connector type
              </label>


              <select
                name="connectorType"
                value={form.connectorType}
                onChange={handleChange}
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
              >

                <option value="CCS2">
                  CCS2
                </option>

                <option value="Type 2">
                  Type 2
                </option>

                <option value="CHAdeMO">
                  CHAdeMO
                </option>

                <option value="GB/T">
                  GB/T
                </option>

              </select>

            </div>

            <div
              className="
                md:col-span-2
                flex
                flex-col-reverse
                sm:flex-row
                justify-end
                gap-3
                pt-2
              "
            >

              <button
                type="button"
                onClick={handleCloseForm}
                disabled={loading}
                className="
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-slate-700
                  text-slate-300
                  hover:bg-slate-800
                  transition
                  disabled:opacity-50
                "
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-emerald-400
                  hover:bg-emerald-300
                  disabled:opacity-60
                  text-slate-950
                  font-semibold
                  px-6
                  py-3
                  rounded-xl
                  transition
                "
              >

                {loading ? (

                  <Loader2
                    size={18}
                    className="
                      animate-spin
                    "
                  />

                ) : editingVehicle ? (

                  <Save size={18} />

                ) : (

                  <Plus size={18} />

                )}


                {loading
                  ? "Saving..."
                  : editingVehicle
                    ? "Update vehicle"
                    : "Save vehicle"}

              </button>

            </div>

          </form>

        </div>

      )}

      {!showForm && (

        <div>

          {fetchingVehicles ? (

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


              <p
                className="
                  text-slate-500
                  mt-4
                "
              >
                Loading your vehicles...
              </p>

            </div>

          ) : vehicles.length === 0 ? (

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

              <div
                className="
                  w-16
                  h-16
                  mx-auto
                  rounded-2xl
                  bg-emerald-400/10
                  flex
                  items-center
                  justify-center
                "
              >

                <Car
                  size={28}
                  className="
                    text-emerald-400
                  "
                />

              </div>


              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                  mt-5
                "
              >
                No vehicles added yet
              </h2>


              <p
                className="
                  text-slate-500
                  max-w-md
                  mx-auto
                  mt-2
                  leading-6
                "
              >
                Add your EV so we can personalize
                charging recommendations and show
                compatible chargers.
              </p>


              <button
                onClick={handleAddVehicle}
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  bg-emerald-400
                  hover:bg-emerald-300
                  text-slate-950
                  font-semibold
                  px-5
                  py-3
                  rounded-xl
                  transition
                "
              >

                <Plus size={18} />

                Add your first vehicle

              </button>

            </div>

          ) : (

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-5
              "
            >

              {vehicles.map(
                (vehicle) => (

                  <div
                    key={vehicle.id}
                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-2xl
                      p-6
                      hover:border-slate-700
                      transition
                    "
                  >


                    {/* VEHICLE HEADER */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
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
                        "
                      >

                        <Car
                          size={23}
                          className="
                            text-emerald-400
                          "
                        />

                      </div>


                      <span
                        className="
                          px-3
                          py-1
                          rounded-full
                          bg-emerald-400/10
                          text-emerald-400
                          text-xs
                          font-medium
                        "
                      >
                        {vehicle.connectorType}
                      </span>

                    </div>


                    {/* VEHICLE NAME */}

                    <div className="mt-5">

                      <p
                        className="
                          text-xs
                          text-slate-500
                          uppercase
                          tracking-wider
                        "
                      >
                        {vehicle.brand}
                      </p>


                      <h2
                        className="
                          text-xl
                          font-bold
                          text-white
                          mt-1
                        "
                      >
                        {vehicle.model}
                      </h2>

                    </div>


                    {/* REGISTRATION */}

                    <div
                      className="
                        mt-5
                        p-3
                        rounded-xl
                        bg-slate-950
                        border
                        border-slate-800
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-slate-600
                        "
                      >
                        Registration
                      </p>


                      <p
                        className="
                          text-sm
                          text-slate-300
                          font-medium
                          mt-1
                        "
                      >
                        {vehicle.registrationNumber}
                      </p>

                    </div>


                    {/* BATTERY */}

                    <div className="mt-5">

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <BatteryCharging
                            size={17}
                            className="
                              text-emerald-400
                            "
                          />

                          <span
                            className="
                              text-sm
                              text-slate-400
                            "
                          >
                            Battery
                          </span>

                        </div>


                        <span
                          className="
                            text-sm
                            font-semibold
                            text-white
                          "
                        >
                          {vehicle.currentBattery}%
                        </span>

                      </div>


                      <div
                        className="
                          h-2
                          bg-slate-800
                          rounded-full
                          mt-3
                          overflow-hidden
                        "
                      >

                        <div
                          className="
                            h-full
                            bg-emerald-400
                            rounded-full
                          "
                          style={{
                            width:
                              `${Math.min(
                                Math.max(
                                  Number(
                                    vehicle.currentBattery
                                  ) || 0,
                                  0
                                ),
                                100
                              )}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* DETAILS */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-3
                        mt-5
                      "
                    >

                      <div
                        className="
                          p-3
                          rounded-xl
                          bg-slate-950
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-600
                          "
                        >
                          Battery
                        </p>


                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-1
                          "
                        >
                          {vehicle.batteryCapacity} kWh
                        </p>

                      </div>


                      <div
                        className="
                          p-3
                          rounded-xl
                          bg-slate-950
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-slate-600
                          "
                        >
                          Connector
                        </p>


                        <p
                          className="
                            text-sm
                            text-white
                            font-medium
                            mt-1
                          "
                        >
                          {vehicle.connectorType}
                        </p>

                      </div>

                    </div>


                    {/* ACTION BUTTONS */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-3
                        mt-5
                      "
                    >

                      <button
                        onClick={() =>
                          handleEditVehicle(
                            vehicle
                          )
                        }
                        disabled={
                          deletingId ===
                          vehicle.id
                        }
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-xl
                          border
                          border-slate-700
                          text-slate-300
                          hover:bg-slate-800
                          hover:text-white
                          transition
                          disabled:opacity-50
                        "
                      >

                        <Pencil size={16} />

                        Edit

                      </button>


                      <button
                        onClick={() =>
                          handleDeleteVehicle(
                            vehicle
                          )
                        }
                        disabled={
                          deletingId ===
                          vehicle.id
                        }
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-xl
                          border
                          border-red-500/20
                          text-red-400
                          hover:bg-red-500/10
                          transition
                          disabled:opacity-50
                        "
                      >

                        {deletingId ===
                        vehicle.id ? (

                          <Loader2
                            size={16}
                            className="
                              animate-spin
                            "
                          />

                        ) : (

                          <Trash2 size={16} />

                        )}

                        Delete

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      )}

    </div>

  );

}


export default Vehicles;