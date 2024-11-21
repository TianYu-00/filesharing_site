import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import {
  fetchFilesByUserId,
  deleteFileById,
  downloadFileByID,
  renameFileById,
  getDownloadLinksByFileId,
  createDownloadLinkByFileId,
} from "../api";
import { fileSizeFormatter, fileDateFormatter } from "../components/File_Formatter";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { BsFillTrashFill } from "react-icons/bs";

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

  const [currentSelectedFile, setCurrentSelectedFile] = useState(null);

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

  const toggleFileMenu = (id) => {
    setOpenFileMenu(openFileMenu === id ? null : id);
  };

  const handle_FileDelete = async (id) => {
    try {
      const response = await deleteFileById(id);
      if (response.success) {
        setFiles(files.filter((file) => file.id !== id));
        console.log("File has been removed");
      } else {
        console.log("Failed to remove file");
      }
    } catch (err) {
      console.error("Error removing file:", err);
    }
  };

  const handle_FileDownload = async (id) => {
    try {
      const file = files.find((currentFile) => currentFile.id === id);
      if (!file) {
        console.error("File not found");
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
      console.error("Failed to download file:", err);
    }
  };

  const handle_OnClickFileRename = async (file) => {
    setCurrentSelectedFile(file);
    setIsRenameModalOpen(true);
  };

  const handle_FileRename = async () => {
    try {
      if (!currentSelectedFile) {
        console.error("Current selected file missing");
      }

      const file = files.find((currentFile) => currentFile.id === currentSelectedFile.id);
      if (!file) {
        console.error("File not found");
        return;
      }

      if (!fileRenameString) {
        console.error("File name string missing");
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
      } else {
        console.error("Failed to rename file");
      }
    } catch (err) {
      console.error("Failed to rename file", err);
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
      console.log(response.data);
      setListOfDownloadLinks(response.data);
    } catch (err) {
      console.error("Failed to fetch download link", err);
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
        console.log(response.data);
        setCreateLinkExpiresAt("");
        setCreateLinkDownloadLimit("");
        setCreateLinkPassword("");
        setListOfDownloadLinks((prevLinks) => [...prevLinks, response.data]);
      } else {
        console.error("Failed to create download link");
      }
    } catch (err) {
      console.error("Failed to create download link", err);
    }
  };

  return (
    <div className="pt-20">
      {/* MyFiles Landing Page */}
      {/* <div className="flex justify-center text-white">MyFiles Landing Page</div> */}

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
            className="p-1"
            onChange={(e) => setFileRenameString(e.target.value)}
            value={fileRenameString}
            placeholder="enter new name here"
          />
          <button
            className="text-white bg-blue-500 transition duration-500 ease-in-out hover:bg-green-500 p-1 rounded mx-4"
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
                          }}
                        >
                          {currentLink.download_url}
                        </div>
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
                          <button className="">X</button>
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
              <label className="text-white">Expires At</label>
              <input
                type="datetime-local"
                className="mb-2 p-1 rounded"
                value={createLinkExpiresAt}
                onChange={(e) => setCreateLinkExpiresAt(e.target.value)}
              ></input>
              {/* Download Limit  */}
              <label className="text-white">Download Limit</label>
              <input
                type="number"
                className="mb-2 p-1 rounded"
                value={createLinkDownloadLimit}
                onChange={(e) => setCreateLinkDownloadLimit(e.target.value)}
              ></input>
              {/* Password */}
              <label className="text-white">Link Password</label>
              <input
                type="password"
                className="mb-2 p-1 rounded"
                autoComplete="new-password"
                value={createLinkPassword}
                onChange={(e) => setCreateLinkPassword(e.target.value)}
              ></input>

              <div className="flex justify-end">
                <button
                  className="text-white bg-blue-500 hover:bg-green-500 p-2 rounded"
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
            <th className="px-2 py-2 ">Name</th>
            <th className="px-2 py-2">Size</th>
            <th className="px-2 py-2">Uploaded</th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>

        <tbody className="">
          {Array.isArray(files) && files.length > 0 ? (
            files.map((file) => {
              return (
                <tr key={file.id} className="hover:bg-neutral-900 border-b border-gray-500">
                  <td className="px-2 py-1 ">{file.originalname}</td>
                  <td className="px-2 py-1 ">{fileSizeFormatter(file.size)}</td>
                  <td className="px-2 py-1 ">{fileDateFormatter(file.created_at)[1]}</td>
                  <td className="px-2 py-1 ">
                    <div className="relative flex justify-end">
                      <button className="p-2 rounded-full hover:bg-black" onClick={() => toggleFileMenu(file.id)}>
                        <BsThreeDotsVertical size={17} />
                      </button>
                      {openFileMenu === file.id && (
                        <div className="absolute right-0 mt-8 bg-neutral-700 shadow-lg rounded z-10" ref={fileMenuRef}>
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
                            onClick={() => handle_FileDelete(file.id)}
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

// Notes:
// Some things i want:
// Original Name, Size, Created At, Dropdown menu
// Now i need some notification or alerts of some sort to help with user feedbacks

// Download - Download the file directly 🔴

// Rename - Rename the file (need to create api call for this: patch files/update/:file_id) 🔴

// Manage link - Where i handle download link generation, link password protections, set download limits for the link. Maybe create a modal for it. Lots to do, maybe do this last when im finished with the other buttons. 🔴

// Delete - Delete file 🟢

// NOTE: NEED TO ADD SOME USER VISUAL FEEDBACKS but for now, just work on my features.
// prob should change err to error too for the new habit of using try catch snippets @.@
