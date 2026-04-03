import React, { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const profileInputRef = useRef(null);
  const clinicInputRef = useRef(null);

  const [profileFile, setProfileFile] = useState(null);
  const [clinicFile, setClinicFile] = useState(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState("");
  const [clinicPreviewUrl, setClinicPreviewUrl] = useState("");

  const [profileImgLoaded, setProfileImgLoaded] = useState(false);
  const [clinicImgLoaded, setClinicImgLoaded] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const bannerMessage = useMemo(() => location.state?.message || "", [location.state]);
  const token = localStorage.getItem("token");

  const DEFAULT_IMAGE_URL =
    "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_incoming&w=740&q=80";

  const profileSrc = useMemo(() => {
    if (profilePreviewUrl) return profilePreviewUrl;
    const raw = typeof doctor?.profilePic === "string" ? doctor.profilePic.trim() : "";
    return raw ? raw : DEFAULT_IMAGE_URL;
  }, [profilePreviewUrl, doctor]);

  const clinicSrc = useMemo(() => {
    if (clinicPreviewUrl) return clinicPreviewUrl;
    const raw = typeof doctor?.clinicPic === "string" ? doctor.clinicPic.trim() : "";
    return raw ? raw : DEFAULT_IMAGE_URL;
  }, [clinicPreviewUrl, doctor]);

  useEffect(() => {
    setProfileImgLoaded(false);
  }, [profileSrc]);

  useEffect(() => {
    setClinicImgLoaded(false);
  }, [clinicSrc]);

  // Fetch doctor data from backend
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!token || localStorage.getItem("role") !== "doctor") {
          navigate("/login");
          return;
        }

        const res = await api.get("/api/doctors/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const incoming = res.data?.doctor || res.data || {};
        setDoctor({
          ...incoming,
          address:
            incoming.address && typeof incoming.address === "object"
              ? incoming.address
              : { line1: "", line2: "" },
          availability: Array.isArray(incoming.availability) ? incoming.availability : [],
        });
      } catch (error) {
        console.error("Error fetching doctor:", error);
        // token might be invalid
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    };
    fetchDoctor();
  }, [navigate, token]);

  // Temporary debugging
  useEffect(() => {
    console.log("Doctor data:", doctor);
  }, [doctor]);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (field, value) => {
    setDoctor(prev => ({
      ...prev,
      address: { ...(prev.address || { line1: "", line2: "" }), [field]: value }
    }))
  }

  const handleAvailabilityChange = (idx, field, value) => {
    const updated = doctor.availability.map((slot, i) =>
      i === idx ? { ...slot, [field]: value } : slot
    );
    setDoctor({ ...doctor, availability: updated });
  };

  const handleAddAvailability = () => {
    setDoctor({
      ...doctor,
      availability: [
        ...doctor.availability,
        { day: "", startTime: "", endTime: "" },
      ],
    });
  };

  const handleRemoveAvailability = (idx) => {
    setDoctor({
      ...doctor,
      availability: doctor.availability.filter((_, i) => i !== idx),
    });
  };

  const validate = () => {
    const nextErrors = {};

    const required = (value) => Boolean(String(value || "").trim());

    if (!required(doctor?.name)) nextErrors.name = "Name is required";
    if (!required(doctor?.speciality)) nextErrors.speciality = "Specialization is required";
    if (!required(doctor?.experience)) nextErrors.experience = "Experience is required";
    if (!(Number(doctor?.fees) > 0)) nextErrors.fees = "Fees must be greater than 0";
    if (!required(doctor?.address?.line1)) nextErrors.address = "Clinic address is required";
    if (!required(doctor?.about)) nextErrors.about = "About is required";

    const availability = Array.isArray(doctor?.availability) ? doctor.availability : [];
    const availabilityOk = availability.length > 0 && availability.every(s =>
      required(s.day) && required(s.startTime) && required(s.endTime)
    );
    if (!availabilityOk) nextErrors.availability = "At least one availability slot is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const form = new FormData();

      // Text fields
      form.append("name", doctor.name || "");
      form.append("speciality", doctor.speciality || "");
      form.append("degree", doctor.degree || "");
      form.append("experience", doctor.experience || "");
      form.append("about", doctor.about || "");
      form.append("fees", String(doctor.fees ?? ""));
      form.append("available", String(doctor.available ?? true));
      form.append("address", JSON.stringify(doctor.address || { line1: "", line2: "" }));
      form.append("availability", JSON.stringify(Array.isArray(doctor.availability) ? doctor.availability : []));

      // Optional files (only sent when newly chosen)
      if (profileFile) form.append("profilePic", profileFile);
      if (clinicFile) form.append("clinicPic", clinicFile);

      const res = await api.put("/api/doctors/me", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDoctor(res.data);
      setEditing(false);
      setProfileFile(null);
      setClinicFile(null);
      setProfilePreviewUrl("");
      setClinicPreviewUrl("");
      alert("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error?.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false);
    }
  };

  const handlePickProfile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    const url = URL.createObjectURL(file);
    setProfilePreviewUrl(url);
  };

  const handlePickClinic = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setClinicFile(file);
    const url = URL.createObjectURL(file);
    setClinicPreviewUrl(url);
  };

  // Prevent memory leaks from object URLs
  useEffect(() => {
    return () => {
      if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
      if (clinicPreviewUrl) URL.revokeObjectURL(clinicPreviewUrl);
    };
  }, [profilePreviewUrl, clinicPreviewUrl]);

  if (!doctor) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow">
      {bannerMessage ? (
        <div className="p-4 border-b bg-blue-50 text-blue-700">
          {bannerMessage}
        </div>
      ) : null}

      {/* Banner and Profile Photo */}
      <div className="relative">
        <div
          className={editing ? "relative group cursor-pointer" : "relative"}
          onClick={editing ? () => clinicInputRef.current?.click() : undefined}
        >
          <img
            src={clinicSrc}
            alt="Clinic"
            onLoad={() => setClinicImgLoaded(true)}
            onError={() => setClinicImgLoaded(true)}
            className={`w-full h-48 object-cover rounded-t transition-opacity duration-300 ${clinicImgLoaded ? "opacity-100" : "opacity-0"}`}
          />

          {editing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-white text-sm font-medium">Change Image</span>
            </div>
          ) : null}

          <input
            ref={clinicInputRef}
            type="file"
            accept="image/*"
            onChange={handlePickClinic}
            className="hidden"
            disabled={!editing}
          />
        </div>

        <div className="absolute left-6 -bottom-12 flex flex-col items-start">
          <div className="relative">
            <div
              className={editing ? "relative group cursor-pointer" : "relative"}
              onClick={editing ? () => profileInputRef.current?.click() : undefined}
            >
              <img
                src={profileSrc}
                alt="Profile"
                onLoad={() => setProfileImgLoaded(true)}
                onError={() => setProfileImgLoaded(true)}
                className={`w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg transition-opacity duration-300 ${profileImgLoaded ? "opacity-100" : "opacity-0"}`}
              />

              {editing ? (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-xs font-medium">Change Image</span>
                </div>
              ) : null}

              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePickProfile}
                className="hidden"
                disabled={!editing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="pt-16 pl-6 pr-6 pb-6">
        <h2 className="text-2xl font-semibold mb-2">{doctor.name}</h2>
        <form className="space-y-4 text-left">
          <div>
            <label className="block text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={doctor.name}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              />
            ) : (
              <p>{doctor.name}</p>
            )}
            {errors.name ? <p className="text-red-500 text-xs mt-1">{errors.name}</p> : null}
          </div>

          <div>
            <label className="block text-gray-700">Email:</label>
            <p>{doctor.email}</p>
          </div>
          <div>
            <label className="block text-gray-700">
              Specialization <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <input
                type="text"
                name="speciality"
                value={doctor.speciality}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              />
            ) : (
              <p>{doctor.speciality}</p>
            )}
            {errors.speciality ? <p className="text-red-500 text-xs mt-1">{errors.speciality}</p> : null}
          </div>
          <div>
            <label className="block text-gray-700">Degree:</label>
            {editing ? (
              <input
                type="text"
                name="degree"
                value={doctor.degree}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              />
            ) : (
              <p>{doctor.degree}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">
              Experience <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <input
                type="text"
                name="experience"
                value={doctor.experience}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              />
            ) : (
              <p>{doctor.experience}</p>
            )}
            {errors.experience ? <p className="text-red-500 text-xs mt-1">{errors.experience}</p> : null}
          </div>
          <div>
            <label className="block text-gray-700">
              Fees <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <input
                type="number"
                name="fees"
                value={doctor.fees}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              />
            ) : (
              <p>{doctor.fees}</p>
            )}
            {errors.fees ? <p className="text-red-500 text-xs mt-1">{errors.fees}</p> : null}
          </div>
          <div>
            <label className="block text-gray-700">
              Clinic Address <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={doctor.address?.line1 || ""}
                  onChange={(e) => handleAddressChange("line1", e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                  placeholder="Address line 1"
                />
                <input
                  type="text"
                  value={doctor.address?.line2 || ""}
                  onChange={(e) => handleAddressChange("line2", e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                  placeholder="Address line 2"
                />
              </div>
            ) : (
              <p>
                {doctor.address?.line1 || ""}
                {doctor.address?.line2 ? <><br />{doctor.address.line2}</> : null}
              </p>
            )}
            {errors.address ? <p className="text-red-500 text-xs mt-1">{errors.address}</p> : null}
          </div>

          <div>
            <label className="block text-gray-700">
              About <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <textarea
                name="about"
                value={doctor.about || ""}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
                rows={4}
              />
            ) : (
              <p>{doctor.about}</p>
            )}
            {errors.about ? <p className="text-red-500 text-xs mt-1">{errors.about}</p> : null}
          </div>
          <div>
            <label className="block text-gray-700">Rating:</label>
            <p>{doctor.rating}</p>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              Availability <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <div className="space-y-2">
                {doctor.availability.map((slot, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Day"
                      value={slot.day}
                      onChange={(e) =>
                        handleAvailabilityChange(idx, "day", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-1/3"
                    />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          idx,
                          "startTime",
                          e.target.value
                        )
                      }
                      className="border px-2 py-1 rounded w-1/4"
                    />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        handleAvailabilityChange(idx, "endTime", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-1/4"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAvailability(idx)}
                      className="text-red-500 px-2"
                    >
                      ✗
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddAvailability}
                  className="bg-indigo-100 px-3 py-1 rounded mt-2"
                >
                  Add Slot
                </button>
                {errors.availability ? <p className="text-red-500 text-xs mt-1">{errors.availability}</p> : null}
              </div>
            ) : (
              <ul className="list-disc ml-6">
                {doctor.availability.map((slot, idx) => (
                  <li key={idx}>
                    {slot.day}: {slot.startTime} - {slot.endTime}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
        <div className="mt-6 flex justify-start">
          {editing ? (
            <button
              type="button"
              className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              type="button"
              className="bg-primary text-white px-4 py-2 rounded"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
