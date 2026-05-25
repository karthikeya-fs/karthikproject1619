import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import FormLayout from "../components/FormLayout";
import CampusMap from "../components/CampusMap";
import { useCampusMetadata } from "../hooks/useCampusMetadata";
import {
  FiImage,
  FiType,
  FiAlignLeft,
  FiTag,
  FiMapPin,
  FiCalendar,
  FiPhone,
  FiDollarSign,
  FiAlertTriangle,
  FiCpu,
  FiCreditCard,
  FiEyeOff,
  FiBox,
} from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
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

function ReportLostItem() {
  const navigate = useNavigate();
  const { categories, buildings, buildingNames } = useCampusMetadata();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    reward: "",
    contact: "",
    image: null,
    blurImage: false,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files?.[0];
      if (!file) return;
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleCategorySelect = (cat) => {
    setFormData((prev) => ({
      ...prev,
      category: cat.id,
      blurImage: cat.blurByDefault ? true : prev.blurImage,
    }));
  };

  const handleLocationSelect = (locId) => {
    setFormData((prev) => ({ ...prev, location: locId }));
  };

  const handleToggleBlur = () => {
    setFormData((prev) => ({ ...prev, blurImage: !prev.blurImage }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      alert("Please select a category.");
      return;
    }
    if (!formData.location) {
      alert("Please tag a campus location.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("location", formData.location);
      data.append("date", formData.date);
      data.append("reward", formData.reward);
      data.append("contact", formData.contact);
      data.append("blurImage", formData.blurImage);
      if (formData.image instanceof File) {
        data.append("image", formData.image);
      }

      const res = await API.post("/items/report-lost", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message || "Lost Item Reported Successfully ✅");
      navigate("/lost-reports");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout
      maxWidth="lg"
      backTo="/home"
      backLabel="Back to home"
      title="Report Lost Item"
      subtitle="Submit detailed specifications so the campus community can help spot and return your belonging."
      icon={<FiAlertTriangle />}
    >
      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="form-stack text-left"
      >
        {/* Upload Section */}
        <motion.div variants={itemVariants} className="form-field">
          <span className="form-label-static" id="report-photo-label">
            Item Photo (optional)
          </span>
          <motion.label
            whileHover={{ scale: 1.01, borderColor: "var(--text)" }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="form-upload"
            htmlFor="report-lost-photo"
            aria-labelledby="report-photo-label"
          >
            {preview ? (
              <>
                <img src={preview} alt="" className="form-upload-preview" />
                <span className="form-upload-overlay">
                  <FiImage aria-hidden /> Change photo
                </span>
              </>
            ) : (
              <span className="form-upload-placeholder">
                <FiImage aria-hidden />
                <p>Choose or drop a photo</p>
                <p className="form-upload-hint">PNG, JPG up to 5MB</p>
              </span>
            )}
            <input
              id="report-lost-photo"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="form-upload-input"
            />
          </motion.label>
        </motion.div>

        {/* Privacy Blur Toggle */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-100 border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4 dark:bg-slate-900/40 dark:border-white/10"
        >
          <div className="flex-1">
            <h4 className="text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2 mb-1">
              <FiEyeOff className="text-amber-400" />
              Privacy Image Blurring
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              If enabled, this image will remain blurred in public search until someone submits a verified proof of ownership. Highly recommended for sensitive documents, keycards, or wallets.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleBlur}
            className={`w-14 h-7 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
              formData.blurImage ? "bg-amber-500" : "bg-gray-600"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${
                formData.blurImage ? "translate-x-7" : "translate-x-0"
              }`}
            ></div>
          </button>
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants} className="form-field">
          <label htmlFor="title">Item Title</label>
          <div className="form-input-wrap">
            <FiType className="form-input-icon" aria-hidden />
            <input
              id="title"
              type="text"
              name="title"
              placeholder="e.g. AirPods Pro, keys, ID badge"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="form-field">
          <label htmlFor="description">Detailed Description</label>
          <div className="form-input-wrap">
            <FiAlignLeft className="form-input-icon form-textarea-icon" aria-hidden />
            <textarea
              id="description"
              name="description"
              placeholder="Color, brand, key marks, protective case description, stickers..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              className="form-input"
            />
          </div>
        </motion.div>

        {/* Category Choice Grid */}
        <motion.div variants={itemVariants} className="form-field">
          <label>Select Category</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1.5">
            {categories.map((cat) => {
              const isSelected = formData.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`category-btn flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 gap-2 ${
                    isSelected
                      ? "category-btn--active bg-teal-50 border-teal-500 text-teal-800 shadow-[0_0_15px_rgba(29,158,117,0.12)] dark:bg-amber-500/10 dark:border-amber-400 dark:text-amber-400 dark:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 dark:bg-slate-900/40 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white"
                  }`}
                >
                  <span className="text-xl">
                    <cat.Icon />
                  </span>
                  <span className="text-xs font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Reward & Contact Info */}
        <div className="form-grid-2">
          <motion.div variants={itemVariants} className="form-field">
            <label htmlFor="reward">Offering Reward (optional)</label>
            <div className="form-input-wrap">
              <FiDollarSign className="form-input-icon" aria-hidden />
              <input
                id="reward"
                type="text"
                name="reward"
                placeholder="e.g. ₹500, a coffee treat"
                value={formData.reward}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="form-field">
            <label htmlFor="contact">Contact Information</label>
            <div className="form-input-wrap">
              <FiPhone className="form-input-icon" aria-hidden />
              <input
                id="contact"
                type="text"
                name="contact"
                placeholder="Phone or alternate email"
                value={formData.contact}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </motion.div>
        </div>

        {/* Location Dropdown Selection & Interactive Map */}
        <motion.div variants={itemVariants} className="form-field">
          <label htmlFor="location">Where was it last seen?</label>
          <div className="form-input-wrap mb-4">
            <FiMapPin className="form-input-icon" aria-hidden />
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="" disabled>Select campus building or grounds...</option>
              {buildingNames.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <CampusMap
            selectedLocation={formData.location}
            onSelectLocation={handleLocationSelect}
            buildings={buildings}
          />
        </motion.div>

        {/* Precision Date & Time Picker */}
        <div className="form-grid-1">
          <motion.div variants={itemVariants} className="form-field">
            <label htmlFor="date">Approximate Date & Time Lost</label>
            <div className="form-input-wrap">
              <FiCalendar className="form-input-icon" aria-hidden />
              <input
                id="date"
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </motion.div>
        </div>

        {/* Submit */}
        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          className="form-btn-primary mt-4"
        >
          {loading ? "Submitting lost report..." : "Submit Lost Report"}
          <motion.span
            animate={loading ? { rotate: 360 } : {}}
            transition={loading ? { repeat: Infinity, duration: 1.2, ease: "linear" } : {}}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <FiAlertTriangle aria-hidden />
          </motion.span>
        </motion.button>
      </motion.form>
    </FormLayout>
  );
}

export default ReportLostItem;
