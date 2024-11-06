import React, { useEffect, useState } from "react";
import { uploadFile } from "../api";
import { fileSizeFormatter } from "../components/File_Formatter";
import FileDropZone from "../components/File_DropZone";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

import logo from "../assets/logo.png";

//
import { BsUpload, BsLink45Deg, BsBoxArrowRight, BsPlusLg } from "react-icons/bs";

// rfce snippet

function Home() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [isUploadClicked, setIsUploadClicked] = useState(false);

  //
  const [downloadButtonToolTipContent, setDownloadButtonToolTipContent] = useState("Redirect to download page");
  const [linkButtonToolTipContent, setLinkButtonToolTipContent] = useState("Copy download link to clipboard");
  const [reselectButtonToolTipContent, setReselectButtonToolTipContent] = useState("Reselect a file to upload");

  const handle_ReselectFile = async () => {
    window.location.replace(window.location.href);
  };

  const handle_DownloadRedirect = () => {
    navigate(`/files/download/${downloadLink}`);
  };

  const handle_FileSelect = (file) => {
    setSelectedFile(file);
    setUploadProgress(0);
    setUploadStatus("");
  };

  const handle_FileUpload = async () => {
    if (!selectedFile) {
      alert("Please choose a file to upload!");
      return;
    }

    try {
      setIsUploadClicked(true);
      const uploadResponse = await uploadFile(selectedFile, (progressEvent) => {
        const percentCount = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCount);
      });

      setUploadStatus("✓");
      console.log("Server response:", uploadResponse);
      setDownloadLink(uploadResponse.data.downloadLink.download_url);
    } catch (error) {
      setIsUploadClicked(false);
      setUploadStatus("Upload failed");
      console.error(error);
    }
  };

  const copyLinkToClipBoard = async () => {
    try {
      const fullUrl = `${window.location.origin}/files/download/${downloadLink}`;
      await navigator.clipboard.writeText(fullUrl);
      setLinkButtonToolTipContent("Link copied!");
    } catch (error) {
      console.error("Failed to copy: ", error);
      setLinkButtonToolTipContent("Failed to copy!");
    }
    setTimeout(() => setLinkButtonToolTipContent("Copy file link to clipboard"), 2000);
  };

  useEffect(() => {
    console.log(selectedFile);
  }, [selectedFile]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-[1280px] mx-auto w-full flex items-center justify-center">
        <div className="max-w-[1000px] w-full p-8 text-center text-white rounded-2xl m-4 bg-neutral-900 shadow-lg">
          <div className="flex justify-center mb-14 bg-blue-600 rounded-t-2xl">
            <img src={logo} alt="" className="p-6 max-w-full md:max-w-[500px]" />
          </div>

          {!isUploadClicked && <FileDropZone onFileSelect={handle_FileSelect} />}

          {isUploadClicked &&
            (uploadProgress === 100 ? (
              <div className="w-full mx-auto flex mt-2 justify-center">
                <p>File has been uploaded</p>
              </div>
            ) : (
              <div className="w-full mx-auto flex mt-2 justify-center">
                <p>File is being uploaded...</p>
              </div>
            ))}

          {selectedFile && (
            <div className="grid grid-cols-3 w-full mx-auto mt-6">
              {/* Header Row */}
              <div className="border-b border-gray-700 p-2 text-left">Name</div>
              <div className="border-b border-gray-700 p-2 text-left">Size</div>
              <div className="border-b border-gray-700 p-2 text-left">Type</div>

              {/* Data Row */}
              <div className="border-gray-700 p-2 text-left">{selectedFile.name}</div>
              <div className="border-gray-700 p-2 text-left">{fileSizeFormatter(selectedFile.size)}</div>
              <div className="border-gray-700 p-2 text-left">{selectedFile.type}</div>
            </div>
          )}

          {!isUploadClicked && (
            <div className="flex mt-5">
              <button
                onClick={handle_FileUpload}
                className="bg-blue-500 p-1 rounded flex items-center justify-center w-full font-bold"
              >
                <BsUpload className="mx-2 stroke-1" size={20} /> Upload
              </button>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="w-full mx-auto flex mt-2">
              <progress
                value={uploadProgress}
                max="100"
                className="[&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-blue-400 [&::-moz-progress-bar]:bg-blue-400 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-500 flex-grow m-1"
              ></progress>
              <p className="mx-2">{uploadProgress}%</p>
              <p>{uploadStatus}</p>
            </div>
          )}

          {downloadLink && (
            <div>
              {/* DOWNLOAD */}
              <button
                className="m-2"
                onClick={handle_DownloadRedirect}
                data-tooltip-id="id_download_button"
                data-tooltip-content={downloadButtonToolTipContent}
              >
                <BsBoxArrowRight className="" size={30} />
              </button>
              <Tooltip
                id="id_download_button"
                style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
                opacity={0.9}
                place="bottom"
              />

              {/* COPY */}
              <button
                className="m-2"
                onClick={copyLinkToClipBoard}
                data-tooltip-id="id_link_button"
                data-tooltip-content={linkButtonToolTipContent}
              >
                <BsLink45Deg className="" size={30} />
              </button>
              <Tooltip
                id="id_link_button"
                style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
                opacity={0.9}
                place="bottom"
              />

              {/* Reselect File */}
              <button
                className="m-2"
                onClick={handle_ReselectFile}
                data-tooltip-id="id_reselect_button"
                data-tooltip-content={reselectButtonToolTipContent}
              >
                <BsPlusLg className="" size={30} />
              </button>
              <Tooltip
                id="id_reselect_button"
                style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
                opacity={0.9}
                place="bottom"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
