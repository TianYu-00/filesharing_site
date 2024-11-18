import React, { useEffect, useState } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { useUser } from "../context/UserContext";
import { fetchFilesByUserId } from "../api";
import { fileSizeFormatter, fileDateFormatter_DateOnly } from "../components/File_Formatter";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

function Landing_MyFiles() {
  const navigate = useNavigate();
  const { user, isLoadingUser } = useUser();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!user && !isLoadingUser) {
      setTimeout(() => navigate("/login"), 0);
    }
  }, [user, isLoadingUser]);

  useEffect(() => {
    const getFiles = async () => {
      const allFiles = await fetchFilesByUserId(user.id);
      //   console.log(allFiles.data);
      setFiles(allFiles.data);
    };

    if (user) {
      getFiles();
    }
  }, [user]);

  return (
    <div className="pt-20">
      {/* MyFiles Landing Page */}
      {/* <div className="flex justify-center text-white">MyFiles Landing Page</div> */}
      <table className="table-auto w-full text-white text-left">
        <thead className="border-b-2 border-gray-500">
          <tr>
            <th className="px-2 py-2 ">Name</th>
            <th className="px-2 py-2">Size</th>
            <th className="px-2 py-2">Uploaded</th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>

        <tbody className="">
          {Array.isArray(files) && files.length > 0 ? (
            files.map((file) => {
              return (
                <tr key={file.id} className="hover:bg-neutral-900 border-b border-gray-500">
                  <td className="px-2 py-1 ">{file.originalname}</td>
                  <td className="px-2 py-1 ">{fileSizeFormatter(file.size)}</td>
                  <td className="px-2 py-1 ">{fileDateFormatter_DateOnly(file.created_at)}</td>
                  <td className="px-2 py-1 ">
                    <button className="p-2 rounded-full hover:bg-black">
                      <BsThreeDotsVertical className="" size={17} />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Landing_MyFiles;

// Some things i want:
// Original Name, Size, Created At, Dropdown menu

/*
 <tr>
            <td className="px-4 py-2">File 1</td>
            <td className="px-4 py-2">10 MB</td>
            <td className="px-4 py-2">Today</td>
            <td className="px-4 py-2">
              <button className="bg-black p-1 rounded">Options</button>
            </td>
          </tr>

*/
