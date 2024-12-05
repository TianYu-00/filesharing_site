import React, { useState } from "react";
import { BsCloudUploadFill } from "react-icons/bs";
import { toast } from "react-toastify";

function FileDropZone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedItems = event.dataTransfer.items;
    const droppedFiles = event.dataTransfer.files;

    if (hasFolders(droppedItems)) {
      toast.error("Folders cannot be dropped.");
      return;
    }

    if (droppedFiles.length > 1) {
      toast.error("Only one file can be dropped at a time.");
      return;
    }

    const droppedFile = droppedFiles[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const hasFolders = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file" && items[i].webkitGetAsEntry().isDirectory) {
        return true;
      }
    }
    return false;
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleClick = () => {
    document.getElementById("file-input").click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-[300px] w-full p-4 border-2 border-dashed rounded transition-colors duration-500
    ${isDragging ? "bg-slate-400" : "bg-slate-600"} mt-8`}
    >
      <div className="flex flex-col justify-center items-center min-h-[300px] pointer-events-none">
        <BsCloudUploadFill size={50} />

        {isDragging ? <p>Drop it...</p> : <p>Drag & Drop a file here</p>}

        {!isDragging && (
          <>
            <p className="my-2">or</p>
            <button
              className="border border-blue-500 hover:bg-blue-500 p-2 rounded pointer-events-auto"
              onClick={() => {
                handleClick();
                console.log("button has been click");
              }}
            >
              Browse File
            </button>
          </>
        )}
      </div>
      <input id="file-input" type="file" onChange={handleFileInputChange} className="hidden" />
    </div>
  );
}

export default FileDropZone;
