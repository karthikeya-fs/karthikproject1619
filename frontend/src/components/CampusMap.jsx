import { motion } from "framer-motion";
import { FiMapPin } from "react-icons/fi";

const locations = [
  { id: "Science Block A", name: "Science Block A", x: 15, y: 20, width: 22, height: 18, type: "building" },
  { id: "Administration Building", name: "Administration Building", x: 42, y: 15, width: 16, height: 20, type: "building" },
  { id: "Engineering Block B", name: "Engineering Block B", x: 63, y: 20, width: 22, height: 18, type: "building" },
  { id: "Main Library", name: "Main Library", x: 12, y: 48, width: 20, height: 20, type: "library" },
  { id: "Central Cafeteria", name: "Central Cafeteria", x: 38, y: 45, width: 24, height: 22, type: "food" },
  { id: "Student Center", name: "Student Center", x: 68, y: 48, width: 20, height: 20, type: "building" },
  { id: "Campus Auditorium", name: "Campus Auditorium", x: 15, y: 78, width: 22, height: 18, type: "auditorium" },
  { id: "Main Lawn & Grounds", name: "Main Lawn & Grounds", x: 42, y: 75, width: 16, height: 20, type: "grounds" },
  { id: "Sports Complex", name: "Sports Complex", x: 63, y: 78, width: 22, height: 18, type: "sports" }
];

function CampusMap({ selectedLocation, onSelectLocation, buildings }) {
  const mapLocations =
    buildings?.length > 0
      ? buildings.map((b) => ({
          id: b.name,
          name: b.name,
          x: b.mapX,
          y: b.mapY,
          width: b.mapWidth,
          height: b.mapHeight,
          type: b.mapType || "building",
        }))
      : locations;
  return (
    <div className="bg-gray-50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-lg relative overflow-hidden group dark:bg-slate-900/50 dark:border-white/10 dark:shadow-2xl">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-lg group-hover:opacity-100 transition duration-500 opacity-50"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiMapPin className="text-cyan-400 text-lg animate-pulse" />
            <h4 className="font-bold text-gray-900 dark:text-white text-sm tracking-wide">Interactive Campus Map</h4>
          </div>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-semibold uppercase">
            Click to Tag
          </span>
        </div>

        {/* Dynamic Stylized Interactive SVG */}
        <div className="relative w-full aspect-[4/3] bg-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center dark:bg-slate-950/80 dark:border-white/5">
          
          {/* Map Grid / Gridlines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          {/* Pathway Networks */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <line x1="26%" y1="29%" x2="50%" y2="25%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="74%" y1="29%" x2="50%" y2="25%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="22%" y1="58%" x2="50%" y2="56%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="78%" y1="58%" x2="50%" y2="56%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="25%" x2="50%" y2="56%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="56%" x2="50%" y2="85%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="26%" y1="87%" x2="50%" y2="85%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="74%" y1="87%" x2="50%" y2="85%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Location Nodes */}
          {mapLocations.map((loc) => {
            const isSelected = selectedLocation === loc.id;
            return (
              <motion.button
                key={loc.id}
                type="button"
                onClick={() => onSelectLocation(loc.id)}
                className="absolute flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300"
                style={{
                  left: `${loc.x}%`,
                  top: `${loc.y}%`,
                  width: `${loc.width}%`,
                  height: `${loc.height}%`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Visual Representation */}
                <div
                  className={`relative w-full h-full rounded-xl border flex flex-col items-center justify-center p-1 transition-all duration-300 ${
                    isSelected
                      ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-cyan-400/60 hover:bg-cyan-50 dark:bg-slate-900/60 dark:border-white/10 dark:hover:border-cyan-500/40 dark:hover:bg-slate-900/90"
                  }`}
                >
                  {/* Outer Pulsing Glow for Selected Item */}
                  {isSelected && (
                    <span className="absolute -inset-1 rounded-xl bg-cyan-400/20 animate-ping pointer-events-none"></span>
                  )}

                  {/* Little Dot Indicator */}
                  <span
                    className={`w-2 h-2 rounded-full mb-1 transition-all duration-300 ${
                      isSelected ? "bg-cyan-400 scale-125" : "bg-gray-500"
                    }`}
                  ></span>

                  {/* Name */}
                  <span
                    className={`text-[8px] md:text-[10px] font-bold text-center leading-tight transition-colors duration-300 ${
                      isSelected ? "text-cyan-400" : "text-gray-400"
                    }`}
                  >
                    {loc.name.split(" ")[0]} {loc.name.split(" ")[1] || ""}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Status Overlay */}
        <div className="mt-4 flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs text-gray-500 transition-all duration-300 dark:bg-white/5 dark:border-white/5 dark:text-gray-400">
          <span className="font-semibold text-gray-600 dark:text-gray-300">Tagged:</span>
          {selectedLocation ? (
            <span className="text-cyan-400 font-bold flex items-center gap-1.5 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              {selectedLocation}
            </span>
          ) : (
            <span className="text-gray-500 italic">None selected. Click on map or choose from dropdown.</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CampusMap;
