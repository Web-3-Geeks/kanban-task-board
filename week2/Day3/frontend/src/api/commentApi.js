import axiosInstance from "./axiosInstance";

export const getComments = (taskId) => axiosInstance.get(`/tasks/${taskId}/comments`);

export const createComment = (taskId, content) =>
  axiosInstance.post(`/tasks/${taskId}/comments`, { content });

export const updateComment = (commentId, content) =>
  axiosInstance.put(`/comments/${commentId}`, { content });

export const deleteComment = (commentId) => axiosInstance.delete(`/comments/${commentId}`);
