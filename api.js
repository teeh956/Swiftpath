const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function checkResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || response.statusText || "API error";
    throw new Error(message);
  }
  return data;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return checkResponse(response);
}

export async function fetchMe(token) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return checkResponse(response);
}

export async function fetchShipments(token) {
  const response = await fetch(`${API_URL}/shipments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return checkResponse(response);
}

export async function createShipment(token, shipment) {
  const response = await fetch(`${API_URL}/shipments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(shipment)
  });
  return checkResponse(response);
}

export async function fetchTracking(code) {
  const response = await fetch(`${API_URL}/track/${encodeURIComponent(code)}`);
  return checkResponse(response);
}

export async function fetchPataPoints(token) {
  const response = await fetch(`${API_URL}/pata-points`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return checkResponse(response);
}

export async function collectParcel(token, pointId, parcelId) {
  const response = await fetch(`${API_URL}/pata-points/${pointId}/collect/${parcelId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  return checkResponse(response);
}

export async function fetchAnalytics(token) {
  const response = await fetch(`${API_URL}/analytics/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return checkResponse(response);
}

export async function fetchAnalyticsVolume(token, range = 30) {
  const response = await fetch(`${API_URL}/analytics/volume?range=${range}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return checkResponse(response);
}
