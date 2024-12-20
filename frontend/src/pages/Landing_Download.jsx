import React, { useEffect, useState } from "react";
import {
  fetchFileInfo,
  downloadFileByID,
  fetchDownloadLinkInfoByDownloadLink,
  increaseDownloadLinkCountByLinkId,
  validateDownloadLinkPassword,
} from "../api";
import { fileSizeFormatter, fileDateFormatter } from "../components/File_Formatter";
import { useParams, useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { TbLink } from "react-icons/tb";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { toast } from "react-toastify";

function Landing_Download() {
  const { file_id: download_link } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [downloadLinkInfo, setDownloadLinkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordState, setPasswordState] = useState({
    needed: false,
    correct: null,
    entered: "",
  });
  const [tooltipContent, setTooltipContent] = useState("Copy file link to clipboard");

  useEffect(() => {
    const fetchDownloadLinkInfo = async () => {
      try {
        const response = await fetchDownloadLinkInfoByDownloadLink(download_link);
        if (response.success) {
          setDownloadLinkInfo(response.data);
          setPasswordState((prev) => ({ ...prev, needed: !!response.data.password }));
          // console.log(response.data);
        }
      } catch (error) {
        toast.error(error.response?.data?.msg || "Failed to fetch info");
        setDownloadLinkInfo(null);
      }
    };
    fetchDownloadLinkInfo();
  }, [download_link]);

  useEffect(() => {
    if (downloadLinkInfo && !passwordState.needed) {
      fetchFile();
    }
  }, [downloadLinkInfo]);

  const fetchFile = async () => {
    try {
      setIsLoading(true);
      const response = await fetchFileInfo(download_link);
      if (response.success) {
        setFile(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch info");
    } finally {
      setIsLoading(false);
    }
  };

  const handle_PasswordSubmit = async () => {
    try {
      const response = await validateDownloadLinkPassword(downloadLinkInfo.id, passwordState.entered);
      if (response.success) {
        setPasswordState({ needed: false, correct: true, entered: passwordState.entered });
        fetchFile();
      } else {
        setPasswordState((prev) => ({ ...prev, correct: false }));
      }
    } catch (error) {
      toast.error("Password validation failed");
      setPasswordState((prev) => ({ ...prev, correct: false }));
    }
  };

  const handle_DownloadFile = async () => {
    try {
      await increaseDownloadLinkCountByLinkId(downloadLinkInfo.id);

      const fileBlob = await downloadFileByID(file.id, download_link, passwordState.entered);
      const url = URL.createObjectURL(new Blob([fileBlob]));
      triggerDownload(url, file.originalname);
      URL.revokeObjectURL(url);
      setDownloadLinkInfo((prevInfo) => ({
        ...prevInfo,
        download_count: prevInfo.download_count + 1,
      }));
    } catch (error) {
      // console.error("Failed to download file:", error);
      toast.error("Failed to download");
    }
  };

  const triggerDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setTooltipContent("Link copied!");
    } catch (error) {
      setTooltipContent("Failed to copy!");
    } finally {
      setTimeout(() => setTooltipContent("Copy file link to clipboard"), 2000);
    }
  };

  const validateDownloadLink = () => {
    const currentTime = new Date();

    if (downloadLinkInfo?.expires_at && currentTime > new Date(downloadLinkInfo.expires_at)) {
      return { valid: false, message: "Download link has expired." };
    }

    if (
      downloadLinkInfo?.download_limit != null &&
      downloadLinkInfo.download_limit <= downloadLinkInfo.download_count
    ) {
      return { valid: false, message: "Download limit has been reached." };
    }

    return { valid: true };
  };

  const validation = validateDownloadLink();

  if (!validation.valid) {
    return (
      <Page_BoilerPlate>
        <div className="flex flex-col justify-center items-center">
          <p className="text-red-500">{validation.message}</p>
          <button
            className="w-full bg-cta text-cta-text font-semibold p-2 rounded mt-10 max-w-sm hover:bg-cta-active transition duration-500 ease-in-out"
            onClick={() => navigate("/")}
          >
            Return to home page
          </button>
        </div>
      </Page_BoilerPlate>
    );
  }

  if (!downloadLinkInfo) {
    return (
      <Page_BoilerPlate>
        <div className="flex flex-col justify-center items-center">
          <p className="text-red-500">Download link not found.</p>
          <button
            className="w-full bg-cta text-cta-text font-semibold p-2 rounded mt-10 max-w-sm hover:bg-cta-active transition duration-500 ease-in-out"
            onClick={() => navigate("/")}
          >
            Return to home page
          </button>
        </div>
      </Page_BoilerPlate>
    );
  }

  return (
    <Page_BoilerPlate>
      {passwordState.needed && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handle_PasswordSubmit();
          }}
          className="flex flex-col items-center"
        >
          <input
            type="text"
            className="border p-2 text-black rounded-md"
            value={passwordState.entered}
            onChange={(e) => setPasswordState((prev) => ({ ...prev, entered: e.target.value }))}
            placeholder="Enter password"
          />
          <button
            type="submit"
            className="bg-cta mt-4 p-2 rounded text-cta-text hover:bg-cta-active font-bold transition duration-500 ease-in-out"
          >
            Submit Password
          </button>
          {/* {passwordState.correct === false && (
            <p className="text-red-500 mt-2">Incorrect password, please try again.</p>
          )} */}
        </form>
      )}

      {file && (
        <div>
          <div className="grid grid-cols-2 w-full mx-auto mt-6 text-copy-primary">
            <div className="border border-border p-2 text-left">File ID</div>
            <div className="border border-border p-2 text-left">{file.id}</div>

            <div className="border border-border p-2 text-left">File Name</div>
            <div className="border border-border p-2 text-left whitespace-nowrap overflow-hidden truncate">
              {file.originalname}
            </div>

            <div className="border border-border p-2 text-left">File Size</div>
            <div className="border border-border p-2 text-left">{fileSizeFormatter(file.size)}</div>

            <div className="border border-border p-2 text-left">File Type</div>
            <div className="border border-border p-2 text-left">{file.mimetype}</div>

            <div className="border border-border p-2 text-left">File Created Time</div>
            <div className="border border-border p-2 text-left">{fileDateFormatter(file.created_at)[0]}</div>

            <div className="border border-border p-2 text-left">File Created Date</div>
            <div className="border border-border p-2 text-left">{fileDateFormatter(file.created_at)[1]}</div>

            <div className="border border-border p-2 text-left">File Owner ID</div>
            <div className="border border-border p-2 text-left">{file.user_id}</div>

            <div className="border border-border p-2 text-left">Downloads</div>
            <div className="border border-border p-2 text-left">{downloadLinkInfo?.download_count || "N/A"}</div>
          </div>

          <div>
            <button
              className="mt-4 text-copy-primary hover:text-copy-opp hover:bg-background-opp p-1 rounded-md"
              onClick={copyLinkToClipboard}
              data-tooltip-id="id_link_button"
              data-tooltip-content={tooltipContent}
            >
              <TbLink className="p-1" size={30} />
            </button>
            <Tooltip
              id="id_link_button"
              style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
              opacity={0.9}
              place="bottom"
            />
          </div>

          <button
            onClick={handle_DownloadFile}
            className="p-2 rounded max-w-[200px] w-full mt-4 transition duration-500 ease-in-out font-bold bg-cta hover:bg-cta-active text-cta-text"
          >
            Download
          </button>
        </div>
      )}

      {isLoading && !passwordState.needed && <p>Loading...</p>}
    </Page_BoilerPlate>
  );
}

export default Landing_Download;
