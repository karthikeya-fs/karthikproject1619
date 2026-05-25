export function setAuthSession({ token, user }) {
  if (token) localStorage.setItem("token", token);
  if (user?.email) localStorage.setItem("userEmail", user.email);
  if (user?._id) localStorage.setItem("userId", user._id);
  if (user?.role) localStorage.setItem("userRole", user.role);
  if (user) {
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: user.name || "",
        email: user.email || "",
      })
    );
  }
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("user");
}

/** Profile fields for claim forms and similar prefill */
export function getStoredUserProfile() {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          name: parsed.name || "",
          email: parsed.email || "",
        };
      }
    }
  } catch {
    /* ignore invalid JSON */
  }
  const email = localStorage.getItem("userEmail");
  if (email) return { name: "", email };
  return null;
}

export function updateStoredUserProfile({ name, email }) {
  const current = getStoredUserProfile() || { name: "", email: "" };
  localStorage.setItem(
    "user",
    JSON.stringify({
      name: name ?? current.name,
      email: email ?? current.email,
    })
  );
}

export function getStoredUserRole() {
  return localStorage.getItem("userRole");
}

export function getStoredUserId() {
  const id = localStorage.getItem("userId");
  if (id) return id;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))).id || null;
  } catch {
    return null;
  }
}
