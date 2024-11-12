import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9090/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const fetchFileInfo = async (download_link) => {
  try {
    const response = await api.get(`/files/info-by-link/${download_link}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const downloadFileByID = async (file_id) => {
  try {
    const response = await api.get(`/files/download/${file_id}`, { responseType: "blob" });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
  const data = { username: username, email: email, password: password };
  try {
    const response = await api.post("/users/register", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  const data = { email: email, password: password };
  try {
    const response = await api.post("/users/login", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const editUser = async (user_id, { username, email, currentPassword, newPassword }) => {
  const data = { username: username, email: email, currentPassword: currentPassword, newPassword: newPassword };
  try {
    const response = await api.patch(`/users/${user_id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
