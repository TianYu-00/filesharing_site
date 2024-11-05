import React, { useEffect, useState } from "react";
import { uploadFile } from "../api";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  const handle_DownloadRedirect = () => {
    navigate(`/files/download/${downloadLink}`);
  };

  const handle_FileChange = (event) => {
    setUploadedFile(event.target.files[0]);
    setUploadProgress(0);
    setUploadStatus("");
  };

  const handle_FileUpload = async () => {
    if (!uploadedFile) {
      alert("Please choose a file to upload!");
      return;
    }

    try {
      const uploadResponse = await uploadFile(uploadedFile, (progressEvent) => {
        const percentCount = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCount);
      });

      setUploadStatus("✓");
      console.log("Server response:", uploadResponse);
      setDownloadLink(uploadResponse.data.downloadLink.download_url);
    } catch (error) {
      setUploadStatus("Upload failed");
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(uploadedFile);
  }, [uploadedFile]);

  return (
    <div>
      <h3>File Upload Test</h3>
      <input type="file" onChange={handle_FileChange} />

      <button onClick={handle_FileUpload}>Upload File</button>

      {uploadedFile && (
        <div>
          <p>File name: {uploadedFile.name}</p>
          <p>File size: {fileSizeFormatter(uploadedFile.size)}</p>
          <p>File type: {uploadedFile.type}</p>
        </div>
      )}

      {uploadProgress > 0 && (
        <div>
          <p>Upload Progress: {uploadProgress}%</p>
          <progress value={uploadProgress} max="100"></progress>
          <p>{uploadStatus}</p>
        </div>
      )}

      {downloadLink && (
        <div>
          <button onClick={handle_DownloadRedirect}>Redirect to Download</button>
        </div>
      )}
    </div>
  );
}

function fileSizeFormatter(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const decimalPlaces = 2;
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimalPlaces)) + " " + sizes[i];
}

export default Home;

// rfce snippet
