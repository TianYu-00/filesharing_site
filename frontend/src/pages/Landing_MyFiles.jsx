import React, { useEffect, useState, useRef, useMemo } from "react";
import { useUser } from "../context/UserContext";
import {
  fetchFilesByUserId,
  deleteFileById,
  downloadFileByID,
  renameFileById,
  getDownloadLinksByFileId,
  createDownloadLinkByFileId,
  removeDownloadLinkByLinkId,
  removeManyFilesByFileInfo,
  updateFavouriteFileById,
  updateTrashFileById,
  updateManyTrashFileByFiles,
} from "../api";
import { fileSizeFormatter, fileDateFormatter } from "../components/File_Formatter";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { useSpring, animated } from "@react-spring/web";
import useErrorChecker from "../components/UseErrorChecker";
import PageLoader from "../components/PageLoader";
import FilePreview from "../components/FileViewer";

import {
  TbTrash,
  TbStar,
  TbStarFilled,
  TbFiles,
  TbSearch,
  TbArrowUp,
  TbArrowDown,
  TbMenu2,
  TbDotsVertical,
  TbDownload,
  TbFilePencil,
  TbLink,
  TbStarOff,
  TbTrashX,
  TbArrowBackUp,
  TbX,
  TbEye,
} from "react-icons/tb";
import DeleteConfirmationModal from "../components/MyFiles/DeleteConfirmationModal";

