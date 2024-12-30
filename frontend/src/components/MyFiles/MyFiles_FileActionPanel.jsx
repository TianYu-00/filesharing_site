import React, { useEffect, useState, useRef } from "react";
import { TbSearch, TbMenu2 } from "react-icons/tb";
import { updateManyTrashFileByFiles, removeManyFilesByFileInfo } from "../../api";
import useErrorChecker from "../UseErrorChecker";
import { toast } from "react-toastify";

function MyFiles_FileActionPanel({
  setIsSideBarOpen,
  isSideBarOpen,
  setListOfSelectedFile,
  listOfSelectedFile,
  pageState,
  setSubmitSearchTerm,
  setAllFiles,
  setDisplayFiles,
  allFiles,
  displayFiles,
}) {
  const [isPanelSticky, setIsPanelSticky] = useState(false);
  const panelRef = useRef(null);
  const panelParentRef = useRef(null);
  const [inputSearchTerm, setInputSearchTerm] = useState("");
  const checkError = useErrorChecker();

  useEffect(() => {
    const handleScroll = () => {
      if (panelParentRef.current) {
        const toolbarRect = panelParentRef.current.getBoundingClientRect();
        setIsPanelSticky(toolbarRect.top < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setInputSearchTerm("");
  }, [pageState]);

  // Trash Many
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
      console.error(err);
      checkError(err);
    }
  };

  // Restore Many
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
      console.error(err);
      checkError(err);
    }
  };

  // Delete Many
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
      console.error(err);
      checkError(err);
    }
  };

  return (
    <div ref={panelParentRef} className="max-w-full rounded-md h-14 px-2 my-4">
      <div
        ref={panelRef}
        className={`${
          isPanelSticky ? "fixed top-0 left-0 w-full z-10 rounded-none border-none bg-background" : ""
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
              if (e.key === "Enter") setSubmitSearchTerm(inputSearchTerm);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default MyFiles_FileActionPanel;
