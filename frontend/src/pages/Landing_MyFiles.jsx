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
import { toast } from "react-toastify";

import useErrorChecker from "../components/UseErrorChecker";
import PageLoader from "../components/PageLoader";
import FilePreview from "../components/FileViewer";
import {
  TbTrash,
  TbStar,
  TbStarFilled,
  TbArrowUp,
  TbArrowDown,
  TbDotsVertical,
  TbDownload,
  TbFilePencil,
  TbLink,
  TbStarOff,
  TbTrashX,
  TbArrowBackUp,
  TbEye,
} from "react-icons/tb";
import MyFiles_DeleteConfirmationModal from "../components/MyFiles/MyFiles_DeleteConfirmationModal";
import MyFiles_RenameModal from "../components/MyFiles/MyFiles_RenameModal";
import MyFiles_ManageLinkModal from "../components/MyFiles/MyFiles_ManageLinkModal";
import MyFiles_FileActionPanel from "../components/MyFiles/MyFiles_FileActionPanel";
import MyFiles_SidePanel from "../components/MyFiles/MyFiles_SidePanel";

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

  // search
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

  const filteredFiles = useMemo(() => {
    return sortedFiles.filter((file) => file.originalname.toLowerCase().includes(submitSearchTerm.toLowerCase()));
  }, [sortedFiles, submitSearchTerm]);

  useEffect(() => {
    setOpenFileMenu(null);
    setCurrentSelectedFile(null);
    setListOfSelectedFile([]);
    setFileSortingConfig({
      sortByKey: null,
      direction: "asc",
    });
    setSubmitSearchTerm("");
    setIsSideBarOpen(false);
  }, [pageState]);

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
          <MyFiles_DeleteConfirmationModal
            isDeleteConfirmationModalOpen={isDeleteConfirmationModalOpen}
            setIsDeleteConfirmModalOpen={setIsDeleteConfirmModalOpen}
            setCurrentSelectedFile={setCurrentSelectedFile}
            currentSelectedFile={currentSelectedFile}
            handle_FileDelete={handle_FileDelete}
          />
        )}

        {/* New Rename Modal */}
        {isRenameModalOpen && (
          <MyFiles_RenameModal
            isRenameModalOpen={isRenameModalOpen}
            setIsRenameModalOpen={setIsRenameModalOpen}
            setFileRenameString={setFileRenameString}
            setCurrentSelectedFile={setCurrentSelectedFile}
            fileRenameString={fileRenameString}
            handle_FileRename={handle_FileRename}
          />
        )}

        {/* New Manage Link Modal */}
        {isManageLinkModalOpen && (
          <MyFiles_ManageLinkModal
            isManageLinkModalOpen={isManageLinkModalOpen}
            setIsManageLinkModalOpen={setIsManageLinkModalOpen}
            setCreateLinkExpiresAt={setCreateLinkExpiresAt}
            setCreateLinkDownloadLimit={setCreateLinkDownloadLimit}
            setCreateLinkPassword={setCreateLinkPassword}
            setCurrentSelectedFile={setCurrentSelectedFile}
            listOfDownloadLinks={listOfDownloadLinks}
            setManageLink_LinkTooltip={setManageLink_LinkTooltip}
            manageLink_LinkTooltip={manageLink_LinkTooltip}
            handle_DeleteDownloadLinkById={handle_DeleteDownloadLinkById}
            createLinkExpiresAt={createLinkExpiresAt}
            handle_CreateDownloadLink={handle_CreateDownloadLink}
            createLinkDownloadLimit={createLinkDownloadLimit}
            createLinkPassword={createLinkPassword}
            currentSelectedFile={currentSelectedFile}
          />
        )}

        <MyFiles_FileActionPanel
          setIsSideBarOpen={setIsSideBarOpen}
          isSideBarOpen={isSideBarOpen}
          setListOfSelectedFile={setListOfSelectedFile}
          listOfSelectedFile={listOfSelectedFile}
          pageState={pageState}
          setSubmitSearchTerm={setSubmitSearchTerm}
          setAllFiles={setAllFiles}
          setDisplayFiles={setDisplayFiles}
          allFiles={allFiles}
          displayFiles={displayFiles}
        />

        <div className="w-full">
          {isSideBarOpen && (
            <MyFiles_SidePanel
              setIsSideBarOpen={setIsSideBarOpen}
              pageState={pageState}
              setPageState={setPageState}
              allFiles={allFiles}
              setDisplayFiles={setDisplayFiles}
              setButtonMenu={setButtonMenu}
              isSideBarOpen={isSideBarOpen}
            />
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
