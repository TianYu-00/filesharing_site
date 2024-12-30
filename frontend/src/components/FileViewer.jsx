import React, { useEffect, useState } from "react";
import { TbX } from "react-icons/tb";
import { previewFileByID } from "../api";
import HashLoader from "react-spinners/HashLoader";

const FilePreview = ({ previewInfo, onClose }) => {
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState("");
  const [fileBlob, setFileBlob] = useState(null);

  useEffect(() => {
    const getBlob = async () => {
      const blob = await previewFileByID(
        previewInfo.fileId,
        previewInfo.fileLink || "",
        previewInfo.filePassword || ""
      );
      setFileBlob(blob);
    };
    getBlob();
  }, []);

  useEffect(() => {
    if (fileBlob) {
      const fileType = fileBlob.type;
      setFileType(fileType);

      const fileURL = URL.createObjectURL(fileBlob);
      setFilePreview(fileURL);

      if (fileType.startsWith("image/")) {
        setFilePreview(fileURL);
      } else if (fileType.startsWith("video/")) {
        setFilePreview(fileURL);
      } else if (fileType.startsWith("audio/")) {
        setFilePreview(fileURL);
      } else if (fileType === "application/pdf") {
        setFilePreview(fileURL);
      } else {
        setFilePreview(null);
      }

      return () => {
        URL.revokeObjectURL(fileURL);
      };
    }
  }, [fileBlob]);

  if (previewInfo.isPreviewing && !fileBlob) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
        <div className="relative w-full h-full p-6 flex flex-col">
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-400 hover:text-red-500">
              <TbX size={24} />
            </button>
          </div>

          <div className="text-copy-primary flex flex-col justify-center items-center w-full h-full">
            <HashLoader color="#1764FF" />
            <p className="text-copy-secondary pt-4 animate-pulse">Loading preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="relative w-full h-full p-6 flex flex-col">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <TbX size={24} />
          </button>
        </div>

        <div className="flex-grow flex items-center justify-center rounded-md overflow-hidden">
          {/* image/ */}
          {fileType.startsWith("image/") && (
            <img src={filePreview} alt="File Preview" className="max-h-full max-w-full object-contain bg-white/10" />
          )}

          {/* video/ */}
          {fileType.startsWith("video/") && <video src={filePreview} controls />}

          {/* audio/ */}
          {fileType.startsWith("audio/") && (
            <audio src={filePreview} controls>
              Browser does not support the audio element.
            </audio>
          )}

          {/* application/pdf */}
          {fileType === "application/pdf" && (
            <>
              <p className="text-copy-primary/80 md:hidden">This file cannot be previewed on mobile.</p>
              <div className="h-full w-full hidden md:block">
                <embed src={filePreview} type="application/pdf" className="w-full h-full" />
              </div>
            </>
          )}

          {/* not matched */}
          {!filePreview && <p className="text-white">Unsupported file type or no preview available.</p>}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;

// notes:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
// https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types

/*
  - Determine which file type is it
  - Handle different types of media based on the type
    - Image = <img />
    - Video = <video />
    - Audio = <audio />
    - PDF = <embed /> - could use embed for image video etc but i think its generally better to use proper tags
    - Text = 
      - docx types are: application/vnd.openxmlformats-officedocument.wordprocessingml.document
      - txt types are: text/plain - could just use textarea
      - little bit more complicated, will figure this out later on.
        26/12/2024
      - used docx-preview for better preserved styling but not 100% perfect yet, maybe i should transform the docx file into pdf instead hmm.
      - managed to do it with libreoffice-convert but the downside of this is the converting time it takes + resource consumption.
      - added loaders and indicators to help with user visual feedback during loading.
      - im more leaning towards using libreoffice-convert despite the waiting time. It keeps true docx format providing better user experience + improves client side security.
    - 

*/
