import api from "../api/axios";

export const getCategoriesRequest = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const createCategoryRequest = async (data) => {
  const response = await api.post("/categories", data);
  return response.data;
};

export const updateCategoryRequest = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategoryRequest = async (id) => {
  await api.delete(`/categories/${id}`);
};