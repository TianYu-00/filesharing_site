import React, { useState, useEffect } from "react";
import { TbCloudUpload } from "react-icons/tb";
import { toast } from "react-toastify";

function FileDropZone({ onFileSelect }) {
  const [fileSizeLimitText, setFileSizeLimitText] = useState("");
  const fileSizeLimit = process.env.NODE_ENV === "production" ? 1 * 1024 * 1024 : 10 * 1024 * 1024;

  useEffect(() => {
    const fileSizeLimitMessage = process.env.NODE_ENV === "production" ? "Max 1MB per file" : "Max 10MB per file";
    setFileSizeLimitText(`${fileSizeLimitMessage}`);
  }, []);

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

    const oversizedFile = droppedFiles.find((file) => file.size > fileSizeLimit);
    if (oversizedFile) {
      toast.error(`"${oversizedFile.name}" exceeds the size limit of ${fileSizeLimit / (1024 * 1024)}MB.`);
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

    const oversizedFile = selectedFiles.find((file) => file.size > fileSizeLimit);
    if (oversizedFile) {
      toast.error(`"${oversizedFile.name}" exceeds the size limit of ${fileSizeLimit / (1024 * 1024)}MB.`);
      return;
    }

    if (selectedFiles.length > 0) {
      onFileSelect(selectedFiles);
    }
    event.target.value = null;
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
    ${isDragging ? "bg-slate-400 text-cta-text" : ""} mt-8 text-copy-primary/70`}
    >
      <div className="flex flex-col justify-center items-center min-h-[300px] pointer-events-none">
        <TbCloudUpload size={50} />

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

        <p className="pt-4 text-sm text-copy-secondary">{fileSizeLimitText}</p>
      </div>
      <input
        id="file-input"
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Select file to upload"
      />
    </div>
  );
}

export default FileDropZone;