function Landing_MyFiles() {
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const navigate = useNavigate();
  const { user, isLoadingUser } = useUser();
  const [allFiles, setAllFiles] = useState([]);
  const [displayFiles, setDisplayFiles] = useState([]);
  const [openFileMenu, setOpenFileMenu] = useState(null);
  const fileMenuRef = useRef(null);
  const [currentSelectedFile, setCurrentSelectedFile] = useState(null);
  const [fileMenuDropdownPosition, setFileMenuDropdownPosition] = useState("down");

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

  // tooltips
  const [manageLink_LinkTooltip, setManageLink_LinkTooltip] = useState("Click to copy link");

  // sort
  const [fileSortingConfig, setFileSortingConfig] = useState({
    sortByKey: null,
    direction: "asc",
  });

  // selected
  const [listOfSelectedFile, setListOfSelectedFile] = useState([]);

  // sticky options
  const [isToolBarSticky, setIsToolBarSticky] = useState(false);
  const toolBarRef = useRef(null);
  const toolBarParentRef = useRef(null);

  // search
  const [inputSearchTerm, setInputSearchTerm] = useState("");
  const [submitSearchTerm, setSubmitSearchTerm] = useState("");

  // sidebar
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  // button
  const [buttonMenu, setButtonMenu] = useState({
    download: true,
    preview: true,
    rename: true,
    manage_link: true,
    delete: false,
    favourite: true,
    unfavourite: false,
    trash: true,
    restore: false,
  });

  // page state
  const [pageState, setPageState] = useState("all");

  // error handler
  const checkError = useErrorChecker();

  // preview
  const [previewFileDetails, setPreviewFileDetails] = useState({
    isPreviewing: false,
    fileId: "",
    fileLink: "",
    filePassword: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      if (toolBarParentRef.current) {
        const toolbarRect = toolBarParentRef.current.getBoundingClientRect();
        setIsToolBarSticky(toolbarRect.top < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const sortedFiles = useMemo(() => {
    if (!displayFiles.length || !fileSortingConfig.sortByKey) return displayFiles;

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

    const sortedList = [...displayFiles].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);

      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortedList;
  }, [displayFiles, fileSortingConfig]);

  const handle_FileSorting = (sortByKey) => {
    setOpenFileMenu(null);
    setFileSortingConfig((prevConfig) => {
      let newSortByKey = sortByKey;
      let newDirection = "asc";

      if (prevConfig.sortByKey === sortByKey) {
        if (prevConfig.direction === "asc") {
          newDirection = "desc";
        } else if (prevConfig.direction === "desc") {
          newSortByKey = "";
          newDirection = "";
        }
      }

      return { sortByKey: newSortByKey, direction: newDirection };
    });
  };

  useEffect(() => {
    if (!user && !isLoadingUser) {
      setTimeout(() => navigate("/auth"), 0);
    }
  }, [user, isLoadingUser]);

  useEffect(() => {
    const getFiles = async () => {
      try {
        setIsLoadingPage(true);
        const allFiles = await fetchFilesByUserId(user.id);
        setAllFiles(allFiles.data);
        // setDisplayFiles(allFiles.data);
        const allFilesWithoutTrash = allFiles.data.filter((file) => file.trash !== true);
        // console.log(allFilesWithoutTrash);
        setDisplayFiles(allFilesWithoutTrash);
        // console.log(user);
      } catch (err) {
        checkError(err);
      } finally {
        setIsLoadingPage(false);
      }
    };

    if (user) {
      getFiles();
    }
  }, [user]);

  useEffect(() => {
    const handle_OutOfContentClick = (event) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target) && !event.target.closest("tr")) {
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

      if (response.success) {
        setIsDeleteConfirmModalOpen(false);
        setCurrentSelectedFile(null);
        setAllFiles(allFiles.filter((file) => file.id !== id));
        setDisplayFiles(displayFiles.filter((file) => file.id !== id));
        toast.success(response?.msg || "File has been removed");
      } else {
        toast.error(response?.msg || "Failed to delete file");
      }
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "Failed to delete file");
      checkError(err);
    }
  };

  const handle_FileDownload = async (id) => {
    try {
      const file = displayFiles.find((currentFile) => currentFile.id === id);
      if (!file) {
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
      // toast.error(err?.response?.data?.msg || "Failed to download file");
      checkError(err);
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
        toast.error("Current selected file is missing");
        return;
      }

      const file = displayFiles.find((currentFile) => currentFile.id === currentSelectedFile.id);
      if (!file) {
        toast.error("File not found");
        return;
      }

      if (!fileRenameString) {
        toast.error("Filename can not be empty");
        return;
      }

      const extractedFileExtension = currentSelectedFile.originalname.substring(
        currentSelectedFile.originalname.lastIndexOf(".")
      );

      const newFileName = fileRenameString + extractedFileExtension;

      // console.log(newFileName);
      // console.log(currentSelectedFile.originalname);
      if (newFileName === currentSelectedFile.originalname) {
        toast.error("Name is same as original.");
        return;
      }

      const response = await renameFileById(currentSelectedFile.id, newFileName);
      if (response.success) {
        const updatedAllFiles = allFiles.map((currentFile) => {
          if (currentFile.id === currentSelectedFile.id) {
            return response.data;
          }
          return currentFile;
        });

        const updatedDisplayFiles = displayFiles.map((currentFile) => {
          if (currentFile.id === currentSelectedFile.id) {
            return response.data;
          }
          return currentFile;
        });

        setAllFiles(updatedAllFiles);
        setDisplayFiles(updatedDisplayFiles);

        setIsRenameModalOpen(false);
        setFileRenameString("");
        setCurrentSelectedFile(null);
        toast.success("Renamed successfully");
      } else {
        toast.error("Failed to rename file");
      }
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "Failed to rename file");
      checkError(err);
    }
  };

  const handle_OnClickManageLink = async (file) => {
    setCurrentSelectedFile(file);
    setIsManageLinkModalOpen(true);
    fetchDownloadLinks(file.id);
  };

  const fetchDownloadLinks = async (file_id) => {
    try {
      const response = await getDownloadLinksByFileId(file_id);

      setListOfDownloadLinks(response.data);
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "Failed to fetch download links");
      checkError(err);
    }
  };

  const handle_CreateDownloadLink = async (e, file_id) => {
    e.preventDefault();
    try {
      const tempExpiresAt = createLinkExpiresAt || null;
      const tempDownloadLimit = createLinkDownloadLimit || null;
      const tempPassword = createLinkPassword || null;

      const response = await createDownloadLinkByFileId(file_id, tempExpiresAt, tempDownloadLimit, tempPassword);
      if (response.success) {
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
        toast.error("Failed to create download link");
      }
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "Failed to create download link");
      checkError(err);
    }
  };

  const handle_DeleteDownloadLinkById = async (link_id) => {
    try {
      const response = await removeDownloadLinkByLinkId(link_id);
      if (response.success) {
        setListOfDownloadLinks(listOfDownloadLinks.filter((link) => link.id !== link_id));
        toast.success("Download link has been deleted");
      } else {
        toast.error("Failed to delete download link");
      }
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "Failed to delete download link");
      checkError(err);
    }
  };

  // debug
  // useEffect(() => {
  //   console.log(listOfSelectedFile);
  // }, [listOfSelectedFile]);

  const handle_FileSelectedCheckboxChange = (file, isChecked) => {
    setListOfSelectedFile((prevSelectedFiles) =>
      isChecked ? [...prevSelectedFiles, file] : prevSelectedFiles.filter((selectedFile) => selectedFile.id !== file.id)
    );
  };

  const handle_FileSelectAll = (isChecked) => {
    setListOfSelectedFile(isChecked ? sortedFiles : []);
  };

  const handle_RowClickSelected = (file) => {
    if (openFileMenu !== null) {
      setOpenFileMenu(null);
      return;
    }
    const isSelected = listOfSelectedFile.some((selectedFile) => selectedFile.id === file.id);
    handle_FileSelectedCheckboxChange(file, !isSelected);
  };

  const handle_DeleteManyFiles = async () => {
    try {
      const response = await removeManyFilesByFileInfo(listOfSelectedFile);

      if (response.success) {
        const updatedAllFiles = allFiles.filter(
          (file) => !listOfSelectedFile.some((selectedFile) => selectedFile.id === file.id)
        );

        const updatedDisplayFiles = displayFiles.filter(
          (file) => !listOfSelectedFile.some((selectedFile) => selectedFile.id === file.id)
        );

        setAllFiles(updatedAllFiles);
        setDisplayFiles(updatedDisplayFiles);
        setListOfSelectedFile([]);

        const deletedFileCount = response.data.deletedFileCount || 0;
        toast.success(`${deletedFileCount} file(s) deleted successfully`);
      } else {
        toast.error(response.msg || "Failed to delete files");
      }
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "An error occurred while deleting files");
      checkError(err);
    }
  };

  const handle_OnClickSearchFileName = () => {
    setSubmitSearchTerm(inputSearchTerm);
  };

  const filteredFiles = useMemo(() => {
    return sortedFiles.filter((file) => file.originalname.toLowerCase().includes(submitSearchTerm.toLowerCase()));
  }, [sortedFiles, submitSearchTerm]);

  const handle_AllFiles = () => {
    setPageState("all");
    setOpenFileMenu(null);
    setCurrentSelectedFile(null);
    setListOfSelectedFile([]);
    setFileSortingConfig({
      sortByKey: null,
      direction: "asc",
    });
    setInputSearchTerm("");
    setSubmitSearchTerm("");
    const filteredFiles = allFiles.filter((file) => file.trash !== true);
    setDisplayFiles(filteredFiles);
    setButtonMenu({
      download: true,
      preview: true,
      rename: true,
      manage_link: true,
      delete: false,
      favourite: true,
      unfavourite: false,
      trash: true,
      restore: false,
    });
    setIsSideBarOpen(false);
  };

  const handle_AllFavourite = () => {
    setPageState("favourite");
    setOpenFileMenu(null);
    setCurrentSelectedFile(null);
    setListOfSelectedFile([]);
    setFileSortingConfig({
      sortByKey: null,
      direction: "asc",
    });
    setInputSearchTerm("");
    setSubmitSearchTerm("");
    const filteredFiles = allFiles.filter((file) => file.favourite === true && file.trash !== true);
    setDisplayFiles(filteredFiles);
    setButtonMenu({
      download: true,
      preview: true,
      rename: true,
      manage_link: true,
      delete: false,
      favourite: false,
      unfavourite: true,
      trash: true,
      restore: false,
    });
    setIsSideBarOpen(false);
  };

  const handle_AllTrash = () => {
    setPageState("trash");
    setOpenFileMenu(null);
    setCurrentSelectedFile(null);
    setListOfSelectedFile([]);
    setFileSortingConfig({
      sortByKey: null,
      direction: "asc",
    });
    setInputSearchTerm("");
    setSubmitSearchTerm("");
    const filteredFiles = allFiles.filter((file) => file.trash === true);
    setDisplayFiles(filteredFiles);
    setButtonMenu({
      download: true,
      preview: true,
      rename: false,
      manage_link: false,
      delete: true,
      favourite: false,
      unfavourite: false,
      trash: false,
      restore: true,
    });
    setIsSideBarOpen(false);
  };

  const handle_favouriteState = async (file_id, favouriteState) => {
    try {
      const response = await updateFavouriteFileById(file_id, favouriteState);

      if (response.success) {
        // toast.success("File updated successfully");

        const updatedAllFiles = allFiles.map((file) =>
          file.id === file_id ? { ...file, favourite: favouriteState } : file
        );

        const updatedAllDisplayFiles = displayFiles.reduce((updatedFiles, file) => {
          if (file.id === file_id) {
            if (pageState === "all" || favouriteState) {
              updatedFiles.push({ ...file, favourite: favouriteState });
            }
          } else {
            updatedFiles.push(file);
          }
          return updatedFiles;
        }, []);

        setAllFiles(updatedAllFiles);
        setDisplayFiles(updatedAllDisplayFiles);
      } else {
        toast.error("Failed to update file");
      }
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "Failed to update file");
      checkError(err);
    }
  };

  const handle_trashState = async (file_id, trashState) => {
    try {
      const response = await updateTrashFileById(file_id, trashState);
      if (response.success) {
        toast.success("File updated successfully");
        const updatedAllFiles = allFiles.map((file) => (file.id === file_id ? { ...file, trash: trashState } : file));

        const updatedDisplayFiles = displayFiles.filter((file) => file.id !== file_id);

        setAllFiles(updatedAllFiles);
        setDisplayFiles(updatedDisplayFiles);
      } else {
        toast.error("Failed to update file");
      }
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "Failed to update file");
      checkError(err);
    }
  };

  const sideBarDrawerAnimation = useSpring({
    transform: isSideBarOpen ? "translateX(0)" : "translateX(-100%)",
    opacity: isSideBarOpen ? 1 : 0,
    config: { tension: 300, friction: 30 },
    immediate: !isSideBarOpen,
  });

  const handle_TrashManyFiles = async (trashState) => {
    try {
      const response = await updateManyTrashFileByFiles(listOfSelectedFile, trashState);

      if (response.success) {
        const updatedAllFiles = allFiles.map((file) =>
          listOfSelectedFile.some((selectedFile) => selectedFile.id === file.id) ? { ...file, trash: trashState } : file
        );

        const updatedDisplayFiles = displayFiles.filter(
          (file) => !listOfSelectedFile.some((selectedFile) => selectedFile.id === file.id)
        );

        setAllFiles(updatedAllFiles);
        setDisplayFiles(updatedDisplayFiles);
        setListOfSelectedFile([]);

        const trashFileCount = response.data.length;
        toast.success(`${trashFileCount} file(s) trashed successfully`);
      } else {
        toast.error("Failed to trash files");
      }
    } catch (err) {
      // toast.error(err?.response?.data?.msg || "An error occurred while deleting files");
      checkError(err);
    }
  };

  const handle_RestoreManyFiles = async (trashState) => {
    try {
      const response = await updateManyTrashFileByFiles(listOfSelectedFile, trashState);

      if (response.success) {
        const updatedDisplayFiles = displayFiles.filter(
          (file) => !listOfSelectedFile.some((selectedFile) => selectedFile.id === file.id)
        );

        const updatedAllFiles = allFiles.map((file) =>
          listOfSelectedFile.some((selectedFile) => selectedFile.id === file.id) ? { ...file, trash: trashState } : file
        );

        setDisplayFiles(updatedDisplayFiles);
        setAllFiles(updatedAllFiles);

        setListOfSelectedFile([]);

        const restoredFileCount = response.data.length;
        toast.success(`${restoredFileCount} file(s) restored successfully`);
      } else {
        toast.error("Failed to restore files");
      }
    } catch (err) {
      console.log(err);
      checkError(err);
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// RETURN
  return (
    <PageLoader isLoading={isLoadingPage} timer={2000} message="Fetching Files">
      <div className="">
        {/* Preview Modal */}
        {previewFileDetails.isPreviewing && (
          <FilePreview
            previewInfo={previewFileDetails}
            onClose={() =>
              setPreviewFileDetails({
                isPreviewing: false,
                fileId: "",
                fileLink: "",
                filePassword: "",
              })
            }
          />
        )}

        {/* New Delete Confirmation Modal */}
        {isDeleteConfirmationModalOpen && (
          <DeleteConfirmationModal
            isDeleteConfirmationModalOpen={isDeleteConfirmationModalOpen}
            setIsDeleteConfirmModalOpen={setIsDeleteConfirmModalOpen}
            setCurrentSelectedFile={setCurrentSelectedFile}
            currentSelectedFile={currentSelectedFile}
            handle_FileDelete={handle_FileDelete}
          />
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
            modalTitle={`Rename File`}
          >
            <div className="flex flex-col">
              <div className="flex flex-col mb-4">
                <label className="block text-sm font-medium text-copy-primary/80 ml-1">New Name</label>
                <input
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
                  onChange={(e) => setFileRenameString(e.target.value)}
                  value={fileRenameString}
                  placeholder="Enter new name here"
                />
              </div>

              <button
                className="text-cta-text bg-cta transition duration-500 ease-in-out hover:bg-cta-active p-2 rounded font-bold"
                onClick={() => handle_FileRename()}
              >
                Update
              </button>
            </div>
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
            // modalTitle={`Manage Links: ${currentSelectedFile.originalname}`}
            modalTitle={`Manage Share Links`}
          >
            <div className="overflow-auto">
              <div className="overflow-y-auto">
                <div className="flex flex-col w-full">
                  <div className="flex border-b border-border text-copy-primary/80 text-sm font-medium ">
                    <div className="px-2 py-2 w-1/4 ">Link</div>
                    <div className="px-2 py-2 w-1/4 ">Expires</div>
                    <div className="px-2 py-2 w-1/4 ">Limit</div>
                    <div className="px-2 py-2 w-1/4 ">Password</div>
                    <div className="px-2 py-2 w-8"></div>
                  </div>

                  <div className="max-h-[200px]">
                    {listOfDownloadLinks && listOfDownloadLinks.length > 0 ? (
                      listOfDownloadLinks.map((currentLink) => (
                        <div key={currentLink.id} className="flex border-b border-border/50 text-copy-primary/70">
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

                          {/* expires */}
                          <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                            {fileDateFormatter(currentLink.expires_at)[2]}
                          </div>

                          {/* limit */}
                          <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                            {currentLink.download_count}/{currentLink.download_limit || "Null"}
                          </div>

                          {/* password */}
                          <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                            {currentLink.password ? "Yes" : "No"}
                          </div>

                          {/* X button */}
                          <div className="flex justify-center">
                            <button
                              className="text-gray-500 hover:text-red-500 text-2xl mr-2"
                              onClick={() => handle_DeleteDownloadLinkById(currentLink.id)}
                            >
                              <TbX size={17} strokeWidth={3} />
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

              <div className="text-copy-primary mb-4 my-8">
                <p className="font-bold">Create Link</p>
                <p className="text-copy-secondary whitespace-nowrap overflow-hidden truncate">
                  Create a new custom download link below
                </p>
              </div>

              <form className="flex flex-col space-y-4 p-1">
                {/* Expires At */}
                <div>
                  <label className="block text-sm font-medium text-copy-primary/80 ml-1">Expires At</label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
                    value={createLinkExpiresAt}
                    onChange={(e) => setCreateLinkExpiresAt(e.target.value)}
                  />
                </div>

                {/* Download Limit  */}
                <div>
                  <label className="block text-sm font-medium text-copy-primary/80 ml-1">Download Limit</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
                    value={createLinkDownloadLimit}
                    onChange={(e) => setCreateLinkDownloadLimit(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-copy-primary/80 ml-1">Link Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
                    autoComplete="new-password"
                    value={createLinkPassword}
                    onChange={(e) => setCreateLinkPassword(e.target.value)}
                  />
                </div>

                <button
                  className="text-cta-text bg-cta transition duration-500 ease-in-out hover:bg-cta-active p-2 rounded font-bold w-full"
                  onClick={(e) => handle_CreateDownloadLink(e, currentSelectedFile.id)}
                >
                  Create Link
                </button>
              </form>
            </div>
          </Modal>
        )}

        {/* Selected Options ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}
        <div ref={toolBarParentRef} className="max-w-full rounded-md h-14 px-2 my-4">
          <div
            ref={toolBarRef}
            className={`${
              isToolBarSticky ? "fixed top-0 left-0 w-full z-10 rounded-none border-none bg-background" : ""
            } max-w-full p-2 rounded-md flex flex-row h-14`}
          >
            <button
              className="bg-background text-copy-primary hover:bg-background-opp/10 rounded-md mr-4"
              onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            >
              <TbMenu2 className="mx-2" size={25} />
            </button>

            {listOfSelectedFile.length > 0 && (
              <button
                className={`p-1 px-4 rounded-md text-white mr-4 bg-blue-500 border-blue-800 hover:bg-blue-700`}
                onClick={() => setListOfSelectedFile([])}
                disabled={listOfSelectedFile.length === 0}
              >
                Deselect
              </button>
            )}

            {listOfSelectedFile.length > 0 && pageState !== "trash" && (
              <button
                className={`p-1 px-4 rounded-md text-white mr-4 bg-red-500 border-red-800 hover:bg-red-700`}
                onClick={() => handle_TrashManyFiles(true)}
                disabled={listOfSelectedFile.length === 0}
              >
                Trash
              </button>
            )}

            {listOfSelectedFile.length > 0 && pageState === "trash" && (
              <button
                className={`p-1 px-4 rounded-md text-white mr-4 bg-blue-500 border-blue-800 hover:bg-blue-700`}
                onClick={() => handle_RestoreManyFiles(false)}
                disabled={listOfSelectedFile.length === 0}
              >
                Restore
              </button>
            )}

            {pageState === "trash" && listOfSelectedFile.length > 0 && (
              <button
                className={`p-1 px-4 rounded-md text-white mr-4 bg-red-500 border-red-800 hover:bg-red-700`}
                onClick={handle_DeleteManyFiles}
                disabled={listOfSelectedFile.length === 0}
              >
                Delete
              </button>
            )}

            <div className="relative max-w-sm">
              <TbSearch className="absolute left-2.5 top-3 h-4 w-4 text-background-opp" strokeWidth={4} />
              <input
                type="text"
                className="pl-9 pr-4 w-full h-10 rounded-md border border-border/50 bg-transparent text-copy-primary focus:outline-none focus:border-border"
                placeholder="Search"
                value={inputSearchTerm}
                onChange={(e) => setInputSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handle_OnClickSearchFileName();
                }}
              />
            </div>
          </div>
        </div>

        <div className="w-full">
          {/* Side Bar ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}
          {isSideBarOpen && (
            <div className="fixed top-0 left-0 w-full h-screen z-50">
              <div
                className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-80`}
                onClick={() => setIsSideBarOpen(false)}
              />
              <animated.div
                className={`flex flex-col text-white bg-background w-full h-full p-4 max-w-sm`}
                style={sideBarDrawerAnimation}
              >
                <div className="p-2 py-4 relative">
                  <button
                    className="text-copy-secondary text-xl font-bold px-2 absolute right-0 top-4 hover:text-red-700"
                    onClick={() => setIsSideBarOpen(false)}
                  >
                    <TbX size={17} strokeWidth={3} />
                  </button>
                  <p className="text-3xl font-bold text-copy-primary whitespace-nowrap overflow-hidden truncate">
                    {user?.username}
                  </p>
                  <p className="text-copy-secondary whitespace-nowrap overflow-hidden truncate">{user?.email}</p>
                </div>

                <div className="border border-border mb-4"></div>

                <div className="text-copy-primary">
                  <div className="my-2">
                    <button
                      className={`w-full text-left rounded-lg p-2 py-3 flex items-center hover:text-copy-opp hover:bg-background-opp ${
                        pageState === "all" ? "text-copy-opp bg-background-opp" : ""
                      }`}
                      onClick={handle_AllFiles}
                    >
                      <TbFiles />
                      <span className="pl-4">All Files</span>
                    </button>
                  </div>
                  <div className="my-2">
                    <button
                      className={`w-full text-left rounded-lg p-2 py-3 flex items-center hover:text-copy-opp hover:bg-background-opp ${
                        pageState === "favourite" ? "text-copy-opp bg-background-opp" : ""
                      }`}
                      onClick={handle_AllFavourite}
                    >
                      <TbStar />
                      <span className="pl-4">Favourite</span>
                    </button>
                  </div>
                  <div className="my-2">
                    <button
                      className={`w-full text-left rounded-lg p-2 py-3 flex items-center hover:text-copy-opp hover:bg-background-opp ${
                        pageState === "trash" ? "text-copy-opp bg-background-opp" : ""
                      }`}
                      onClick={handle_AllTrash}
                    >
                      <TbTrash />
                      <span className="pl-4">Trash</span>
                    </button>
                  </div>
                </div>
              </animated.div>
            </div>
          )}

          {/* Table ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}
          <div className="w-full p-4">
            <table className={`table-auto w-full text-left w-full h-fit `}>
              <thead className="border-b-2 border-border bg-card text-copy-primary/80">
                <tr>
                  <th className="px-2 py-4 w-8">
                    <input
                      type="checkbox"
                      className=""
                      onChange={(e) => handle_FileSelectAll(e.target.checked)}
                      checked={listOfSelectedFile.length === sortedFiles.length && sortedFiles.length > 0}
                    />
                  </th>
                  <th className="px-2 py-4 cursor-pointer w-4/6" onClick={() => handle_FileSorting("name")}>
                    <div className="flex items-center select-none ">
                      NAME
                      {fileSortingConfig.sortByKey === "name" &&
                        (fileSortingConfig.direction === "asc" ? (
                          <TbArrowUp className="ml-1 text-copy-primary" strokeWidth={2} />
                        ) : (
                          <TbArrowDown className="ml-1 text-copy-primary" strokeWidth={2} />
                        ))}
                    </div>
                  </th>
                  <th className="px-2 py-4 cursor-pointer w-1/6" onClick={() => handle_FileSorting("size")}>
                    <div className="flex items-center select-none">
                      SIZE
                      {fileSortingConfig.sortByKey === "size" &&
                        (fileSortingConfig.direction === "asc" ? (
                          <TbArrowUp className="ml-1 text-copy-primary" strokeWidth={2} />
                        ) : (
                          <TbArrowDown className="ml-1 text-copy-primary" strokeWidth={2} />
                        ))}
                    </div>
                  </th>
                  <th className="px-2 py-4 cursor-pointer w-1/6" onClick={() => handle_FileSorting("created_at")}>
                    <div className="flex items-center select-none">
                      UPLOADED
                      {fileSortingConfig.sortByKey === "created_at" &&
                        (fileSortingConfig.direction === "asc" ? (
                          <TbArrowUp className="ml-1 text-copy-primary" strokeWidth={2} />
                        ) : (
                          <TbArrowDown className="ml-1 text-copy-primary" strokeWidth={2} />
                        ))}
                    </div>
                  </th>
                  <th className="px-2 py-4" />
                </tr>
              </thead>

              <tbody>
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => {
                    return (
                      <tr
                        key={file.id}
                        className="hover:bg-card/50 border-b border-border/50 cursor-pointer text-copy-primary/70 select-none"
                        onClick={() => handle_RowClickSelected(file)}
                      >
                        <td className="px-2 py-3 w-8">
                          <input
                            type="checkbox"
                            checked={listOfSelectedFile.some((selectedFile) => selectedFile.id === file.id)}
                            onChange={(e) => handle_FileSelectedCheckboxChange(file, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-2 whitespace-nowrap overflow-hidden truncate max-w-20">
                          {file.originalname}
                        </td>
                        <td className="px-2">{fileSizeFormatter(file.size)}</td>
                        <td className="px-2">{fileDateFormatter(file.created_at)[1]}</td>
                        <td className="px-2">
                          <div className="relative flex justify-end pr-2">
                            {pageState !== "trash" &&
                              (file.favourite ? (
                                <button
                                  className="justify-center items-center flex text-yellow-500 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handle_favouriteState(file.id, false);
                                  }}
                                >
                                  <TbStarFilled />
                                </button>
                              ) : (
                                <button
                                  className="justify-center items-center flex text-yellow-500 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handle_favouriteState(file.id, true);
                                  }}
                                >
                                  <TbStar />
                                </button>
                              ))}

                            <button
                              className="p-2 rounded-md hover:bg-background-opp/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handle_FileMenuClick(file.id, e.target);
                              }}
                            >
                              <TbDotsVertical size={17} className="" />
                            </button>

                            {openFileMenu === file.id && (
                              <div
                                className={`absolute right-0 mt-1 w-40 shadow-lg rounded z-10 border border-border/30 p-2 ${
                                  fileMenuDropdownPosition === "up" ? "bottom-full" : "top-full"
                                } bg-card text-copy-primary`}
                                ref={fileMenuRef}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {buttonMenu.download && (
                                  <button
                                    className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                                    onClick={() => handle_FileDownload(file.id)}
                                  >
                                    <TbDownload size={17} className="mr-2" />
                                    Download
                                  </button>
                                )}

                                {buttonMenu.preview && (
                                  <button
                                    className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                                    onClick={async () => {
                                      setPreviewFileDetails({
                                        isPreviewing: true,
                                        fileId: file.id,
                                      });
                                    }}
                                  >
                                    <TbEye size={17} className="mr-2" />
                                    Preview
                                  </button>
                                )}

                                {buttonMenu.rename && (
                                  <button
                                    className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                                    onClick={() => handle_OnClickFileRename(file)}
                                  >
                                    <TbFilePencil size={17} className="mr-2" />
                                    Rename
                                  </button>
                                )}
                                {buttonMenu.manage_link && (
                                  <button
                                    className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                                    onClick={() => handle_OnClickManageLink(file)}
                                  >
                                    <TbLink size={17} className="mr-2" />
                                    Manage Link
                                  </button>
                                )}

                                {!file?.trash &&
                                  (buttonMenu.favourite && !file?.favourite ? (
                                    <button
                                      className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                                      onClick={() => handle_favouriteState(file.id, true)}
                                    >
                                      <TbStar size={17} className="mr-2" />
                                      Favourite
                                    </button>
                                  ) : (
                                    <button
                                      className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                                      onClick={() => handle_favouriteState(file.id, false)}
                                    >
                                      <TbStarOff size={17} className="mr-2" />
                                      Unfavourite
                                    </button>
                                  ))}

                                {buttonMenu.trash && (
                                  <button
                                    className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                                    onClick={() => handle_trashState(file.id, true)}
                                  >
                                    <TbTrash size={17} className="mr-2" />
                                    Trash
                                  </button>
                                )}

                                {buttonMenu.restore && (
                                  <button
                                    className="p-2 hover:bg-background-opp hover:text-copy-opp w-full text-left rounded font-medium text-sm flex flex-row"
                                    onClick={() => handle_trashState(file.id, false)}
                                  >
                                    <TbArrowBackUp size={17} className="mr-2" />
                                    Restore
                                  </button>
                                )}

                                {buttonMenu.delete && (
                                  <div>
                                    <div className="border-t border-border/40 my-1" />
                                    <button
                                      className="p-2 hover:bg-background-opp hover:text-copy-opp text-red-500 w-full text-left rounded font-medium text-sm flex flex-row transition duration-300 ease-in-out"
                                      onClick={() => handle_OnClickDelete(file)}
                                    >
                                      <TbTrashX size={17} className="mr-2" />
                                      Delete
                                    </button>{" "}
                                  </div>
                                )}
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
        </div>
      </div>
    </PageLoader>
  );
}

export default Landing_MyFiles;
