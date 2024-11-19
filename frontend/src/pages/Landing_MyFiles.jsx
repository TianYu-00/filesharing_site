import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import { fetchFilesByUserId, deleteFileById, downloadFileByID } from "../api";
import { fileSizeFormatter, fileDateFormatter_DateOnly } from "../components/File_Formatter";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

function Landing_MyFiles() {
  const navigate = useNavigate();
  const { user, isLoadingUser } = useUser();
  const [files, setFiles] = useState([]);
  const [openFileMenu, setOpenFileMenu] = useState(null);
  const fileMenuRef = useRef(null);

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

  return (
    <div className="pt-20">
      {/* MyFiles Landing Page */}
      {/* <div className="flex justify-center text-white">MyFiles Landing Page</div> */}
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
                          <button className="p-2 hover:bg-neutral-800 w-full text-left rounded">Rename</button>
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
