import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 20 },
  },
};

function readRegisterData() {
  try {
    const raw = localStorage.getItem("registerData");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      return toast.error("Please enter the complete 6-digit OTP");
    }

    const registerData = readRegisterData();

    if (!registerData || !registerData.email) {
      toast.error("Registration data missing. Please register again.");
      return navigate("/register");
    }

    let isOtpVerified = false;

    try {
      setLoading(true);

      console.log("Verifying OTP for:", registerData.email);

      await API.post("/auth/verify-otp", {
        email: registerData.email.trim().toLowerCase(),
        otp: enteredOTP,
      });

      isOtpVerified = true;

      console.log("OTP verified. Registering user:", registerData.email);

      await API.post("/auth/register", {
        ...registerData,
        email: registerData.email.trim().toLowerCase(),
      });

      console.log("Registration successful for:", registerData.email);

      toast.success("Email verified! Account created successfully");
      localStorage.removeItem("registerData");
      navigate("/login");

    } catch (error) {
      console.error("Verify/Register error:", error);
      const msg = error.response?.data?.message || "Something went wrong";
      if (!isOtpVerified) {
        toast.error(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    const registerData = readRegisterData();

    if (!registerData || !registerData.email) {
      toast.error("Registration data missing. Please register again.");
      return navigate("/register");
    }

    try {
      setLoading(true);

      console.log("Resending OTP for:", registerData.email);

      await API.post("/auth/send-otp", {
        email: registerData.email.trim().toLowerCase(),
      });

      toast.success("New OTP sent to your email");

      setTimer(60);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex items-center justify-center px-4 overflow-hidden relative">

      {/* Glow Effects */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl"
      ></motion.div>

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"
      ></motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 text-white"
      >

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.6, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-5"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="w-24 h-24 rounded-3xl bg-pure-white p-2 shadow-lg"
          />
        </motion.div>

        {/* Heading */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="text-4xl font-extrabold"
          >
            Verify OTP
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="text-gray-300 mt-3"
          >
            Enter the 6-digit code sent to your email
          </motion.p>

        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="mt-10">

          {/* OTP Inputs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center gap-3"
          >
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                variants={itemVariants}
                whileFocus={{ scale: 1.08, borderColor: "#22d3ee" }}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
                className="w-14 h-16 text-center text-2xl font-bold rounded-2xl bg-white/10 border border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            ))}
          </motion.div>

          {/* Verify Button */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 350, damping: 20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold py-4 rounded-2xl shadow-xl transition duration-300 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </motion.button>
        </form>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center mt-6"
        >
          {timer > 0 ? (
            <p className="text-gray-400">
              Resend OTP in{" "}
              <span className="text-cyan-400 font-bold">
                {timer}s
              </span>
            </p>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resendOTP}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Resend OTP
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default VerifyOTP;