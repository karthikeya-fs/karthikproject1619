import { useEffect, useState } from "react";
import API from "../services/api";
import {
  FiCpu,
  FiCreditCard,
  FiTag,
  FiBox,
} from "react-icons/fi";

const ICON_MAP = {
  cpu: FiCpu,
  "credit-card": FiCreditCard,
  tag: FiTag,
  box: FiBox,
};

export const FALLBACK_CATEGORIES = [
  { name: "Electronics", label: "Electronics", iconKey: "cpu", blurByDefault: false },
  { name: "IDs", label: "IDs / Documents", iconKey: "credit-card", blurByDefault: true },
  { name: "Clothing", label: "Clothing", iconKey: "tag", blurByDefault: false },
  { name: "Other", label: "Other / Misc", iconKey: "box", blurByDefault: false },
];

export const FALLBACK_BUILDINGS = [
  { name: "Science Block A", mapX: 15, mapY: 20, mapWidth: 22, mapHeight: 18, mapType: "building" },
  { name: "Administration Building", mapX: 42, mapY: 15, mapWidth: 16, mapHeight: 20, mapType: "building" },
  { name: "Engineering Block B", mapX: 63, mapY: 20, mapWidth: 22, mapHeight: 18, mapType: "building" },
  { name: "Main Library", mapX: 12, mapY: 48, mapWidth: 20, mapHeight: 20, mapType: "library" },
  { name: "Central Cafeteria", mapX: 38, mapY: 45, mapWidth: 24, mapHeight: 22, mapType: "food" },
  { name: "Student Center", mapX: 68, mapY: 48, mapWidth: 20, mapHeight: 20, mapType: "building" },
  { name: "Campus Auditorium", mapX: 15, mapY: 78, mapWidth: 22, mapHeight: 18, mapType: "auditorium" },
  { name: "Main Lawn & Grounds", mapX: 42, mapY: 75, mapWidth: 16, mapHeight: 20, mapType: "grounds" },
  { name: "Sports Complex", mapX: 63, mapY: 78, mapWidth: 22, mapHeight: 18, mapType: "sports" },
];

export function categoryToOption(cat) {
  const Icon = ICON_MAP[cat.iconKey] || FiBox;
  return {
    id: cat.name,
    label: cat.label,
    Icon,
    blurByDefault: !!cat.blurByDefault,
  };
}

export function useCampusMetadata() {
  const [categories, setCategories] = useState(
    FALLBACK_CATEGORIES.map(categoryToOption)
  );
  const [buildings, setBuildings] = useState(FALLBACK_BUILDINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [catRes, buildingRes] = await Promise.all([
          API.get("/metadata/categories"),
          API.get("/metadata/buildings"),
        ]);

        if (cancelled) return;

        if (Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data.map(categoryToOption));
        }
        if (Array.isArray(buildingRes.data) && buildingRes.data.length > 0) {
          setBuildings(buildingRes.data);
        }
      } catch {
        /* keep fallbacks */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildingNames = buildings.map((b) => b.name);

  return { categories, buildings, buildingNames, loading };
}
