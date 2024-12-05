import React, { useEffect, useState } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { useUser } from "../context/UserContext";
import {
  BsPersonVcardFill,
  BsFillPersonFill,
  BsEnvelopeFill,
  BsCalendarDateFill,
  BsFillLockFill,
} from "react-icons/bs";

import { editUser } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Landing_AccountSettings() {
  const navigate = useNavigate();
  const { user, isLoadingUser, setUserInfo } = useUser();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user && !isLoadingUser) {
      setTimeout(() => navigate("/auth"), 0);
    }
  }, [user, isLoadingUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const changes = {};

    if (username !== user?.username) changes.username = username;
    if (email !== user?.email) {
      if (!currentPassword) {
        toast.error("Current password is required to change email");
        return;
      }
      changes.email = email;
      changes.currentPassword = currentPassword;
    }

    if (newPassword) {
      if (!currentPassword) {
        toast.error("Current password is required to change password");
        return;
      }
      changes.currentPassword = currentPassword;
      changes.newPassword = newPassword;
    }

    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected");
      return;
    }

    try {
      const changeResponse = await editUser(user.id, changes);
      if (changeResponse.success) {
        toast.success("Changes saved successfully!");
        setUserInfo(changeResponse.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed. Please try again");
    } finally {
      setNewPassword("");
      setCurrentPassword("");
    }
  };

  return (
    <div className="flex justify-center w-full mt-10">
      <div className="grid gap-4 p-4 w-full max-w-[750px] rounded-lg md:bg-[#181A1B]">
        <form onSubmit={handleSubmit}>
          <div className="p-4 bg-[#131515] rounded-lg">
            {/* User Information */}
            <p className="flex font-bold text-xl text-white mb-4">User Information</p>
            <table className="w-full table-auto">
              <tbody>
                <tr>
                  <td className="text-white pr-4 w-2/6">User ID</td>
                  <td>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        disabled
                        value={user?.id || ""}
                        className="pl-8 pr-4 py-2 border rounded-md w-full bg-[#1E2022] text-white border-gray-600"
                      />
                      <BsPersonVcardFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="text-white pr-4 w-2/6">Username</td>
                  <td>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        className="pl-8 pr-4 py-2 border rounded-md w-full text-white bg-[#121212] border-gray-600"
                        autoComplete="off"
                      />
                      <BsFillPersonFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="text-white pr-4 w-2/6">Email</td>
                  <td>
                    <div className="relative mb-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                        className="pl-8 pr-4 py-2 border rounded-md w-full text-white bg-[#121212] border-gray-600"
                        autoComplete="new-email"
                      />
                      <BsEnvelopeFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="text-white pr-4 w-2/6">Created At</td>
                  <td>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        disabled
                        value={dateFormatter(user?.created_at) || ""}
                        className="pl-8 pr-4 py-2 border rounded-md w-full bg-[#1E2022] text-white border-gray-600"
                      />
                      <BsCalendarDateFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Password Management */}
          <div className="p-4 bg-[#131515] rounded-lg mt-4">
            <p className="font-bold text-xl text-white mb-4">Password Management</p>
            <table className="w-full table-auto">
              <tbody>
                <tr>
                  <td className="text-white pr-4 w-2/6">Current Password</td>
                  <td>
                    <div className="relative mb-4">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="current password"
                        className="pl-8 pr-4 py-2 border rounded-md w-full text-white bg-[#121212] border-gray-600"
                        autoComplete="new-password"
                      />
                      <BsFillLockFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="text-white pr-4 w-2/6">New Password</td>
                  <td>
                    <div className="relative mb-4">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="new password"
                        className="pl-8 pr-4 py-2 border rounded-md w-full text-white bg-[#121212] border-gray-600"
                        autoComplete="new-password"
                      />
                      <BsFillLockFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 font-bold transition duration-500 ease-in-out"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function dateFormatter(isoDateTime) {
  const dateTime = new Date(isoDateTime);
  return dateTime.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default Landing_AccountSettings;

/*

*/
