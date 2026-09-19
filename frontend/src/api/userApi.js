import axiosInstance from "./axiosInstance";

export const getUsers = () => axiosInstance.get("/users");
