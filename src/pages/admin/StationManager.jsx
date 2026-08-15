import { useState } from "react";

import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  Plus,
  MapPin,
  Zap,
  X,
  Loader2,
  Trash2
} from "lucide-react";

import { db } from "../../firebase/firebase";


function StationManager() {

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // ==========================================
  // STATION FORM
  // ==========================================

  const [form, setForm] = useState({

    name: "",
    operator: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    rating: "",
    openingHours: "24/7",
    amenities: ""

  });


  // ==========================================
  // CHARGER FORM
  // ==========================================

  const [chargerForm, setChargerForm] = useState({

    connectorType: "CCS2",
    power: "",
    pricePerKwh: "",
    status: "available"

  });


  // ==========================================
  // CHARGERS
  // ==========================================

  const [chargers, setChargers] = useState([]);


  // ==========================================
  // HANDLE STATION INPUT
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  // ==========================================
  // HANDLE CHARGER INPUT
  // ==========================================

  const handleChargerChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setChargerForm((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  // ==========================================
  // ADD CHARGER
  // ==========================================

  const addCharger = () => {

    setError("");

    const power =
      Number(chargerForm.power);

    const price =
      Number(chargerForm.pricePerKwh);


    if (!power || power <= 0) {

      setError(
        "Enter a valid charging power."
      );

      return;
    }


    if (!price || price <= 0) {

      setError(
        "Enter a valid price per kWh."
      );

      return;
    }


    const newCharger = {

      id:
        crypto.randomUUID(),

      connectorType:
        chargerForm.connectorType,

      power,

      pricePerKwh:
        price,

      status:
        chargerForm.status

    };


    setChargers((previous) => [

      ...previous,

      newCharger

    ]);


    setChargerForm({

      connectorType: "CCS2",
      power: "",
      pricePerKwh: "",
      status: "available"

    });

  };


  // ==========================================
  // REMOVE CHARGER
  // ==========================================

  const removeCharger = (chargerId) => {

    setChargers((previous) =>
      previous.filter(
        (charger) =>
          charger.id !== chargerId
      )
    );

  };


  // ==========================================
  // CREATE STATION
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    // ========================================
    // REQUIRED STATION FIELDS
    // ========================================

    if (
      !form.name.trim() ||
      !form.operator.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.latitude ||
      !form.longitude
    ) {

      setError(
        "Please fill in all required station fields."
      );

      return;
    }


    // ========================================
    // AT LEAST ONE CHARGER
    // ========================================

    if (chargers.length === 0) {

      setError(
        "Add at least one charger before creating the station."
      );

      return;
    }


    const latitude =
      Number(form.latitude);

    const longitude =
      Number(form.longitude);


    if (
      Number.isNaN(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {

      setError(
        "Latitude must be between -90 and 90."
      );

      return;
    }


    if (
      Number.isNaN(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {

      setError(
        "Longitude must be between -180 and 180."
      );

      return;
    }


    try {

      setLoading(true);


      // ========================================
      // REMOVE TEMPORARY CHARGER IDS
      // ========================================

      const finalChargers =
        chargers.map(
          ({
            id,
            ...charger
          }) => charger
        );


      // ========================================
      // CREATE STATION
      // ========================================

      await addDoc(
        collection(db, "stations"),
        {

          name:
            form.name.trim(),

          operator:
            form.operator.trim(),

          address:
            form.address.trim(),

          city:
            form.city.trim(),

          latitude,

          longitude,

          rating:
            form.rating
              ? Number(form.rating)
              : 0,

          openingHours:
            form.openingHours.trim()
              || "24/7",

          amenities:
            form.amenities
              .split(",")
              .map(
                (item) =>
                  item.trim()
              )
              .filter(Boolean),

          chargers:
            finalChargers,

          status:
            "active",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        }
      );


      setSuccess(
        "Charging station created successfully."
      );


      // ========================================
      // RESET
      // ========================================

      setForm({

        name: "",
        operator: "",
        address: "",
        city: "",
        latitude: "",
        longitude: "",
        rating: "",
        openingHours: "24/7",
        amenities: ""

      });


      setChargers([]);


      setShowForm(false);


    } catch (error) {

      console.error(
        "Station creation error:",
        error
      );

      setError(
        "Unable to create station. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // CALCULATED COUNTS
  // ==========================================

  const availableCount =
    chargers.filter(
      (charger) =>
        charger.status === "available"
    ).length;


  const occupiedCount =
    chargers.filter(
      (charger) =>
        charger.status === "occupied"
    ).length;


  const maintenanceCount =
    chargers.filter(
      (charger) =>
        charger.status === "maintenance"
    ).length;


  return (

    <div className="max-w-7xl mx-auto space-y-8">


      {/* ======================================
          HEADER
      ======================================= */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

        <div>

          <p className="text-sm text-emerald-400 font-medium mb-2">
            Administration
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Charging Stations
          </h1>

          <p className="text-slate-500 mt-2">
            Add and manage charging locations.
          </p>

        </div>


        <button
          onClick={() => {

            setShowForm(true);
            setError("");
            setSuccess("");

          }}
          className="w-full sm:w-fit flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold px-5 py-3 rounded-xl transition"
        >

          <Plus size={18} />

          Add station

        </button>

      </div>


      {/* ======================================
          SUCCESS
      ======================================= */}

      {success && (

        <div className="p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm">

          {success}

        </div>

      )}


      {/* ======================================
          FORM
      ======================================= */}

      {showForm && (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">


          {/* ==================================
              FORM HEADER
          =================================== */}

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-xl font-semibold text-white">
                Add charging station
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Add the station and its actual charging points.
              </p>

            </div>


            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-500 hover:text-white"
            >

              <X size={20} />

            </button>

          </div>


          {/* ==================================
              ERROR
          =================================== */}

          {error && (

            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">

              {error}

            </div>

          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-10"
          >


            {/* ==================================
                STATION DETAILS
            =================================== */}

            <div>

              <div className="flex items-center gap-2 mb-5">

                <MapPin
                  size={18}
                  className="text-emerald-400"
                />

                <h3 className="font-semibold text-white">
                  Station details
                </h3>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* Name */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Station name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tata Power Koramangala"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>


                {/* Operator */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Operator *
                  </label>

                  <input
                    name="operator"
                    value={form.operator}
                    onChange={handleChange}
                    placeholder="Tata Power"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>


                {/* Address */}

                <div className="md:col-span-2">

                  <label className="block text-sm text-slate-300 mb-2">
                    Address *
                  </label>

                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="80 Feet Road, Koramangala"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>


                {/* City */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    City *
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Bengaluru"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>


                {/* Rating */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Rating
                  </label>

                  <input
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="4.5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>


                {/* Latitude */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Latitude *
                  </label>

                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="12.9352"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>


                {/* Longitude */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Longitude *
                  </label>

                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="77.6245"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>


                {/* Opening hours */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Opening hours
                  </label>

                  <input
                    name="openingHours"
                    value={form.openingHours}
                    onChange={handleChange}
                    placeholder="24/7"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>


                {/* Amenities */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Amenities
                  </label>

                  <input
                    name="amenities"
                    value={form.amenities}
                    onChange={handleChange}
                    placeholder="Cafe, Parking, WiFi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                  />

                </div>

              </div>

            </div>


            {/* ==================================
                CHARGER SECTION
            =================================== */}

            <div>

              <div className="flex items-center gap-2 mb-2">

                <Zap
                  size={18}
                  className="text-emerald-400"
                />

                <h3 className="font-semibold text-white">
                  Charging points
                </h3>

              </div>

              <p className="text-sm text-slate-500 mb-5">
                Add each physical charger at this station.
                Availability will be calculated automatically.
              </p>


              {/* ==================================
                  ADD CHARGER FORM
              =================================== */}

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


                  {/* Connector */}

                  <div>

                    <label className="block text-sm text-slate-300 mb-2">
                      Connector
                    </label>

                    <select
                      name="connectorType"
                      value={
                        chargerForm.connectorType
                      }
                      onChange={
                        handleChargerChange
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
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


                  {/* Power */}

                  <div>

                    <label className="block text-sm text-slate-300 mb-2">
                      Power (kW)
                    </label>

                    <input
                      name="power"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        chargerForm.power
                      }
                      onChange={
                        handleChargerChange
                      }
                      placeholder="60"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                    />

                  </div>


                  {/* Price */}

                  <div>

                    <label className="block text-sm text-slate-300 mb-2">
                      Price / kWh
                    </label>

                    <input
                      name="pricePerKwh"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={
                        chargerForm.pricePerKwh
                      }
                      onChange={
                        handleChargerChange
                      }
                      placeholder="18"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                    />

                  </div>


                  {/* Status */}

                  <div>

                    <label className="block text-sm text-slate-300 mb-2">
                      Initial status
                    </label>

                    <select
                      name="status"
                      value={
                        chargerForm.status
                      }
                      onChange={
                        handleChargerChange
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400"
                    >

                      <option value="available">
                        Available
                      </option>

                      <option value="maintenance">
                        Maintenance
                      </option>

                    </select>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={addCharger}
                  className="mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-3 rounded-xl transition"
                >

                  <Plus size={17} />

                  Add charging point

                </button>

              </div>


              {/* ==================================
                  CHARGER LIST
              =================================== */}

              {chargers.length > 0 && (

                <div className="mt-5 space-y-3">

                  {chargers.map(
                    (charger, index) => (

                      <div
                        key={charger.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4"
                      >

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">


                          <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0">

                            <Zap
                              size={18}
                              className="text-emerald-400"
                            />

                          </div>


                          <div className="flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <span className="text-white font-medium">
                                Charger {index + 1}
                              </span>

                              <span className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-400">
                                {charger.connectorType}
                              </span>

                              <span
                                className={`
                                  px-2 py-1 rounded-md text-xs
                                  ${
                                    charger.status === "available"
                                      ? "bg-emerald-400/10 text-emerald-400"
                                      : "bg-amber-400/10 text-amber-400"
                                  }
                                `}
                              >
                                {charger.status}
                              </span>

                            </div>


                            <p className="text-sm text-slate-500 mt-1">

                              {charger.power} kW
                              {" • "}
                              ₹{charger.pricePerKwh}/kWh

                            </p>

                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              removeCharger(
                                charger.id
                              )
                            }
                            className="self-start sm:self-center p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          >

                            <Trash2 size={17} />

                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}


              {/* ==================================
                  AVAILABILITY SUMMARY
              =================================== */}

              {chargers.length > 0 && (

                <div className="grid grid-cols-3 gap-3 mt-5">

                  <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-4">

                    <p className="text-xs text-slate-500">
                      Available
                    </p>

                    <p className="text-xl font-bold text-emerald-400 mt-1">
                      {availableCount}
                    </p>

                  </div>


                  <div className="bg-red-400/5 border border-red-400/10 rounded-xl p-4">

                    <p className="text-xs text-slate-500">
                      Occupied
                    </p>

                    <p className="text-xl font-bold text-red-400 mt-1">
                      {occupiedCount}
                    </p>

                  </div>


                  <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-4">

                    <p className="text-xs text-slate-500">
                      Maintenance
                    </p>

                    <p className="text-xl font-bold text-amber-400 mt-1">
                      {maintenanceCount}
                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* ==================================
                SUBMIT
            =================================== */}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition"
              >

                Cancel

              </button>


              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 text-slate-950 font-semibold px-6 py-3 rounded-xl transition"
              >

                {loading && (

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                )}

                {loading
                  ? "Creating..."
                  : "Create station"}

              </button>

            </div>

          </form>

        </div>

      )}


      {/* ======================================
          EMPTY STATE
      ======================================= */}

      {!showForm && (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-400/10 flex items-center justify-center">

            <MapPin
              size={28}
              className="text-emerald-400"
            />

          </div>


          <h2 className="text-xl font-semibold text-white mt-5">
            Station management
          </h2>


          <p className="text-slate-500 max-w-lg mx-auto mt-2 leading-6">
            Add charging stations and configure their
            individual charging points.
          </p>


          <button
            onClick={() =>
              setShowForm(true)
            }
            className="mt-6 inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold px-5 py-3 rounded-xl transition"
          >

            <Plus size={18} />

            Add charging station

          </button>

        </div>

      )}

    </div>

  );

}


export default StationManager;