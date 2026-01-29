import API from "./api";

// Buyer / User APIs
export const getMyMessages = () => API.get("/contact/mine");
export const getMessageThread = (id) => API.get(`/contact/${id}`);
export const sendMessage = (data) => API.post("/contact", data);

// Admin APIs
export const adminGetAllMessages = (status = "OPEN") =>
  API.get(`/admin/contact${status ? `?status=${encodeURIComponent(status)}` : ""}`);

export const adminGetMessageThread = (id) =>
  API.get(`/admin/contact/${id}`);

export const adminReplyMessage = (id, body) =>
  API.post(`/admin/contact/${id}/reply`, { body });

export const adminDeleteMessage = (id) =>
  API.delete(`/admin/contact/${id}`);
