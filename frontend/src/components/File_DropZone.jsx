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
    const droppedFiles = Array.from(event.dataTransfer.files);

    if (hasFolders(droppedItems)) {
      toast.error("Folders cannot be dropped.");
      return;
    }

    if (droppedFiles.length > 0) {
      onFileSelect(droppedFiles);
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
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      onFileSelect(selectedFiles);
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
      className={`min-h-[300px] w-full p-4 border-2 border-dashed border-border rounded transition-colors duration-500
    ${isDragging ? "bg-slate-400 text-cta-text" : ""} mt-8 text-copy-secondary`}
    >
      <div className="flex flex-col justify-center items-center min-h-[300px] pointer-events-none">
        <BsCloudUploadFill size={50} />

        {isDragging ? <p>Drop files...</p> : <p>Drag & Drop files here</p>}

        {!isDragging && (
          <>
            <p className="my-2">or</p>
            <button
              className="bg-cta hover:bg-cta-active text-cta-text p-2 rounded pointer-events-auto"
              onClick={handleClick}
            >
              Browse Files
            </button>
          </>
        )}
      </div>
      <input id="file-input" type="file" multiple onChange={handleFileInputChange} className="hidden" />
    </div>
  );
}

export default FileDropZone;
