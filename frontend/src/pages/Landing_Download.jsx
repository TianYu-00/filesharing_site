import React, { useEffect, useState } from "react";
import { fetchFileInfo, downloadFileByID } from "../api";
import { fileSizeFormatter, fileDateFormatter } from "../components/File_Formatter";
import { useParams } from "react-router-dom";
import { Tooltip } from "react-tooltip"; // https://react-tooltip.com/docs/examples/styling

import { BsLink45Deg } from "react-icons/bs";

function Landing_Download() {
  const [file, setFile] = useState(null);
  const { file_id: download_link } = useParams();

  //
  const [linkButtonToolTipContent, setLinkButtonToolTipContent] = useState("Copy file link to clipboard");

  useEffect(() => {
    fetchFile();
    console.log(file);
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
      const url = URL.createObjectURL(new Blob([fileBlob]));

      triggerDownload(url, file.originalname);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const triggerDownload = (url, filename) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyLinkToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkButtonToolTipContent("Link copied!");
    } catch (error) {
      console.error("Failed to copy: ", error);
      setLinkButtonToolTipContent("Failed to copy!");
    }
    setTimeout(() => setLinkButtonToolTipContent("Copy file link to clipboard"), 2000);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-[1280px] mx-auto text-center text-white p-2 w-3/4">
        <p className="text-2xl font-bold">File Is Ready</p>

        <button
          className="mt-4"
          onClick={copyLinkToClipBoard}
          data-tooltip-id="id_link_button"
          data-tooltip-content={linkButtonToolTipContent}
        >
          <BsLink45Deg className="p-1" size={30} />
        </button>
        <Tooltip
          id="id_link_button"
          style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
          opacity={0.9}
          place="bottom"
        />

        {file ? (
          <div>
            <div className="table w-full mx-auto mt-6">
              <div className="table-row">
                <div className="table-cell border border-gray-700 p-2 text-left">File ID</div>
                <div className="table-cell border border-gray-700 p-2 text-left">{file.id}</div>
              </div>
              <div className="table-row">
                <div className="table-cell border border-gray-700 p-2 text-left">File Name</div>
                <div className="table-cell border border-gray-700 p-2 text-left">{file.originalname}</div>
              </div>
              <div className="table-row">
                <div className="table-cell border border-gray-700 p-2 text-left">File Size</div>
                <div className="table-cell border border-gray-700 p-2 text-left">{fileSizeFormatter(file.size)}</div>
              </div>
              <div className="table-row">
                <div className="table-cell border border-gray-700 p-2 text-left">File type</div>
                <div className="table-cell border border-gray-700 p-2 text-left">{file.mimetype}</div>
              </div>
              <div className="table-row">
                <div className="table-cell border border-gray-700 p-2 text-left">File Created Time</div>
                <div className="table-cell border border-gray-700 p-2 text-left">
                  {fileDateFormatter(file.created_at)[0]}
                </div>
              </div>
              <div className="table-row">
                <div className="table-cell border border-gray-700 p-2 text-left">File Created Date</div>
                <div className="table-cell border border-gray-700 p-2 text-left">
                  {fileDateFormatter(file.created_at)[1]}
                </div>
              </div>
              <div className="table-row">
                <div className="table-cell border border-gray-700 p-2 text-left">File Owner ID</div>
                <div className="table-cell border border-gray-700 p-2 text-left">{file.user_id}</div>
              </div>
            </div>

            <button onClick={downloadFile} className="bg-slate-500 p-2 rounded max-w-[200px] w-full mt-4">
              Download
            </button>
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
