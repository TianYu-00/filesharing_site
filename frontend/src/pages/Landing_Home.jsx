import React, { useEffect, useState } from "react";
import { uploadFile } from "../api";
import { fileSizeFormatter } from "../components/File_Formatter";
import FileDropZone from "../components/File_DropZone";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

//
import { BsUpload, BsLink45Deg, BsBoxArrowRight, BsPlusLg } from "react-icons/bs";

import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { useUser } from "../context/UserContext";

import { toast } from "react-toastify";

import PageExitAlert from "../components/PageExitAlert";

// rfce snippet

function Home() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [isUploadClicked, setIsUploadClicked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [reselectButtonToolTipContent, setReselectButtonToolTipContent] = useState("Upload more files");

  //
  const { user } = useUser();

  useEffect(() => {
    // console.log(user);
  }, [user]);

  const handle_ReselectFile = async () => {
    window.location.replace(window.location.href);
  };

  // const handle_DownloadRedirect = () => {
  //   navigate(`/files/download/${downloadLink}`);
  // };

  const handle_FileSelect = (newFiles) => {
    setSelectedFiles((prevFiles) => {
      const existingFileNames = prevFiles.map((file) => file.name);
      const filteredFiles = Array.from(newFiles).filter((file) => !existingFileNames.includes(file.name));
      return [...prevFiles, ...filteredFiles];
    });

    setUploadProgress((prevProgress) => {
      const updatedProgress = { ...prevProgress };
      newFiles.forEach((file) => {
        if (!updatedProgress[file.name]) {
          updatedProgress[file.name] = 0;
        }
      });
      return updatedProgress;
    });
  };

  const handle_FileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please choose a file to upload");
      return;
    }

    try {
      toast.info("Files are being uploaded");

      setIsUploadClicked(true);
      setIsUploading(true);

      const progressState = {};

      for (let file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        if (user && user.id) {
          formData.append("user_id", user.id);
        }

        try {
          await uploadFile(formData, (progressEvent) => {
            const percentCount = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progressState[file.name] = percentCount;

            setUploadProgress({ ...progressState });
            // console.log(`${file.name}: ${percentCount}%`);
          });

          toast.success(`File ${file.name} uploaded successfully`);
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setUploadStatus(true);
      setIsUploading(false);
    } catch (error) {
      setUploadStatus(false);
      setIsUploadClicked(false);
      setIsUploading(false);
      toast.error("Failed to upload files");
    }
  };

  // const copyLinkToClipBoard = async () => {
  //   try {
  //     const fullUrl = `${window.location.origin}/files/download/${downloadLink}`;
  //     await navigator.clipboard.writeText(fullUrl);
  //     setLinkButtonToolTipContent("Link copied!");
  //   } catch (error) {
  //     // console.error("Failed to copy: ", error);
  //     setLinkButtonToolTipContent("Failed to copy!");
  //   }
  //   setTimeout(() => setLinkButtonToolTipContent("Copy file link to clipboard"), 2000);
  // };

  useEffect(() => {
    console.log(selectedFiles);
    console.log(uploadProgress);
  }, [selectedFiles, uploadProgress]);

  const handle_OnDeselectFileClick = async (fileName) => {
    try {
      const updatedFiles = selectedFiles.filter((file) => {
        return fileName !== file.name;
      });
      setSelectedFiles(updatedFiles);

      const updatedProgressFiles = Object.fromEntries(
        Object.entries(uploadProgress).filter(([key, value]) => key !== fileName)
      );
      setUploadProgress(updatedProgressFiles);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Page_BoilerPlate>
      {!isUploadClicked && <FileDropZone onFileSelect={handle_FileSelect} />}

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 w-full mx-auto mt-6 text-copy-primary">
          <div className="border-b border-gray-700 p-2 text-left font-bold">Name</div>
          <div className="border-b border-gray-700 p-2 text-left font-bold">Size</div>
          <div className="border-b border-gray-700 p-2 text-left font-bold">Type</div>

          {selectedFiles.map((file) => (
            <React.Fragment key={file.name}>
              <div className="border-gray-700 p-2 text-left overflow-hidden truncate">{file.name}</div>
              <div className="border-gray-700 p-2 text-left overflow-hidden truncate">
                {fileSizeFormatter(file.size)}
              </div>
              <div className="border-gray-700 p-2 text-left flex">
                <p className="flex-grow overflow-hidden truncate">{file.type}</p>
                {!isUploadClicked && (
                  <button className="text-red-500 font-bold px-2" onClick={() => handle_OnDeselectFileClick(file.name)}>
                    X
                  </button>
                )}
              </div>

              <div className="col-span-3 pb-4">
                {uploadProgress[file.name] !== undefined ? (
                  <div>
                    {/* <div className="text-sm">{uploadProgress[file.name]}%</div> */}
                    <div className="bg-gray-200 h-1 w-full mt-2">
                      <div className="bg-blue-500 h-1" style={{ width: `${uploadProgress[file.name]}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-copy-secondary">waiting...</div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && !isUploadClicked && (
        <div className="flex mt-5">
          <button
            onClick={handle_FileUpload}
            className="p-2 rounded flex items-center justify-center w-full font-bold bg-cta hover:bg-cta-active text-cta-text transition duration-500 ease-in-out"
          >
            <BsUpload className="mx-2 stroke-1" size={20} /> Upload
          </button>
        </div>
      )}

      {isUploading && <PageExitAlert />}

      {/* Reselect File */}
      {uploadStatus && (
        <>
          <button
            className="m-2 text-copy-primary hover:text-copy-opp hover:bg-background-opp p-1 rounded-md"
            onClick={handle_ReselectFile}
            data-tooltip-id="id_reselect_button"
            data-tooltip-content={reselectButtonToolTipContent}
          >
            <BsPlusLg size={25} />
          </button>
          <Tooltip
            id="id_reselect_button"
            style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
            opacity={0.9}
            place="bottom"
          />
        </>
      )}
    </Page_BoilerPlate>
  );
}

export default Home;
