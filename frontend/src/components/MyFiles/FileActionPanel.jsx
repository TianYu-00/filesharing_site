import React from "react";
import { TbSearch, TbMenu2 } from "react-icons/tb";

function FileActionPanel({
  toolBarParentRef,
  toolBarRef,
  isToolBarSticky,
  setIsSideBarOpen,
  isSideBarOpen,
  setListOfSelectedFile,
  listOfSelectedFile,
  pageState,
  handle_TrashManyFiles,
  handle_RestoreManyFiles,
  handle_DeleteManyFiles,
  inputSearchTerm,
  setInputSearchTerm,
  handle_OnClickSearchFileName,
}) {
  return (
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
  );
}

export default FileActionPanel;
