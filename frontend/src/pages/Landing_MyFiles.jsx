import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import {
  fetchFilesByUserId,
  deleteFileById,
  downloadFileByID,
  renameFileById,
  getDownloadLinksByFileId,
  createDownloadLinkByFileId,
  removeDownloadLinkByLinkId,
} from "../api";
import { fileSizeFormatter, fileDateFormatter } from "../components/File_Formatter";
import { BsThreeDotsVertical, BsArrowUp, BsArrowDown } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";

function Landing_MyFiles() {
  const navigate = useNavigate();
  const { user, isLoadingUser } = useUser();
  const [files, setFiles] = useState([]);
  const [openFileMenu, setOpenFileMenu] = useState(null);
  const fileMenuRef = useRef(null);

  // rename
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [fileRenameString, setFileRenameString] = useState("");

  // manage link
  const [isManageLinkModalOpen, setIsManageLinkModalOpen] = useState(false);
  const [listOfDownloadLinks, setListOfDownloadLinks] = useState([]);
  const [createLinkExpiresAt, setCreateLinkExpiresAt] = useState("");
  const [createLinkDownloadLimit, setCreateLinkDownloadLimit] = useState("");
  const [createLinkPassword, setCreateLinkPassword] = useState("");

  // delete confirmation
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

  const [currentSelectedFile, setCurrentSelectedFile] = useState(null);

  const [fileMenuDropdownPosition, setFileMenuDropdownPosition] = useState("down");

  // tooltips
  const [manageLink_LinkTooltip, setManageLink_LinkTooltip] = useState("Click to copy link");

  // sort
  const [fileSortingConfig, setFileSortingConfig] = useState({ sortByKey: "name", direction: "asc" });

  const sortedFiles = React.useMemo(() => {
    if (!files.length) return [];

    const { sortByKey, direction } = fileSortingConfig;

    const getValue = (file) => {
      switch (sortByKey) {
        case "name":
          return file.originalname.toLowerCase();
        case "created_at":
          return new Date(file.created_at);
        case "size":
          return file.size;
        default:
          return file[sortByKey];
      }
    };

    const sortedList = [...files].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);
      console.log("A:", valueA, "B:", valueB);

      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortedList;
  }, [files, fileSortingConfig]);

  const handle_FileSorting = (sortByKey) => {
    setFileSortingConfig((prevConfig) => {
      const isSameSortByKey = prevConfig.sortByKey === sortByKey;
      const newDirection = isSameSortByKey && prevConfig.direction === "asc" ? "desc" : "asc";
      return { sortByKey, direction: newDirection };
    });
  };

  useEffect(() => {
    if (!user && !isLoadingUser) {
      setTimeout(() => navigate("/login"), 0);
    }
  }, [user, isLoadingUser]);

  useEffect(() => {
    const getFiles = async () => {
      const allFiles = await fetchFilesByUserId(user.id);
      //   console.log(allFiles.data);
      setFiles(allFiles.data);
    };

    if (user) {
      getFiles();
    }
  }, [user]);

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

  const getFileButtonDropdownPosition = (buttonElement) => {
    const buttonRect = buttonElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;

    return spaceBelow < 200 ? "up" : "down";
  };

  const handle_FileMenuClick = (fileId, buttonElement) => {
    // need to get button position
    // calculate how much space between button - bottom
    // if its less than x value make it up else down

    const dropdownPosition = getFileButtonDropdownPosition(buttonElement);
    setOpenFileMenu(openFileMenu === fileId ? null : fileId);
    setFileMenuDropdownPosition(dropdownPosition);
  };

  const handle_OnClickDelete = async (file) => {
    setCurrentSelectedFile(file);
    setIsDeleteConfirmModalOpen(true);
  };

  const handle_FileDelete = async (id) => {
    try {
      const response = await deleteFileById(id);
      // console.log(response);
      if (response.success) {
        setIsDeleteConfirmModalOpen(false);
        setCurrentSelectedFile(null);
        setFiles(files.filter((file) => file.id !== id));
        toast.success(response?.msg || "File has been removed");
      } else {
        // console.log("Failed to remove file");
        toast.error(response?.msg || "Failed to delete file");
      }
    } catch (err) {
      // console.error("Error removing file:", err);
      toast.error(err?.response?.data?.msg || "Failed to delete file");
    }
  };

  const handle_FileDownload = async (id) => {
    try {
      const file = files.find((currentFile) => currentFile.id === id);
      if (!file) {
        // console.error("File not found");
        toast.error("File not found");
        return;
      }

      const fileBlob = await downloadFileByID(file.id);
      const url = URL.createObjectURL(new Blob([fileBlob]));

      const triggerDownload = (url, filename) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = filename;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      triggerDownload(url, file.originalname);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to download file");
    }
  };

  const handle_OnClickFileRename = async (file) => {
    setCurrentSelectedFile(file);
    setFileRenameString(file.originalname.split(".").slice(0, -1).join("."));
    setIsRenameModalOpen(true);
  };

  const handle_FileRename = async () => {
    try {
      if (!currentSelectedFile) {
        // console.error("Current selected file missing");
        toast.error("Current selected file is missing");
        return;
      }

      const file = files.find((currentFile) => currentFile.id === currentSelectedFile.id);
      if (!file) {
        // console.error("File not found");
        toast.error("File not found");
        return;
      }

      if (!fileRenameString) {
        // console.error("File name string missing");
        toast.error("Filename can not empty");
        return;
      }

      const extractedFileExtension = currentSelectedFile.originalname.substring(
        currentSelectedFile.originalname.lastIndexOf(".")
      );

      // console.log(fileRenameString + extractedFileExtension);
      const newFileName = fileRenameString + extractedFileExtension;
      const response = await renameFileById(currentSelectedFile.id, newFileName);
      if (response.success) {
        const updatedFiles = files.map((currentFile) => {
          if (currentFile.id === currentSelectedFile.id) {
            return { ...currentFile, originalname: newFileName };
          }
          return currentFile;
        });

        setFiles(updatedFiles);

        setIsRenameModalOpen(false);
        setFileRenameString("");
        setCurrentSelectedFile(null);
        toast.success("Renamed successfully");
      } else {
        // console.error("Failed to rename file");
        toast.error("Failed to rename file");
      }
    } catch (err) {
      // console.error("Failed to rename file", err);
      toast.error(err?.response?.data?.msg || "Failed to rename file");
    }
  };

  const handle_OnClickManageLink = async (file) => {
    setCurrentSelectedFile(file);
    setIsManageLinkModalOpen(true);
    fetchDownloadLinks(file.id);
  };

  const fetchDownloadLinks = async (file_id) => {
    // listOfDownloadLinks, setListOfDownloadLinks
    try {
      const response = await getDownloadLinksByFileId(file_id);
      // console.log(response.data);
      setListOfDownloadLinks(response.data);
    } catch (err) {
      // console.error("Failed to fetch download link", err);
      toast.error(err?.response?.data?.msg || "Failed to fetch download links");
    }
  };

  //

  const handle_CreateDownloadLink = async (e, file_id) => {
    e.preventDefault();
    try {
      const tempExpiresAt = createLinkExpiresAt || null;
      const tempDownloadLimit = createLinkDownloadLimit || null;
      const tempPassword = createLinkPassword || null;

      const response = await createDownloadLinkByFileId(file_id, tempExpiresAt, tempDownloadLimit, tempPassword);
      if (response.success) {
        // console.log(response.data);
        setCreateLinkExpiresAt("");
        setCreateLinkDownloadLimit("");
        setCreateLinkPassword("");
        const newLinks = {
          ...response.data,
          password: !!tempPassword,
        };
        setListOfDownloadLinks((prevLinks) => [...prevLinks, newLinks]);
        toast.success("Download link has been created");
      } else {
        // console.error("Failed to create download link");
        toast.error("Failed to create download link");
      }
    } catch (err) {
      // console.error("Failed to create download link", err);
      toast.error(err?.response?.data?.msg || "Failed to create download link");
    }
  };

  const handle_DeleteDownloadLinkById = async (link_id) => {
    try {
      // console.log(link_id);
      const response = await removeDownloadLinkByLinkId(link_id);
      if (response.success) {
        // console.log("Download Link removed");
        setListOfDownloadLinks(listOfDownloadLinks.filter((link) => link.id !== link_id));
        toast.success("Download link has been deleted");
      } else {
        // console.error("Failed to delete download link");
        toast.error("Failed to delete download link");
      }
    } catch (err) {
      // console.error("Failed to delete download link", err);
      toast.error(err?.response?.data?.msg || "Failed to delete download link");
    }
  };

  return (
    <div className="pt-20">
      {/* Delete Confirmation Modal */}
      {isDeleteConfirmationModalOpen && (
        <Modal
          isOpen={isDeleteConfirmationModalOpen}
          onClose={() => {
            setIsDeleteConfirmModalOpen(false);
            setCurrentSelectedFile(null);
          }}
          modalTitle={`Delete Confirmation`}
        >
          <p className="text-white text-lg mb-4">Are you sure you want to delete the file?</p>
          <p className="text-white text-lg mb-4">{currentSelectedFile.originalname}</p>
          <div className="flex justify-center items-align space-x-6">
            <button
              className="bg-blue-500 font-bold p-2 rounded text-white hover:bg-blue-700 transition duration-500 ease-in-out"
              onClick={() => {
                setIsDeleteConfirmModalOpen(false);
                setCurrentSelectedFile(null);
              }}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 font-bold p-2 rounded text-white hover:bg-red-700 transition duration-500 ease-in-out"
              onClick={() => {
                handle_FileDelete(currentSelectedFile.id);
              }}
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <Modal
          isOpen={isRenameModalOpen}
          onClose={() => {
            setIsRenameModalOpen(false);
            setFileRenameString("");
            setCurrentSelectedFile(null);
          }}
          modalTitle={`Rename: ${currentSelectedFile.originalname}`}
        >
          <input
            className="my-2 p-1 rounded mx-1"
            onChange={(e) => setFileRenameString(e.target.value)}
            value={fileRenameString}
            placeholder="Enter new name here"
          />
          <button
            className="text-white bg-blue-500 transition duration-500 ease-in-out hover:bg-blue-700 px-2 p-1 rounded font-bold ml-2"
            onClick={() => handle_FileRename()}
          >
            Update
          </button>
        </Modal>
      )}

      {/* Manage Links Modal */}
      {isManageLinkModalOpen && (
        <Modal
          isOpen={isManageLinkModalOpen}
          onClose={() => {
            setIsManageLinkModalOpen(false);
            setCreateLinkExpiresAt("");
            setCreateLinkDownloadLimit("");
            setCreateLinkPassword("");
            setCurrentSelectedFile(null);
          }}
          modalTitle={`Manage Links: ${currentSelectedFile.originalname}`}
        >
          <div className="overflow-auto">
            <div className="overflow-y-auto">
              <div className="flex flex-col w-full text-white">
                <div className="flex border-b-2 border-gray-500">
                  <div className="px-2 py-2 w-1/4 ">Link</div>
                  <div className="px-2 py-2 w-1/4 ">Expires</div>
                  <div className="px-2 py-2 w-1/4 ">Limit</div>
                  <div className="px-2 py-2 w-1/4 ">Password</div>
                  <div className="px-2 py-2 w-8"></div>
                </div>

                <div className="max-h-[200px]">
                  {listOfDownloadLinks && listOfDownloadLinks.length > 0 ? (
                    listOfDownloadLinks.map((currentLink) => (
                      <div key={currentLink.id} className="flex hover:bg-neutral-900 border-b border-gray-500">
                        <div
                          className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate cursor-pointer "
                          onClick={async () => {
                            const fullUrl = `${window.location.origin}/files/download/${currentLink.download_url}`;
                            await navigator.clipboard.writeText(fullUrl);
                            setManageLink_LinkTooltip("Link copied!");
                            setTimeout(() => setManageLink_LinkTooltip("Click to copy link"), 2000);
                          }}
                          data-tooltip-id="id_managelink_link"
                          data-tooltip-content={manageLink_LinkTooltip}
                        >
                          {currentLink.download_url}
                        </div>
                        <Tooltip
                          id="id_managelink_link"
                          style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
                          opacity={0.9}
                          place="bottom"
                        />
                        <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                          {fileDateFormatter(currentLink.expires_at)[2]}
                        </div>
                        <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                          {currentLink.download_count}/{currentLink.download_limit || "Null"}
                        </div>
                        <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                          {currentLink.password ? "Yes" : "No"}
                        </div>
                        <div className="px-2 py-1 whitespace-nowrap overflow-hidden truncate text-red-500 font-bold w-8 ">
                          <button className="" onClick={() => handle_DeleteDownloadLinkById(currentLink.id)}>
                            X
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full border-b my-8"></div>

            <form className="grid">
              {/* Expires At */}
              <label className="text-white mx-3">Expires At</label>
              <input
                type="datetime-local"
                className="mb-2 p-1 rounded mx-3"
                value={createLinkExpiresAt}
                onChange={(e) => setCreateLinkExpiresAt(e.target.value)}
              ></input>
              {/* Download Limit  */}
              <label className="text-white mx-3">Download Limit</label>
              <input
                type="number"
                className="mb-2 p-1 rounded mx-3"
                value={createLinkDownloadLimit}
                onChange={(e) => setCreateLinkDownloadLimit(e.target.value)}
              ></input>
              {/* Password */}
              <label className="text-white mx-3">Link Password</label>
              <input
                type="password"
                className="mb-2 p-1 rounded mx-3"
                autoComplete="new-password"
                value={createLinkPassword}
                onChange={(e) => setCreateLinkPassword(e.target.value)}
              ></input>

              <div className="flex justify-end mx-3">
                <button
                  className="text-white bg-blue-500 hover:bg-blue-700 p-2 rounded font-bold transition duration-500 ease-in-out mt-2 "
                  onClick={(e) => handle_CreateDownloadLink(e, currentSelectedFile.id)}
                >
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      <table className="table-auto w-full text-white text-left">
        <thead className="border-b-2 border-gray-500">
          <tr>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handle_FileSorting("name")}>
              <div className="flex items-center select-none">
                Name
                {fileSortingConfig.sortByKey === "name" &&
                  (fileSortingConfig.direction === "asc" ? (
                    <BsArrowUp className="ml-1 stroke-1" />
                  ) : (
                    <BsArrowDown className="ml-1 stroke-1" />
                  ))}
              </div>
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handle_FileSorting("size")}>
              <div className="flex items-center select-none">
                Size
                {fileSortingConfig.sortByKey === "size" &&
                  (fileSortingConfig.direction === "asc" ? (
                    <BsArrowUp className="ml-1 stroke-1" />
                  ) : (
                    <BsArrowDown className="ml-1 stroke-1" />
                  ))}
              </div>
            </th>
            <th className="px-2 py-2 cursor-pointer" onClick={() => handle_FileSorting("created_at")}>
              <div className="flex items-center select-none">
                Uploaded
                {fileSortingConfig.sortByKey === "created_at" &&
                  (fileSortingConfig.direction === "asc" ? (
                    <BsArrowUp className="ml-1 stroke-1" />
                  ) : (
                    <BsArrowDown className="ml-1 stroke-1" />
                  ))}
              </div>
            </th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>

        <tbody>
          {sortedFiles.length > 0 ? (
            sortedFiles.map((file) => {
              return (
                <tr key={file.id} className="hover:bg-neutral-900 border-b border-gray-500">
                  <td className="px-2 py-1 whitespace-nowrap overflow-hidden truncate max-w-24 ">
                    {file.originalname}
                  </td>
                  <td className="px-2 py-1 ">{fileSizeFormatter(file.size)}</td>
                  <td className="px-2 py-1 ">{fileDateFormatter(file.created_at)[1]}</td>
                  <td className="px-2 py-1 ">
                    <div className="relative flex justify-end pr-2">
                      <button
                        className="p-2 rounded-md hover:text-black hover:bg-gray-100"
                        onClick={(e) => handle_FileMenuClick(file.id, e.target)}
                      >
                        <BsThreeDotsVertical size={17} className="" />
                      </button>
                      {openFileMenu === file.id && (
                        <div
                          className={`absolute right-0 mt-1 ${
                            fileMenuDropdownPosition === "up" ? "bottom-full" : "top-full"
                          } bg-neutral-700 shadow-lg rounded z-10`}
                          ref={fileMenuRef}
                        >
                          <button
                            className="p-2 hover:bg-neutral-800 w-full text-left rounded"
                            onClick={() => handle_FileDownload(file.id)}
                          >
                            Download
                          </button>
                          <button
                            className="p-2 hover:bg-neutral-800 w-full text-left rounded"
                            onClick={() => handle_OnClickFileRename(file)}
                          >
                            Rename
                          </button>
                          <button
                            className="p-2 hover:bg-neutral-800 w-full text-left rounded"
                            onClick={() => handle_OnClickManageLink(file)}
                          >
                            Manage Link
                          </button>
                          <button
                            className="p-2 hover:bg-neutral-800 w-full text-left rounded"
                            // onClick={() => handle_FileDelete(file.id)}
                            onClick={() => handle_OnClickDelete(file)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Landing_MyFiles;
