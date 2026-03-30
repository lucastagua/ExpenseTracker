import api from "../api/axios";

export const getTransactionsRequest = async (params = {}) => {
  const response = await api.get("/transactions", { params });
  return response.data;
};

export const createTransactionRequest = async (data) => {
  const response = await api.post("/transactions", data);
  return response.data;
};

export const updateTransactionRequest = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransactionRequest = async (id) => {
  await api.delete(`/transactions/${id}`);
};