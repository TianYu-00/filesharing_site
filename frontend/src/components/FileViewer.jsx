import React, { useEffect, useState } from "react";
import { TbX } from "react-icons/tb";

const FilePreview = ({ file, onClose }) => {
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState("");

  useEffect(() => {
    if (file) {
      const fileType = file.type;
      console.log(fileType);
      setFileType(fileType);

      const fileURL = URL.createObjectURL(file);

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
  }, [file]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="relative w-full h-full p-6 flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
          <TbX size={24} />
        </button>

        {/* File types */}
        <div className="flex-grow flex items-center justify-center rounded-md overflow-hidden">
          {/* image/ */}
          {fileType.startsWith("image/") && filePreview && (
            <img src={filePreview} alt="File Preview" className="max-h-full max-w-full object-contain" />
          )}

          {/* video/ */}
          {fileType.startsWith("video/") && filePreview && <video src={filePreview} controls />}

          {/* audio/ */}
          {fileType.startsWith("audio/") && filePreview && (
            <audio src={filePreview} controls>
              Browser does not support the audio element.
            </audio>
          )}

          {/* application/pdf */}
          {fileType === "application/pdf" && filePreview && (
            <embed src={filePreview} type="application/pdf" className="w-full h-full" />
          )}

          {/* not matched */}
          {!filePreview && <p className="text-copy-primary/80">Unsupported file type or no preview available.</p>}
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
      - docx types are: application/vnd.openxmlformats-officedocument.wordprocessingml.document - thinking of mammoth npm
      - txt types are: text/plain - could just use textarea
      - little bit more complicated, will figure this out later on.
    - 

*/
