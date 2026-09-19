import axiosInstance from "./axiosInstance";

export const getActivity = (taskId) => axiosInstance.get(`/tasks/${taskId}/activity`);
