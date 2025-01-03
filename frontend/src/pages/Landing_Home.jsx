import React, { useEffect, useState, useRef } from "react";
import { uploadFile } from "../api";
import { fileSizeFormatter } from "../components/File_Formatter";
import FileDropZone from "../components/File_DropZone";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import PageExitAlert from "../components/PageExitAlert";
import { TbDotsVertical, TbFilePlus, TbX, TbDownload, TbShare, TbFile, TbCheck, TbClock } from "react-icons/tb";
import DropdownMenu from "../components/DropdownMenu";

// rfce snippet

function Home() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState({});
  const [isUploadClicked, setIsUploadClicked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileCounter, setFileCounter] = useState(0);
  const { user } = useUser();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [reselectButtonToolTipContent, setReselectButtonToolTipContent] = useState("Upload more files");

  useEffect(() => {
    // console.log(user);
  }, [user]);

  const handle_ReselectFile = async () => {
    window.location.replace(window.location.href);
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
      toast.info("Don't close or refresh during upload.");

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
          // toast.success(`File ${file.name} uploaded successfully`);
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

  const handle_OnClickDownloadPage = (fileId) => {
    console.log(fileId);
    const fileDownloadLink = downloadLinks[fileId];
    window.open(`/files/download/${fileDownloadLink}`, "_blank");
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

  const handle_MenuClick = (fileId) => {
    setOpenMenuId((prevMenuId) => (prevMenuId === fileId ? null : fileId));
  };

  return (
    <Page_BoilerPlate>
      {!isUploadClicked && <FileDropZone onFileSelect={handle_FileSelect} />}

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          {selectedFiles.map((file) => (
            <React.Fragment key={file.id}>
              <div className="text-copy-primary flex flex-row my-4 bg-card py-2 rounded shadow">
                {/* 1 */}
                <div className="flex items-center">
                  <TbFile className="h-14 w-14" />
                </div>

                {/* 2 */}
                <div className="flex flex-col w-full gap-2 px-3">
                  <div className="flex items-center w-full">
                    <p className="text-left truncate flex-grow w-0">{file.name}</p>
                    <span className="text-left text-sm text-copy-secondary w-20 text-right">
                      {fileSizeFormatter(file.size)}
                    </span>
                  </div>
                  <div className="flex items-center w-full">
                    <div className="bg-gray-200 h-2 flex-grow rounded mr-2">
                      <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress[file.id]}%` }}></div>
                    </div>
                    {uploadProgress[file.id] !== 100 ? (
                      uploadProgress[file.id] !== 0 ? (
                        <span className="text-sm text-copy-secondary w-12 text-right">{uploadProgress[file.id]}%</span>
                      ) : (
                        <TbClock size={17} className="text-blue-500 w-12 text-right" />
                      )
                    ) : (
                      <TbCheck size={17} className="text-green-500 w-12 text-right" />
                    )}
                  </div>
                </div>

                {/* 3 */}
                <div className="flex items-center">
                  <div className="relative">
                    <button
                      className="p-2 rounded-md hover:bg-background-opp/10 text-copy-primary"
                      onClick={() => handle_MenuClick(file.id)}
                      aria-label="File dropdown menu"
                    >
                      <TbDotsVertical size={17} strokeWidth={3} />
                    </button>
                    <DropdownMenu
                      isOpen={openMenuId === file.id}
                      setIsOpen={(isOpen) => {
                        if (!isOpen) {
                          setOpenMenuId(null);
                        }
                      }}
                    >
                      <div className="text-copy-primary">
                        {uploadProgress[file.id] === 100 && (
                          <>
                            <button
                              className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                              onClick={() => {
                                handle_OnClickDownloadPage(file.id);
                                setOpenMenuId(null);
                              }}
                            >
                              <TbDownload size={17} className="mr-2" />
                              Download
                            </button>
                            <button
                              className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                              onClick={() => {
                                handle_OnClickCopyLink(file.id);
                                setOpenMenuId(null);
                              }}
                            >
                              <TbShare size={17} className="mr-2" />
                              Share
                            </button>
                          </>
                        )}

                        {!isUploadClicked && (
                          <button
                            className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                            onClick={() => {
                              handle_OnDeselectFileClick(file.id);
                              setOpenMenuId(null);
                            }}
                          >
                            <TbX size={17} className="mr-2" />
                            Remove
                          </button>
                        )}
                      </div>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && !isUploadClicked && (
        <div className="flex mt-5">
          <button
            onClick={handle_FileUpload}
            className="p-2 rounded flex items-center justify-center w-full font-medium bg-cta hover:bg-cta-active text-cta-text transition duration-500 ease-in-out"
          >
            Upload
          </button>
        </div>
      )}

      {isUploading && <PageExitAlert />}

      {/* Reselect File */}
      {uploadStatus && (
        <>
          <button
            className="m-2 text-copy-primary hover:bg-background-opp/10 p-2 rounded-md"
            onClick={handle_ReselectFile}
            data-tooltip-id="id_reselect_button"
            data-tooltip-content={reselectButtonToolTipContent}
          >
            <TbFilePlus size={25} />
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
