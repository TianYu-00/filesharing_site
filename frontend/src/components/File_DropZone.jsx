import React, { useState } from "react";

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
      alert("Folders cannot be dropped. Please select a single file.");
      return;
    }

    if (droppedFiles.length > 1) {
      alert("Only one file can be dropped at a time.");
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
      onClick={handleClick}
      className={`min-h-[300px] w-full p-4 border-2 border-dashed rounded cursor-pointer transition-colors duration-500
    ${isDragging ? "bg-slate-400" : "bg-slate-600 hover:bg-slate-400"} mt-8`}
    >
      <div className="flex justify-center items-center min-h-[300px] pointer-events-none">
        {isDragging ? <p>Drop file here...</p> : <p>Drag and drop a file here, or click to select a file</p>}
      </div>
      <input id="file-input" type="file" onChange={handleFileInputChange} className="hidden" />
    </div>
  );
}

export default FileDropZone;
