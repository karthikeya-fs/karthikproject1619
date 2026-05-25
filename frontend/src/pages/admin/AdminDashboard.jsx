import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiPackage,
  FiAlertCircle,
  FiTrash2,
  FiRefreshCw,
  FiShield,
  FiMapPin,
  FiTag,
} from "react-icons/fi";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "moderation", label: "Moderation" },
  { id: "users", label: "Users" },
  { id: "categories", label: "Categories" },
  { id: "buildings", label: "Buildings" },
];

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <span className="text-cyan-400">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCategory, setNewCategory] = useState({ name: "", label: "" });
  const [newBuilding, setNewBuilding] = useState({ name: "" });

  const loadOverview = async () => {
    const res = await API.get("/admin/dashboard");
    setDashboard(res.data);
  };

  const loadUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  };

  const loadModeration = async () => {
    const [itemsRes, claimsRes] = await Promise.all([
      API.get("/admin/items"),
      API.get("/admin/claims"),
    ]);
    setItems(itemsRes.data);
    setClaims(claimsRes.data);
  };

  const loadMetadata = async () => {
    const [catRes, buildingRes] = await Promise.all([
      API.get("/metadata/categories"),
      API.get("/metadata/buildings"),
    ]);
    setCategories(catRes.data);
    setBuildings(buildingRes.data);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview") await loadOverview();
      if (tab === "users") await loadUsers();
      if (tab === "moderation") await loadModeration();
      if (tab === "categories" || tab === "buildings") await loadMetadata();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleBan = async (userId) => {
    const reason = window.prompt("Ban reason (optional):") || "Policy violation";
    try {
      await API.patch(`/admin/users/${userId}/ban`, { reason });
      toast.success("User banned");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Ban failed");
    }
  };

  const handleUnban = async (userId) => {
    try {
      await API.patch(`/admin/users/${userId}/unban`);
      toast.success("User unbanned");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unban failed");
    }
  };

  const handleRemoveItem = async (itemId) => {
    const reason = window.prompt("Removal reason (optional):") || "Inappropriate content";
    if (!window.confirm("Remove this post from public view?")) return;
    try {
      await API.delete(`/admin/items/${itemId}`, { data: { reason } });
      toast.success("Item removed");
      loadModeration();
    } catch (err) {
      toast.error(err.response?.data?.message || "Remove failed");
    }
  };

  const handleRestoreItem = async (itemId) => {
    try {
      await API.patch(`/admin/items/${itemId}/restore`);
      toast.success("Item restored");
      loadModeration();
    } catch (err) {
      toast.error(err.response?.data?.message || "Restore failed");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post("/metadata/categories", {
        name: newCategory.name,
        label: newCategory.label || newCategory.name,
      });
      setNewCategory({ name: "", label: "" });
      toast.success("Category added");
      loadMetadata();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  const handleDeactivateCategory = async (id) => {
    if (!window.confirm("Deactivate this category?")) return;
    try {
      await API.delete(`/metadata/categories/${id}`);
      toast.success("Category deactivated");
      loadMetadata();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleAddBuilding = async (e) => {
    e.preventDefault();
    try {
      await API.post("/metadata/buildings", { name: newBuilding.name });
      setNewBuilding({ name: "" });
      toast.success("Building added");
      loadMetadata();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add building");
    }
  };

  const handleDeactivateBuilding = async (id) => {
    if (!window.confirm("Deactivate this building?")) return;
    try {
      await API.delete(`/metadata/buildings/${id}`);
      toast.success("Building deactivated");
      loadMetadata();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const totals = dashboard?.totals;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-28 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiShield className="text-cyan-400" />
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Monitor activity, moderate content, and manage campus metadata.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-gray-400 text-center py-12">Loading admin data…</p>
        )}

        {!loading && tab === "overview" && totals && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Users" value={totals.users} icon={<FiUsers />} />
              <StatCard label="Open items" value={totals.openItems} icon={<FiPackage />} />
              <StatCard
                label="Unresolved"
                value={totals.unresolvedItems}
                icon={<FiAlertCircle />}
              />
              <StatCard
                label="Pending claims"
                value={totals.pendingClaims}
                icon={<FiAlertCircle />}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="font-bold mb-4">Recent posts</h2>
                <ul className="space-y-3 text-sm">
                  {dashboard.recentItems?.map((item) => (
                    <li key={item._id} className="flex justify-between gap-2">
                      <Link
                        to={`/item/${item._id}`}
                        className="text-cyan-300 hover:underline truncate"
                      >
                        {item.title}
                      </Link>
                      <span className="text-gray-500 shrink-0">{item.type}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="font-bold mb-4">Recent claims</h2>
                <ul className="space-y-3 text-sm">
                  {dashboard.recentClaims?.map((claim) => (
                    <li key={claim._id} className="flex justify-between gap-2">
                      <span className="truncate">{claim.itemId?.title || "Item"}</span>
                      <span className="text-amber-300 shrink-0">{claim.status}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        )}

        {!loading && tab === "moderation" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">All posts</h2>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-gray-400">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Poster</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id} className="border-t border-white/5">
                        <td className="p-3">
                          <Link to={`/item/${item._id}`} className="text-cyan-300 hover:underline">
                            {item.title}
                          </Link>
                          {item.isRemoved && (
                            <span className="ml-2 text-xs text-red-400">(removed)</span>
                          )}
                        </td>
                        <td className="p-3">{item.type}</td>
                        <td className="p-3">{item.status}</td>
                        <td className="p-3">{item.postedBy?.email || "—"}</td>
                        <td className="p-3">
                          {item.isRemoved ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreItem(item._id)}
                              className="text-emerald-400 hover:underline"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item._id)}
                              className="inline-flex items-center gap-1 text-red-400 hover:underline"
                            >
                              <FiTrash2 /> Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">All claims</h2>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-gray-400">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3">Claimant</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim._id} className="border-t border-white/5">
                        <td className="p-3">{claim.itemId?.title || "—"}</td>
                        <td className="p-3">{claim.claimantEmail}</td>
                        <td className="p-3">{claim.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {!loading && tab === "users" && (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-white/5">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">
                      {user.isBanned ? (
                        <span className="text-red-400">Banned</span>
                      ) : (
                        <span className="text-emerald-400">Active</span>
                      )}
                    </td>
                    <td className="p-3">
                      {user.role !== "admin" &&
                        (user.isBanned ? (
                          <button
                            type="button"
                            onClick={() => handleUnban(user._id)}
                            className="text-emerald-400 hover:underline"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBan(user._id)}
                            className="text-red-400 hover:underline"
                          >
                            Ban
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "categories" && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddCategory}
              className="flex flex-wrap gap-3 items-end rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div>
                <label className="text-xs text-gray-400 block mb-1">Name (ID)</label>
                <input
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Label</label>
                <input
                  value={newCategory.label}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, label: e.target.value })
                  }
                  className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold"
              >
                Add category
              </button>
            </form>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="flex items-center gap-2">
                    <FiTag className="text-cyan-400" />
                    {cat.label}{" "}
                    <span className="text-gray-500 text-xs">({cat.name})</span>
                    {!cat.isActive && (
                      <span className="text-xs text-red-400">inactive</span>
                    )}
                  </span>
                  {cat.isActive && (
                    <button
                      type="button"
                      onClick={() => handleDeactivateCategory(cat._id)}
                      className="text-red-400 text-sm hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && tab === "buildings" && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddBuilding}
              className="flex flex-wrap gap-3 items-end rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div>
                <label className="text-xs text-gray-400 block mb-1">Building name</label>
                <input
                  value={newBuilding.name}
                  onChange={(e) =>
                    setNewBuilding({ name: e.target.value })
                  }
                  className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold"
              >
                Add building
              </button>
            </form>
            <ul className="space-y-2">
              {buildings.map((b) => (
                <li
                  key={b._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="flex items-center gap-2">
                    <FiMapPin className="text-cyan-400" />
                    {b.name}
                    {!b.isActive && (
                      <span className="text-xs text-red-400">inactive</span>
                    )}
                  </span>
                  {b.isActive && (
                    <button
                      type="button"
                      onClick={() => handleDeactivateBuilding(b._id)}
                      className="text-red-400 text-sm hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
