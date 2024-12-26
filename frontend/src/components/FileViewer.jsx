import React, { useEffect, useState, useRef } from "react";
import { TbX } from "react-icons/tb";
import { renderAsync } from "docx-preview";

const FilePreview = ({ fileBlob, onClose }) => {
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState("");
  const previewBodyContainerRef = useRef(null);

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
      } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          if (previewBodyContainerRef.current) {
            // https://github.com/VolodymyrBaydalka/docxjs?tab=readme-ov-file#readme
            const options = {
              className: "docx", // class name/prefix for default and document style classes
              inWrapper: true, // enables rendering of wrapper around document content
              ignoreWidth: false, // disables rendering width of page
              ignoreHeight: false, // disables rendering height of page
              ignoreFonts: false, // disables fonts rendering
              breakPages: true, // enables page breaking on page breaks
              ignoreLastRenderedPageBreak: false, // disables page breaking on lastRenderedPageBreak elements
              experimental: false, // enables experimental features (tab stops calculation)
              trimXmlDeclaration: true, // if true, xml declaration will be removed from xml documents before parsing
              useBase64URL: false, // if true, images, fonts, etc. will be converted to base 64 URL, otherwise URL.createObjectURL is used
              renderChanges: false, // enables experimental rendering of document changes (insertions/deletions)
              renderHeaders: true, // enables headers rendering
              renderFooters: true, // enables footers rendering
              renderFootnotes: true, // enables footnotes rendering
              renderEndnotes: true, // enables endnotes rendering
              renderComments: false, // enables experimental comments rendering
              debug: false, // enables additional logging
            };

            await renderAsync(new Uint8Array(arrayBuffer), previewBodyContainerRef.current, null, options);
          }
        };
        fileReader.readAsArrayBuffer(fileBlob);
      } else {
        setFilePreview(null);
      }

      return () => {
        URL.revokeObjectURL(fileURL);
      };
    }
  }, [fileBlob]);

  if (!fileBlob) return null;

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
            <img src={filePreview} alt="File Preview" className="max-h-full max-w-full object-contain" />
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
            <embed src={filePreview} type="application/pdf" className="w-full h-full" />
          )}

          {/* application/vnd.openxmlformats-officedocument.wordprocessingml.document */}
          {fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
            <>
              <p className="text-copy-primary/80 md:hidden">This file cannot be previewed on mobile.</p>

              <div className="h-full w-full hidden md:block">
                <span className="text-copy-secondary">The styling of the file may not display correctly.</span>

                <div ref={previewBodyContainerRef} className="w-full h-full overflow-auto text-left" />
              </div>
            </>
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
      - docx types are: application/vnd.openxmlformats-officedocument.wordprocessingml.document
      - txt types are: text/plain - could just use textarea
      - little bit more complicated, will figure this out later on.
        26/12/2024
      - used docx-preview for better preserved styling but not 100% perfect yet, maybe i should transform the docx file into pdf instead hmm.
    - 

*/
