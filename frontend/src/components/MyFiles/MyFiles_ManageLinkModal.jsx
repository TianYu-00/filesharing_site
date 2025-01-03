import React, { useState } from "react";
import Modal from "../Modal";
import { fileDateFormatter } from "../File_Formatter";
import { TbX } from "react-icons/tb";
import { Tooltip } from "react-tooltip";
import { toast } from "react-toastify";
import useErrorChecker from "../UseErrorChecker";
import { createDownloadLinkByFileId, removeDownloadLinkByLinkId } from "../../api";

function MyFiles_ManageLinkModal({
  isManageLinkModalOpen,
  setIsManageLinkModalOpen,
  setCurrentSelectedFile,
  listOfDownloadLinks,
  currentSelectedFile,
  setListOfDownloadLinks,
}) {
  const [createLinkExpiresAt, setCreateLinkExpiresAt] = useState("");
  const [createLinkDownloadLimit, setCreateLinkDownloadLimit] = useState("");
  const [createLinkPassword, setCreateLinkPassword] = useState("");
  const [manageLink_LinkTooltip, setManageLink_LinkTooltip] = useState("Click to copy link");
  const checkError = useErrorChecker();

  const handle_CreateDownloadLink = async (e, file_id) => {
    e.preventDefault();
    try {
      const tempExpiresAt = createLinkExpiresAt || null;
      const tempDownloadLimit = createLinkDownloadLimit || null;
      const tempPassword = createLinkPassword || null;

      const response = await createDownloadLinkByFileId(file_id, tempExpiresAt, tempDownloadLimit, tempPassword);
      if (response.success) {
        setCreateLinkExpiresAt("");
        setCreateLinkDownloadLimit("");
        setCreateLinkPassword("");
        const newLinks = {
          ...response.data,
          password: !!tempPassword,
        };
        setListOfDownloadLinks((prevLinks) => [...prevLinks, newLinks]);
        toast.success("Download link has been created");
      } else {
        toast.error("Failed to create download link");
      }
    } catch (err) {
      console.error(err);
      checkError(err);
    }
  };

  const handle_DeleteDownloadLinkById = async (link_id) => {
    try {
      const response = await removeDownloadLinkByLinkId(link_id);
      if (response.success) {
        setListOfDownloadLinks(listOfDownloadLinks.filter((link) => link.id !== link_id));
        toast.success("Download link has been deleted");
      } else {
        toast.error("Failed to delete download link");
      }
    } catch (err) {
      console.error(err);
      checkError(err);
    }
  };

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
                        aria-label="Delete link"
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
            <label className="block text-sm font-medium text-copy-primary/80 ml-1" htmlFor="expires-at">
              Expires At
            </label>
            <input
              type="datetime-local"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
              value={createLinkExpiresAt}
              onChange={(e) => setCreateLinkExpiresAt(e.target.value)}
              id="expires-at"
            />
          </div>

          {/* Download Limit  */}
          <div>
            <label className="block text-sm font-medium text-copy-primary/80 ml-1" htmlFor="download-limit">
              Download Limit
            </label>
            <input
              type="number"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
              value={createLinkDownloadLimit}
              onChange={(e) => setCreateLinkDownloadLimit(e.target.value)}
              id="download-limit"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-copy-primary/80 ml-1" htmlFor="link-password">
              Download Link Password
            </label>
            <input
              type="password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:outline-none focus:border-border"
              autoComplete="new-password"
              value={createLinkPassword}
              onChange={(e) => setCreateLinkPassword(e.target.value)}
              id="link-password"
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

export default MyFiles_ManageLinkModal;
