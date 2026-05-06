import axiosInstance from "@/lib/axiosInstance";

// GET API call
export const getData = async (endpoint, data = {}) => {
  try {
    const response = await axiosInstance.get(`/api/v1${endpoint}`, {
      params: data,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// POST API call
export const postData = async (endpoint, data) => {
  try {
    const response = await axiosInstance.post(`/api/v1${endpoint}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

// PUT API call
export const putData = async (endpoint, data) => {
  try {
    const response = await axiosInstance.put(`/api/v1${endpoint}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

// DELETE API call
export const deleteData = async (endpoint, data = {}) => {
  try {
    const response = await axiosInstance.delete(`/api/v1${endpoint}`, {
      params: data,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteBodyData = async (endpoint, data = {}) => {
  try {
    const response = await axiosInstance.delete(`/api/v1${endpoint}`, {
      data: data,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
