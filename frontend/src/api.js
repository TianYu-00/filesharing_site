import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9090/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const uploadFile = async (formData, onUploadProgress) => {
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
    const response = await api.get(`/files/download-links/${download_link}/file-info`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const downloadFileByID = async (file_id, link = "", password = "") => {
  try {
    const encodedLink = encodeURIComponent(link);
    const encodedPassword = encodeURIComponent(password);
    const response = await api.get(`/files/${file_id}/download?link=${encodedLink}&password=${encodedPassword}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const previewFileByID = async (file_id, link = "", password = "") => {
  try {
    const encodedLink = encodeURIComponent(link);
    const encodedPassword = encodeURIComponent(password);
    const response = await api.get(`/files/${file_id}/preview?link=${encodedLink}&password=${encodedPassword}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
  const data = { username: username, email: email, password: password };
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const loginUser = async (email, password, isRememberMe) => {
  const data = { email: email, password: password, isRememberMe: isRememberMe };
  try {
    const response = await api.post("/auth/login", data);
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

export const verifyUser = async () => {
  try {
    const response = await api.get(`/auth/verify-user-token`);
    // console.log(response);
    return response.data;
  } catch (error) {
    // console.error(error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(`/auth/logout`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const sendPasswordResetLink = async (userEmail) => {
  try {
    const data = { email: userEmail };
    const response = await api.post(`/auth/forgot-password`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyPasswordResetToken = async (token) => {
  try {
    const data = { forgotPasswordToken: token };
    const response = await api.post(`/auth/forgot-password/verify`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeUserPassword = async (email, password, token) => {
  try {
    const data = { email: email, password: password, forgotPasswordToken: token };
    const response = await api.patch(`/auth/reset-password`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchFilesByUserId = async (user_id) => {
  try {
    const response = await api.get(`/users/${user_id}/files`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteFileById = async (file_id) => {
  try {
    const response = await api.delete(`/files/${file_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const renameFileById = async (file_id, newFileName) => {
  try {
    const data = { newFileName: newFileName };
    const response = await api.patch(`/files/${file_id}/rename`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDownloadLinksByFileId = async (file_id) => {
  try {
    const response = await api.get(`/files/${file_id}/download-links`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createDownloadLinkByFileId = async (file_id, expires_at, download_limit, password) => {
  const data = { expires_at: expires_at, download_limit: download_limit, password: password };
  try {
    const response = await api.post(`/files/${file_id}/download-link`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeDownloadLinkByLinkId = async (link_id) => {
  try {
    const response = await api.delete(`/files/download-links/${link_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchDownloadLinkInfoByDownloadLink = async (download_link) => {
  try {
    const response = await api.get(`/files/download-links/${download_link}/details`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const increaseDownloadLinkCountByLinkId = async (link_id) => {
  try {
    const response = await api.patch(`/files/download-links/${link_id}/increase-download-count`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const validateDownloadLinkPassword = async (link_id, password) => {
  const data = { password: password };
  try {
    const response = await api.post(`/files/download-links/${link_id}/validate-password`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeManyFilesByFileInfo = async (files) => {
  const data = { files: files };
  try {
    const response = await api.delete(`/files/delete-many/files`, { data });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateFavouriteFileById = async (file_id, favouriteState) => {
  const data = { favourite: favouriteState };
  try {
    const response = await api.patch(`/files/${file_id}/favourite`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateTrashFileById = async (file_id, trashState) => {
  const data = { trash: trashState };
  try {
    const response = await api.patch(`/files/${file_id}/trash`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateManyTrashFileByFiles = async (files, trashState) => {
  const data = { files: files, trash: trashState };
  try {
    const response = await api.patch(`/files/trash-many/files`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
