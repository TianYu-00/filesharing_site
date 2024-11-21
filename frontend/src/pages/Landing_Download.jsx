import React, { useEffect, useState } from "react";
import { fetchFileInfo, downloadFileByID } from "../api";
import { fileSizeFormatter, fileDateFormatter } from "../components/File_Formatter";
import { useParams, useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip"; // https://react-tooltip.com/docs/examples/styling

import { BsLink45Deg } from "react-icons/bs";

import Page_BoilerPlate from "../components/Page_BoilerPlate";

function Landing_Download() {
  const [file, setFile] = useState(null);
  const { file_id: download_link } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [isFileNotFound, setIsFileNotFound] = useState(true);

  //
  const [linkButtonToolTipContent, setLinkButtonToolTipContent] = useState("Copy file link to clipboard");

  useEffect(() => {
    fetchFile();
  }, []);

  useEffect(() => {
    console.log(file);
  }, [file]);

  const fetchFile = async () => {
    try {
      setIsLoading(true);
      setIsFileNotFound(true);
      const fetchedFileInfo = await fetchFileInfo(download_link);
      if (fetchedFileInfo.success) {
        setIsLoading(false);
        setIsFileNotFound(false);
        setFile(fetchedFileInfo.data);
      } else {
        setIsFileNotFound(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setIsFileNotFound(true);
      setErrorMessage(error.response.data.msg);
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

  if (isLoading) {
    return <Page_BoilerPlate>Loading ...</Page_BoilerPlate>;
  }

  if (!isLoading && isFileNotFound) {
    return (
      <Page_BoilerPlate>
        <div className="flex flex-col justify-center items-center">
          <p className="text-red-500">{errorMessage}</p>
          <button
            className="w-full bg-black text-white font-semibold p-2 rounded mt-10 max-w-md"
            onClick={() => navigate("/")}
          >
            Return to home page
          </button>
        </div>
      </Page_BoilerPlate>
    );
  }

  return (
    <Page_BoilerPlate>
      {file && (
        <div>
          <div className="grid grid-cols-2 w-full mx-auto mt-6">
            <div className="border border-gray-700 p-2 text-left">File ID</div>
            <div className="border border-gray-700 p-2 text-left">{file.id}</div>

            <div className="border border-gray-700 p-2 text-left">File Name</div>
            <div className="border border-gray-700 p-2 text-left">{file.originalname}</div>

            <div className="border border-gray-700 p-2 text-left">File Size</div>
            <div className="border border-gray-700 p-2 text-left">{fileSizeFormatter(file.size)}</div>

            <div className="border border-gray-700 p-2 text-left">File Type</div>
            <div className="border border-gray-700 p-2 text-left">{file.mimetype}</div>

            <div className="border border-gray-700 p-2 text-left">File Created Time</div>
            <div className="border border-gray-700 p-2 text-left">{fileDateFormatter(file.created_at)[0]}</div>

            <div className="border border-gray-700 p-2 text-left">File Created Date</div>
            <div className="border border-gray-700 p-2 text-left">{fileDateFormatter(file.created_at)[1]}</div>

            <div className="border border-gray-700 p-2 text-left">File Owner ID</div>
            <div className="border border-gray-700 p-2 text-left">{file.user_id}</div>
          </div>

          <div>
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
          </div>

          <button
            onClick={downloadFile}
            className="bg-blue-500 p-2 rounded max-w-[200px] w-full mt-4 transition duration-500 ease-in-out hover:bg-green-500"
          >
            Download
          </button>
        </div>
      )}
    </Page_BoilerPlate>
  );
}

export default Landing_Download;

// get url download_link
// send get request to fetch file data
