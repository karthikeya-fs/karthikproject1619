import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormLayout from "../components/FormLayout";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus } from "react-icons/fi";

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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

function Login() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log("[Login] Sending login request for:", formData.email);

      const res = await API.post("/auth/login", {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });

      console.log("[Login] Login response received, storing token");

      login(res.data.token, res.data.user);

      toast.success("Login Successful");
    } catch (error) {
      console.error("[Login] Login failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout
      title="Welcome back"
      subtitle="Sign in with your email"
      icon={<FiLogIn />}
    >
      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="form-stack"
      >
        <motion.div variants={itemVariants} className="form-field">
          <label htmlFor="email">Email</label>
          <div className="form-input-wrap">
            <FiMail className="form-input-icon" aria-hidden />
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="form-field">
          <label htmlFor="password">Password</label>
          <div className="form-input-wrap">
            <FiLock className="form-input-icon" aria-hidden />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input form-input-has-toggle"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="form-input-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="form-actions-end">
          <motion.div
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
          >
            <Link to="/forgot-password" className="form-link">
              Forgot password?
            </Link>
          </motion.div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          className="form-btn-primary"
        >
          {loading ? "Signing in..." : "Sign in"}
          <motion.span
            animate={loading ? { rotate: 360 } : {}}
            transition={loading ? { repeat: Infinity, duration: 1.2, ease: "linear" } : {}}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <FiLogIn aria-hidden />
          </motion.span>
        </motion.button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 350, damping: 25 }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
      >
        <Link to="/register" className="form-btn-secondary form-external-actions">
          <FiUserPlus aria-hidden />
          Create account
        </Link>
      </motion.div>
    </FormLayout>
  );
}

export default Login;
