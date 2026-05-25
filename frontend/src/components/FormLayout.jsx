import { useId } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function FormLayout({ title, subtitle, icon, maxWidth = "sm", backTo, backLabel = "Back", children }) {
  const titleId = useId();
  const widthClass =
    maxWidth === "lg"
      ? "max-w-3xl"
      : maxWidth === "md"
        ? "max-w-2xl"
        : "max-w-md";

  return (
    <div
      className="form-page"
      role="region"
      {...(title ? { "aria-labelledby": titleId } : { "aria-label": "Form" })}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.65,
          ease: [0.16, 1, 0.3, 1], // Custom ultra-smooth easeOutExpo
        }}
        className={`form-card ${widthClass}`}
      >
        {backTo && (
          <div className="form-back">
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-block"
            >
              <Link to={backTo} className="form-back-link">
                {backLabel}
              </Link>
            </motion.div>
          </div>
        )}
        {(icon || title) && (
          <div className="form-header">
            {icon && (
              <motion.div
                initial={{ scale: 0.7, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 15, delay: 0.1 }}
                className="form-icon-badge"
              >
                {icon}
              </motion.div>
            )}
            {title && (
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                id={titleId}
                className="form-title"
              >
                {title}
              </motion.h1>
            )}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="form-subtitle"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default FormLayout;
