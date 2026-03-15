// ─── Date helpers ─────────────────────────────────────────────────────────────
export const daysInMonth  = (year, month) => new Date(year, month + 1, 0).getDate();
export const getDayOfWeek = (year, month, day) => new Date(year, month, day).getDay();
export const isSunday     = (year, month, day) => getDayOfWeek(year, month, day) === 0;
export const isSaturday   = (year, month, day) => getDayOfWeek(year, month, day) === 6;
export const isFutureDate = (year, month, day) => new Date(year, month, day) > new Date();

export const isToday = (year, month, day) => {
  const n = new Date();
  return year === n.getFullYear() && month === n.getMonth() && day === n.getDate();
};

// Returns true if the given day is an allowed class day for the turma option
export const isClassDay = (year, month, day, turmaOpt, diasMap) => {
  const allowed = diasMap[turmaOpt];
  if (!allowed) return true; // fallback: allow all
  const dow = getDayOfWeek(year, month, day);
  return allowed.includes(dow);
};

// ─── Contract helpers ─────────────────────────────────────────────────────────
// Given an inicio date string (YYYY-MM-DD), return fim date (1 year - 1 day)
export const calcFimContrato = (inicio) => {
  if (!inicio) return "";
  const d = new Date(inicio);
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

// Days until a date string expires (negative = already expired)
export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ─── Birthday helpers ─────────────────────────────────────────────────────────
export const isBirthdayThisMonth = (dateStr, month) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getMonth() === month;
};

// ─── Time helpers ─────────────────────────────────────────────────────────────
export const pad = (n) => String(n).padStart(2, "0");

export const timeToMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const minutesToTime = (total) => `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;

export const calcWorkedMinutes = (entry, exit) => {
  const diff = timeToMinutes(exit) - timeToMinutes(entry);
  return diff > 0 ? diff : 0;
};

// Format date string YYYY-MM-DD to DD/MM/YYYY
export const formatDate = (str) => {
  if (!str) return "—";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
};

// ─── String helpers ───────────────────────────────────────────────────────────
export const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
