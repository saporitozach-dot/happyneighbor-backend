import { API_URL } from "./apiConfig";

const jsonHeaders = { "Content-Type": "application/json" };

async function hubRequest(path, options = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...jsonHeaders, ...options.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function fetchHubData(streetId) {
  return hubRequest(`/hub/${encodeURIComponent(streetId)}`);
}

export async function createHubEvent(streetId, event) {
  return hubRequest(`/hub/${encodeURIComponent(streetId)}/events`, {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export async function createHubBoardPost(streetId, post) {
  return hubRequest(`/hub/${encodeURIComponent(streetId)}/board`, {
    method: "POST",
    body: JSON.stringify(post),
  });
}

export async function createHubNeighbor(streetId, neighbor) {
  return hubRequest(`/hub/${encodeURIComponent(streetId)}/neighbors`, {
    method: "POST",
    body: JSON.stringify(neighbor),
  });
}

export async function chipInToEvent(streetId, eventId, payload) {
  return hubRequest(
    `/hub/${encodeURIComponent(streetId)}/events/${eventId}/chip-in`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function rsvpToEvent(streetId, eventId, payload) {
  return hubRequest(
    `/hub/${encodeURIComponent(streetId)}/events/${eventId}/rsvp`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function respondToBoardPost(streetId, postId, payload) {
  return hubRequest(
    `/hub/${encodeURIComponent(streetId)}/board/${postId}/respond`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function endorseBoardPost(streetId, postId, payload) {
  return hubRequest(
    `/hub/${encodeURIComponent(streetId)}/board/${postId}/endorse`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}
