import React from "react";
import Modal from "../Modal";

function MyFiles_DeleteConfirmationModal({
  isDeleteConfirmationModalOpen,
  setIsDeleteConfirmModalOpen,
  setCurrentSelectedFile,
  currentSelectedFile,
  handle_FileDelete,
}) {
  return (
    <Modal
      isOpen={isDeleteConfirmationModalOpen}
      onClose={() => {
        setIsDeleteConfirmModalOpen(false);
        setCurrentSelectedFile(null);
      }}
      modalTitle={`Delete Confirmation`}
    >
      <p className="text-copy-primary text-lg mb-4">Are you sure you want to delete the file?</p>
      <p className="text-copy-secondary text-lg mb-4">{currentSelectedFile.originalname}</p>
      <div className="flex justify-center items-align space-x-6">
        <button
          className="bg-cta font-bold p-2 rounded text-cta-text hover:bg-cta-active transition duration-500 ease-in-out"
          onClick={() => {
            setIsDeleteConfirmModalOpen(false);
            setCurrentSelectedFile(null);
          }}
        >
          Cancel
        </button>
        <button
          className="bg-red-800 font-bold p-2 rounded text-white hover:bg-red-700 transition duration-500 ease-in-out"
          onClick={() => {
            handle_FileDelete(currentSelectedFile.id);
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}

export default MyFiles_DeleteConfirmationModal;
