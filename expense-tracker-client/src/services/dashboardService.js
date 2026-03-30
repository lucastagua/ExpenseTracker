import api from "../api/axios";

export const getSummaryRequest = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};

export const getMonthlySummaryRequest = async (year, month) => {
  const response = await api.get("/dashboard/monthly-summary", {
    params: { year, month },
  });
  return response.data;
};

export const getMonthlyHistoryRequest = async (year) => {
  const response = await api.get("/dashboard/monthly-history", {
    params: { year },
  });
  return response.data;
};