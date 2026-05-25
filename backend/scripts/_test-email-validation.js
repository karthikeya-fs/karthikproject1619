/** Quick sanity check: register validation accepts any email, requires email. */
function validateRegister(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const errors = [];
  if (!name) errors.push("Name is required");
  if (!email) errors.push("Email is required");
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  if (!department) errors.push("Department is required");
  return { email, errors };
}

const cases = [
  { label: "missing email", body: { name: "A", email: "", password: "secret1", department: "CSE" } },
  { label: "gmail", body: { name: "A", email: "user@gmail.com", password: "secret1", department: "CSE" } },
  { label: "edu", body: { name: "A", email: "student@college.edu", password: "secret1", department: "CSE" } },
];

let failed = 0;
for (const { label, body } of cases) {
  const { email, errors } = validateRegister(body);
  const ok =
    label === "missing email"
      ? errors.includes("Email is required")
      : errors.length === 0 && email.includes("@");
  console.log(`${ok ? "PASS" : "FAIL"}: ${label} -> errors=${JSON.stringify(errors)} email=${email}`);
  if (!ok) failed += 1;
}

process.exit(failed ? 1 : 0);
