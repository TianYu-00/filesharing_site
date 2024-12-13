import React, { useEffect, useState, useRef } from "react";
import { uploadFile } from "../api";
import { fileSizeFormatter } from "../components/File_Formatter";
import FileDropZone from "../components/File_DropZone";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

//
import { BsUpload, BsLink45Deg, BsBoxArrowRight, BsPlusLg, BsThreeDotsVertical } from "react-icons/bs";

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
  const [downloadLinks, setDownloadLinks] = useState({});
  const [isUploadClicked, setIsUploadClicked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [reselectButtonToolTipContent, setReselectButtonToolTipContent] = useState("Upload more files");

  //
  const [openFileMenu, setOpenFileMenu] = useState(null);
  const [fileMenuDropdownPosition, setFileMenuDropdownPosition] = useState("down");
  const fileMenuRef = useRef(null);

  //
  const { user } = useUser();

  // file counter
  const [fileCounter, setFileCounter] = useState(0);

  useEffect(() => {
    // console.log(user);
  }, [user]);

  const handle_ReselectFile = async () => {
    window.location.replace(window.location.href);
  };

  const handle_OnClickDownloadPage = (fileId) => {
    const fileDownloadLink = downloadLinks[fileId];
    window.open(`/files/download/${fileDownloadLink}`, "_blank");
    setOpenFileMenu(null);
  };

  const handle_FileSelect = (newFiles) => {
    setSelectedFiles((prevFiles) => {
      const filesWithIds = Array.from(newFiles).map((file, index) => {
        const uniqueId = fileCounter + index + 1;
        file.id = uniqueId;
        return file;
      });

      setFileCounter(fileCounter + newFiles.length);

      return [...prevFiles, ...filesWithIds];
    });

    setUploadProgress((prevProgress) => {
      const updatedProgress = { ...prevProgress };
      Array.from(newFiles).forEach((file) => {
        if (!updatedProgress[file.id]) {
          updatedProgress[file.id] = 0;
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
          const result = await uploadFile(formData, (progressEvent) => {
            const percentCount = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progressState[file.id] = percentCount;

            setUploadProgress((prevProgress) => ({
              ...prevProgress,
              [file.id]: percentCount,
            }));
          });
          setDownloadLinks((prevLinks) => ({
            ...prevLinks,
            [file.id]: result.data?.downloadLink?.download_url,
          }));
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

  const handle_OnClickCopyLink = async (fileId) => {
    try {
      const fileDownloadLink = downloadLinks[fileId];
      const fullUrl = `${window.location.origin}/files/download/${fileDownloadLink}`;
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied");
    } catch (error) {
      // console.error("Failed to copy: ", error);
      toast.error("Failed to copy link");
    } finally {
      setOpenFileMenu(null);
    }
  };

  useEffect(() => {
    // console.log(selectedFiles);
    // console.log(uploadProgress);
  }, [selectedFiles, uploadProgress]);

  const handle_OnDeselectFileClick = async (fileId) => {
    try {
      const updatedFiles = selectedFiles.filter((file) => {
        return fileId !== file.id;
      });
      setSelectedFiles(updatedFiles);

      setUploadProgress((prevProgress) => {
        const updatedProgress = { ...prevProgress };
        delete updatedProgress[fileId];
        return updatedProgress;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getFileButtonDropdownPosition = (buttonElement) => {
    const buttonRect = buttonElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;

    return spaceBelow < 200 ? "up" : "down";
  };

  const handle_FileMenuClick = (fileId, buttonElement) => {
    const dropdownPosition = getFileButtonDropdownPosition(buttonElement);
    setOpenFileMenu(openFileMenu === fileId ? null : fileId);
    setFileMenuDropdownPosition(dropdownPosition);
  };

  useEffect(() => {
    const handle_OutOfContentClick = (event) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) {
        setOpenFileMenu(null);
      }
    };

    document.addEventListener("mousedown", handle_OutOfContentClick);

    return () => {
      document.removeEventListener("mousedown", handle_OutOfContentClick);
    };
  }, []);

  return (
    <Page_BoilerPlate>
      {!isUploadClicked && <FileDropZone onFileSelect={handle_FileSelect} />}

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 w-full mx-auto mt-6 text-copy-primary">
          <div className="border-b border-gray-700 p-2 text-left font-bold">Name</div>
          <div className="border-b border-gray-700 p-2 text-left font-bold">Size</div>
          <div className="border-b border-gray-700 p-2 text-left font-bold">Type</div>

          {selectedFiles.map((file) => (
            <React.Fragment key={file.id}>
              <div className="border-gray-700 p-2 text-left overflow-hidden truncate">{file.name}</div>
              <div className="border-gray-700 p-2 text-left overflow-hidden truncate">
                {fileSizeFormatter(file.size)}
              </div>
              <div className="border-gray-700 p-2 text-left flex">
                <p className="flex-grow overflow-hidden truncate">{file.type}</p>
                {!isUploadClicked && (
                  <button className="text-red-500 font-bold px-2" onClick={() => handle_OnDeselectFileClick(file.id)}>
                    X
                  </button>
                )}

                {isUploadClicked && uploadStatus && (
                  <div className="relative">
                    <button
                      className="px-2 py-1 rounded-md hover:text-copy-opp hover:bg-background-opp"
                      onClick={(e) => {
                        handle_FileMenuClick(file.id, e.target);
                      }}
                    >
                      <BsThreeDotsVertical size={17} />
                    </button>
                    {openFileMenu === file.id && (
                      <div
                        className={`absolute right-0 mt-1 w-40 shadow-lg rounded z-10 ${
                          fileMenuDropdownPosition === "up" ? "bottom-full" : "top-full"
                        } bg-card text-copy-primary`}
                        ref={fileMenuRef}
                      >
                        <button
                          className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded"
                          onClick={() => handle_OnClickDownloadPage(file.id)}
                        >
                          Download
                        </button>
                        <button
                          className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded"
                          onClick={() => handle_OnClickCopyLink(file.id)}
                        >
                          Share
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="col-span-3 pb-4">
                {uploadProgress[file.id] !== undefined ? (
                  <div>
                    {/* <div className="text-sm">{uploadProgress[file.name]}%</div> */}
                    <div className="bg-gray-200 h-1 w-full mt-2">
                      <div className="bg-blue-500 h-1" style={{ width: `${uploadProgress[file.id]}%` }}></div>
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
