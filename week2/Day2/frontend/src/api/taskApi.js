import axiosInstance from "./axiosInstance";


export const getTasks = () => axiosInstance.get("/tasks");

export const createTask = (data) => axiosInstance.post("/tasks", data);

export const updateTask = (id, data) => axiosInstance.put(`/tasks/${id}`, data);

export const deleteTask = (id) => axiosInstance.delete(`/tasks/${id}`);