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
    const response = await api.post("/files/file-upload", formData, {
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
    const response = await api.get(`/files/file-info-by-link/${download_link}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const downloadFileByID = async (file_id) => {
  try {
    const response = await api.get(`/files/download-file-by-id/${file_id}`, { responseType: "blob" });
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

export const loginUser = async (email, password, isRememberMe) => {
  const data = { email: email, password: password, isRememberMe: isRememberMe };
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

export const verifyUser = async () => {
  try {
    const response = await api.get(`/authVerify`);
    // console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(`/users/logout`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const sendPasswordResetLink = async (userEmail) => {
  try {
    const data = { email: userEmail };
    const response = await api.post(`/users/send-password-reset-link`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyPasswordResetToken = async (token) => {
  try {
    const data = { token: token };
    const response = await api.post(`/users/verify-password-reset-token`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeUserPassword = async (email, password) => {
  try {
    const data = { email: email, password: password };
    const response = await api.patch(`/reset-password`, data);
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
    const response = await api.delete(`/files/delete-file-by-file-id/${file_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const renameFileById = async (file_id, newFileName) => {
  try {
    const data = { newFileName: newFileName };
    const response = await api.patch(`/files/rename-file-by-file-id/${file_id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDownloadLinksByFileId = async (file_id) => {
  try {
    const response = await api.get(`/files/download-link-by-file-id/${file_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createDownloadLinkByFileId = async (file_id, expires_at, download_limit, password) => {
  const data = { expires_at: expires_at, download_limit: download_limit, password: password };
  try {
    const response = await api.post(`/files/create-download-link-by-file-id/${file_id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeDownloadLinkByLinkId = async (link_id) => {
  try {
    const response = await api.delete(`/files/remove-download-link-by-link-id/${link_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchDownloadLinkInfoByDownloadLink = async (download_link) => {
  try {
    const response = await api.get(`/files/download-link-info-by-link/${download_link}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const increaseDownloadLinkCountByLinkId = async (link_id) => {
  try {
    const response = await api.patch(`/files/increase-download-count-by-link-id/${link_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const validateDownloadLinkPassword = async (link_id, password) => {
  const data = { password: password };
  try {
    const response = await api.post(`/files/validate-download-password-by-link-id/${link_id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeManyFilesByFileInfo = async (files) => {
  const data = { files: files };
  try {
    const response = await api.delete(`/files/remove-many-files-by-body-file-info`, { data });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateFavouriteFileById = async (file_id, favouriteState) => {
  const data = { favourite: favouriteState };
  try {
    const response = await api.patch(`/files/update-favourite-file-by-file-id/${file_id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
