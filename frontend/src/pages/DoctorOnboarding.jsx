import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";

const DoctorOnboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "doctor") {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      navigate("/doctor/profile", {
        state: { message: "Please complete your profile" },
        replace: true,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <FullScreenLoader text="Hang on a sec..." />;
};

export default DoctorOnboarding;
