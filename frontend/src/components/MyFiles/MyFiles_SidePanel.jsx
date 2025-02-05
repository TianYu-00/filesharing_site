import React from "react";
import { useUser } from "../../context/UserContext";
import { animated } from "@react-spring/web";
import { TbTrash, TbStar, TbFiles, TbX } from "react-icons/tb";
import { useSpring } from "@react-spring/web";

function MyFiles_SidePanel({
  setIsSideBarOpen,
  pageState,
  setPageState,
  allFiles,
  setDisplayFiles,
  setButtonMenu,
  isSideBarOpen,
}) {
  const { user } = useUser();

  const handle_AllFiles = () => {
    setPageState("all");
    const filteredFiles = allFiles.filter((file) => file.trash !== true);
    setDisplayFiles(filteredFiles);
    setButtonMenu({
      download: true,
      preview: true,
      rename: true,
      manage_link: true,
      delete: false,
      favourite: true,
      unfavourite: false,
      trash: true,
      restore: false,
    });
  };

  const handle_AllFavourite = () => {
    setPageState("favourite");
    const filteredFiles = allFiles.filter((file) => file.favourite === true && file.trash !== true);
    setDisplayFiles(filteredFiles);
    setButtonMenu({
      download: true,
      preview: true,
      rename: true,
      manage_link: true,
      delete: false,
      favourite: false,
      unfavourite: true,
      trash: true,
      restore: false,
    });
  };

  const handle_AllTrash = () => {
    setPageState("trash");
    const filteredFiles = allFiles.filter((file) => file.trash === true);
    setDisplayFiles(filteredFiles);
    setButtonMenu({
      download: true,
      preview: true,
      rename: false,
      manage_link: false,
      delete: true,
      favourite: false,
      unfavourite: false,
      trash: false,
      restore: true,
    });
  };

  const sideBarDrawerAnimation = useSpring({
    transform: isSideBarOpen ? "translateX(0)" : "translateX(-100%)",
    opacity: isSideBarOpen ? 1 : 0,
    config: { tension: 300, friction: 30 },
    immediate: !isSideBarOpen,
  });

  return (
    <div className="fixed top-0 left-0 w-full h-screen z-50">
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-80`}
        onClick={() => setIsSideBarOpen(false)}
      />
      <animated.div
        className={`flex flex-col text-white bg-background w-full h-full p-4 max-w-sm`}
        style={sideBarDrawerAnimation}
      >
        <div className="p-2 py-4 relative">
          <button
            className="text-copy-secondary text-xl font-bold px-2 absolute right-0 top-4 hover:text-red-700"
            onClick={() => setIsSideBarOpen(false)}
          >
            <TbX size={17} strokeWidth={3} />
          </button>
          <p className="text-3xl font-bold text-copy-primary whitespace-nowrap overflow-hidden truncate">
            {user?.username}
          </p>
          <p className="text-copy-secondary whitespace-nowrap overflow-hidden truncate">{user?.email}</p>
        </div>

        <div className="border border-border mb-4"></div>

        <div className="text-copy-primary">
          <div className="my-2">
            <button
              className={`w-full text-left rounded-lg p-2 py-3 flex items-center hover:text-copy-opp hover:bg-background-opp ${
                pageState === "all" ? "text-copy-opp bg-background-opp" : ""
              }`}
              onClick={handle_AllFiles}
            >
              <TbFiles />
              <span className="pl-4">All Files</span>
            </button>
          </div>
          <div className="my-2">
            <button
              className={`w-full text-left rounded-lg p-2 py-3 flex items-center hover:text-copy-opp hover:bg-background-opp ${
                pageState === "favourite" ? "text-copy-opp bg-background-opp" : ""
              }`}
              onClick={handle_AllFavourite}
            >
              <TbStar />
              <span className="pl-4">Favourite</span>
            </button>
          </div>
          <div className="my-2">
            <button
              className={`w-full text-left rounded-lg p-2 py-3 flex items-center hover:text-copy-opp hover:bg-background-opp ${
                pageState === "trash" ? "text-copy-opp bg-background-opp" : ""
              }`}
              onClick={handle_AllTrash}
            >
              <TbTrash />
              <span className="pl-4">Trash</span>
            </button>
          </div>
        </div>
      </animated.div>
    </div>
  );
}

export default MyFiles_SidePanel;
