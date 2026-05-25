import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import API from "../services/api";
import FormLayout from "../components/FormLayout";

import {
  FiUser,
  FiMail,
  FiLock,
  FiBook,
  FiUserPlus,
} from "react-icons/fi";

const DEPARTMENTS = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "IT", label: "Information Technology (IT)" },
  { value: "ECE", label: "Electronics & Communication (ECE)" },
  { value: "EEE", label: "Electrical & Electronics (EEE)" },
  { value: "MECH", label: "Mechanical Engineering" },
  { value: "CIVIL", label: "Civil Engineering" },
  { value: "CHEM", label: "Chemical Engineering" },
  { value: "AERO", label: "Aerospace / Aeronautical Engineering" },
  { value: "BIOTECH", label: "Biotechnology" },
  { value: "AIML", label: "AI & Machine Learning / Data Science" },
  { value: "ARCH", label: "Architecture" },
  { value: "MBA", label: "MBA / Management" },
  { value: "MCA", label: "MCA (Computer Applications)" },
  { value: "PHARM", label: "Pharmacy" },
  { value: "LAW", label: "Law" },
  { value: "SCIENCE", label: "Science" },
  { value: "HUMANITIES", label: "Arts & Humanities" },
  { value: "OTHER", label: "Other" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 22,
    },
  },
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      };

      console.log("Sending OTP request for:", payload.email);

      await API.post("/auth/send-otp", {
        email: payload.email,
      });

      toast.success("OTP sent to your email!");

      localStorage.setItem("registerData", JSON.stringify(payload));
      navigate("/verify-otp");

    } catch (error) {
      console.error("Registration error:", error);

      let message = error.response?.data?.message;

      if (!message && error.request && !error.response) {
        message = "Cannot reach the server. Start the backend and try again.";
      }

      if (error.response?.status === 502) {
        message = "Backend unreachable (502). The server may be restarting — please wait a moment and try again.";
      }

      toast.error(message || error.message || "Registration failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout
      title="Create Account"
      subtitle="Join the Campus Lost & Found Network"
      icon={<FiUserPlus />}
    >
      <motion.form
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >

        {/* Name */}
        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Full Name
          </label>

          <div className="relative">
            <FiUser className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400" />

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:bg-slate-900/70 dark:border-white/10 dark:text-white transition"
            />
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Email
          </label>

          <div className="relative">
            <FiMail className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400" />

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:bg-slate-900/70 dark:border-white/10 dark:text-white transition"
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Password
          </label>

          <div className="relative">
            <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400" />

            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full bg-white border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:bg-slate-900/70 dark:border-white/10 dark:text-white transition"
            />
          </div>
        </motion.div>

        {/* Department */}
        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Department
          </label>

          <div className="relative">
            <FiBook className="absolute top-1/2 left-4 -translate-y-1/2 text-cyan-400 z-10" />

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full appearance-none bg-white border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:bg-slate-900/70 dark:border-white/10 dark:text-white transition"
            >
              <option value="">
                Select Department
              </option>

              {DEPARTMENTS.map((dept) => (
                <option
                  key={dept.value}
                  value={dept.value}
                >
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-3 rounded-2xl font-semibold text-white shadow-lg shadow-cyan-500/20 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending OTP...
            </>
          ) : (
            <>
              <FiUserPlus />
              Continue with OTP
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-400 mt-6"
      >
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-cyan-400 hover:text-cyan-300 font-medium transition"
        >
          Sign In
        </Link>
      </motion.p>
    </FormLayout>
  );
}

export default Register;