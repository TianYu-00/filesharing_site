import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9090/api",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/files/upload", formData, {
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
