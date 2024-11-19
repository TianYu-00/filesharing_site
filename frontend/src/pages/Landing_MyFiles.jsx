import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import { fetchFilesByUserId, deleteFileById, downloadFileByID, renameFileById } from "../api";
import { fileSizeFormatter, fileDateFormatter_DateOnly } from "../components/File_Formatter";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

function Landing_MyFiles() {
  const navigate = useNavigate();
  const { user, isLoadingUser } = useUser();
  const [files, setFiles] = useState([]);
  const [openFileMenu, setOpenFileMenu] = useState(null);
  const fileMenuRef = useRef(null);

  // rename
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [fileRenameString, setFileRenameString] = useState("");

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

  return (
    <div className="pt-20">
      {/* MyFiles Landing Page */}
      {/* <div className="flex justify-center text-white">MyFiles Landing Page</div> */}
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
                  <td className="px-2 py-1 ">{fileDateFormatter_DateOnly(file.created_at)}</td>
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
                          <button className="p-2 hover:bg-neutral-800 w-full text-left rounded">Manage Link</button>
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
