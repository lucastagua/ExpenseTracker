import api from "../api/axios";

export const registerRequest = async (formData) => {
  const response = await api.post("/Auth/register", formData);
  return response.data;
};

export const loginRequest = async (formData) => {
  const response = await api.post("/Auth/login", formData);
  return response.data;
};

export const getMeRequest = async () => {
  const response = await api.get("/Auth/me");
  return response.data;
};

export const forgotPasswordRequest = async (email) => {
  const response = await api.post("/Auth/forgot-password", { email });
  return response.data;
};

export const resetPasswordRequest = async (token, newPassword) => {
  const response = await api.post("/Auth/reset-password", {
    token,
    newPassword,
  });

  return response.data;
};