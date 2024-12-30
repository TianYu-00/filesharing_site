import React from "react";
import Modal from "../Modal";

function MyFiles_RenameModal({
  isRenameModalOpen,
  setIsRenameModalOpen,
  setFileRenameString,
  setCurrentSelectedFile,
  fileRenameString,
  handle_FileRename,
}) {
  return (
    <Modal
      isOpen={isRenameModalOpen}
      onClose={() => {
        setIsRenameModalOpen(false);
        setFileRenameString("");
        setCurrentSelectedFile(null);
      }}
      modalTitle={`Rename File`}
    >
      <div className="flex flex-col">
        <div className="flex flex-col mb-4">
          <label className="block text-sm font-medium text-copy-primary/80 ml-1">New Name</label>
          <input
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
            onChange={(e) => setFileRenameString(e.target.value)}
            value={fileRenameString}
            placeholder="Enter new name here"
          />
        </div>

        <button
          className="text-cta-text bg-cta transition duration-500 ease-in-out hover:bg-cta-active p-2 rounded font-bold"
          onClick={() => handle_FileRename()}
        >
          Update
        </button>
      </div>
    </Modal>
  );
}

export default MyFiles_RenameModal;
