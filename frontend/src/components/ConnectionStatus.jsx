import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { checkHealth } from "../services/api";

const POLL_INTERVAL = 15000;

function ConnectionStatus() {
  const [alive, setAlive] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let prevAlive = true;

    const poll = async () => {
      const result = await checkHealth();
      if (!mounted) return;
      setAlive(result.alive);

      // Show label briefly on state change
      if (result.alive !== prevAlive) {
        prevAlive = result.alive;
        setShowLabel(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setShowLabel(false), 4000);
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(interval);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 group cursor-default" title={alive ? "Backend connected" : "Backend unreachable"}>
      <span className="relative flex w-2 h-2">
        {alive ? (
          <>
            <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
          </>
        ) : (
          <span className="relative inline-flex w-2 h-2 rounded-full bg-red-400" />
        )}
      </span>
      <AnimatePresence>
        {showLabel && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] font-medium tracking-wide uppercase"
            style={{ color: alive ? "var(--text-muted)" : "#f87171" }}
          >
            {alive ? "Connected" : "Offline"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConnectionStatus;
