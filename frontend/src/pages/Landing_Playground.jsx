import React, { useState, useRef } from "react";
import FilePreview from "../components/FileViewer";

const Landing_Playground = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsPreviewVisible(true);
    }
  };

  const closePreview = () => {
    setIsPreviewVisible(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background p-4">
      <label
        htmlFor="selectFileInput"
        className="mb-4 px-4 py-2 bg-cta text-cta-text font-semibold rounded-lg cursor-pointer hover:bg-cta-active"
      >
        Select a File
      </label>
      <input type="file" id="selectFileInput" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
      {isPreviewVisible && <FilePreview file={selectedFile} onClose={closePreview} />}
    </div>
  );
};

export default Landing_Playground;
