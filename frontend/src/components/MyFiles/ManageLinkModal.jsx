import React from "react";
import Modal from "../Modal";
import { fileDateFormatter } from "../File_Formatter";
import { TbX } from "react-icons/tb";
import { Tooltip } from "react-tooltip";

function ManageLinkModal({
  isManageLinkModalOpen,
  setIsManageLinkModalOpen,
  setCreateLinkExpiresAt,
  setCreateLinkDownloadLimit,
  setCreateLinkPassword,
  setCurrentSelectedFile,
  listOfDownloadLinks,
  setManageLink_LinkTooltip,
  manageLink_LinkTooltip,
  handle_DeleteDownloadLinkById,
  createLinkExpiresAt,
  handle_CreateDownloadLink,
  createLinkDownloadLimit,
  createLinkPassword,
  currentSelectedFile,
}) {
  return (
    <Modal
      isOpen={isManageLinkModalOpen}
      onClose={() => {
        setIsManageLinkModalOpen(false);
        setCreateLinkExpiresAt("");
        setCreateLinkDownloadLimit("");
        setCreateLinkPassword("");
        setCurrentSelectedFile(null);
      }}
      // modalTitle={`Manage Links: ${currentSelectedFile.originalname}`}
      modalTitle={`Manage Share Links`}
    >
      <div className="overflow-auto">
        <div className="overflow-y-auto">
          <div className="flex flex-col w-full">
            <div className="flex border-b border-border text-copy-primary/80 text-sm font-medium ">
              <div className="px-2 py-2 w-1/4 ">Link</div>
              <div className="px-2 py-2 w-1/4 ">Expires</div>
              <div className="px-2 py-2 w-1/4 ">Limit</div>
              <div className="px-2 py-2 w-1/4 ">Password</div>
              <div className="px-2 py-2 w-8"></div>
            </div>

            <div className="max-h-[200px]">
              {listOfDownloadLinks && listOfDownloadLinks.length > 0 ? (
                listOfDownloadLinks.map((currentLink) => (
                  <div key={currentLink.id} className="flex border-b border-border/50 text-copy-primary/70">
                    <div
                      className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate cursor-pointer "
                      onClick={async () => {
                        const fullUrl = `${window.location.origin}/files/download/${currentLink.download_url}`;
                        await navigator.clipboard.writeText(fullUrl);
                        setManageLink_LinkTooltip("Link copied!");
                        setTimeout(() => setManageLink_LinkTooltip("Click to copy link"), 2000);
                      }}
                      data-tooltip-id="id_managelink_link"
                      data-tooltip-content={manageLink_LinkTooltip}
                    >
                      {currentLink.download_url}
                    </div>
                    <Tooltip
                      id="id_managelink_link"
                      style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
                      opacity={0.9}
                      place="bottom"
                    />

                    {/* expires */}
                    <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                      {fileDateFormatter(currentLink.expires_at)[2]}
                    </div>

                    {/* limit */}
                    <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                      {currentLink.download_count}/{currentLink.download_limit || "Null"}
                    </div>

                    {/* password */}
                    <div className="px-2 py-1 text-sm flex-1 whitespace-nowrap overflow-hidden truncate ">
                      {currentLink.password ? "Yes" : "No"}
                    </div>

                    {/* X button */}
                    <div className="flex justify-center">
                      <button
                        className="text-gray-500 hover:text-red-500 text-2xl mr-2"
                        onClick={() => handle_DeleteDownloadLinkById(currentLink.id)}
                      >
                        <TbX size={17} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>

        <div className="text-copy-primary mb-4 my-8">
          <p className="font-bold">Create Link</p>
          <p className="text-copy-secondary whitespace-nowrap overflow-hidden truncate">
            Create a new custom download link below
          </p>
        </div>

        <form className="flex flex-col space-y-4 p-1">
          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-copy-primary/80 ml-1">Expires At</label>
            <input
              type="datetime-local"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
              value={createLinkExpiresAt}
              onChange={(e) => setCreateLinkExpiresAt(e.target.value)}
            />
          </div>

          {/* Download Limit  */}
          <div>
            <label className="block text-sm font-medium text-copy-primary/80 ml-1">Download Limit</label>
            <input
              type="number"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
              value={createLinkDownloadLimit}
              onChange={(e) => setCreateLinkDownloadLimit(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-copy-primary/80 ml-1">Link Password</label>
            <input
              type="password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
              autoComplete="new-password"
              value={createLinkPassword}
              onChange={(e) => setCreateLinkPassword(e.target.value)}
            />
          </div>

          <button
            className="text-cta-text bg-cta transition duration-500 ease-in-out hover:bg-cta-active p-2 rounded font-bold w-full"
            onClick={(e) => handle_CreateDownloadLink(e, currentSelectedFile.id)}
          >
            Create Link
          </button>
        </form>
      </div>
    </Modal>
  );
}

export default ManageLinkModal;
