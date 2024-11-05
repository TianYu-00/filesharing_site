import React, { useEffect, useState } from "react";
import { fetchFileInfo, downloadFileByID } from "../api";
import { useParams } from "react-router-dom";

function Landing_Download() {
  const [file, setFile] = useState(null);
  const { file_id: download_link } = useParams();

  useEffect(() => {
    fetchFile();
  }, []);

  const fetchFile = async () => {
    try {
      const fetchedFileInfo = await fetchFileInfo(download_link);
      setFile(fetchedFileInfo.data);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadFile = async () => {
    try {
      const fileBlob = await downloadFileByID(file.id);
      const url = window.URL.createObjectURL(new Blob([fileBlob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        {file ? (
          <div>
            <p>File ID: {file.id}</p>
            <p>File Name Name: {file.originalname}</p>
            <p>File Size: {file.size} bytes</p>
            <button onClick={downloadFile}>Download</button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default Landing_Download;

// get url download_link
// send get request to fetch file data
