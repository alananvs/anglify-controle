const URL = "https://odimcdhzvgvljnscnxbl.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaW1jZGh6dmd2bGpuc2NueGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTUzMTcsImV4cCI6MjA4ODU3MTMxN30.kKv3AQ2LsFigi4T0_5p5fVLMr9RKX7kY9tTRuGKbHHg";

async function request(path, method = "GET", body = null, extra = {}) {
  const headers = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

const supabase = {
  query(table, { filters = [], order, select } = {}) {
    let qs = "select=*&";
    if (select) qs = `select=${encodeURIComponent(select)}&`;
    filters.forEach((f) => { qs += `${f}&`; });
    if (order) qs += `order=${order}&`;
    return request(`${table}?${qs}`);
  },
  insert(table, data) {
    return request(table, "POST", data, { Prefer: "return=representation" });
  },
  update(table, filter, data) {
    return request(`${table}?${filter}`, "PATCH", data, { Prefer: "return=representation" });
  },
  upsert(table, data, onConflict) {
    const path = onConflict ? `${table}?on_conflict=${onConflict}` : table;
    return request(path, "POST", data, { Prefer: "return=representation,resolution=merge-duplicates" });
  },
  remove(table, filter) {
    return request(`${table}?${filter}`, "DELETE");
  },
};

export default supabase;