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

function Landing_AccountSettings() {
  const navigate = useNavigate();
  const { user, isLoadingUser, setUserInfo } = useUser();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user && !isLoadingUser) {
      setTimeout(() => navigate("/login"), 0);
    }
  }, [user, isLoadingUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const changes = {};

    if (username !== user?.username) changes.username = username;
    if (email !== user?.email) {
      if (!currentPassword) {
        setMessage("Please enter your current password to change your email");
        return;
      }
      changes.email = email;
      changes.currentPassword = currentPassword;
    }

    if (newPassword) {
      if (!currentPassword) {
        setMessage("Please enter your current password to change your password");
        return;
      }
      changes.currentPassword = currentPassword;
      changes.newPassword = newPassword;
    }

    if (Object.keys(changes).length === 0) {
      setMessage("No changes detected");
      return;
    }

    try {
      const changeResponse = await editUser(user.id, changes);
      if (changeResponse.success) {
        setMessage("Changes saved successfully!");
        setUserInfo(changeResponse.data);
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || "Failed. Please try again");
    }
  };

  return (
    <Page_BoilerPlate>
      <div className="flex justify-center">
        <div className="border grid gap-4 p-4 w-full max-w-[500px] rounded-2xl bg-white text-black">
          <p>Manage Your Account Information</p>
          <p className="flex font-bold text-2xl">Edit Account</p>

          <form onSubmit={handleSubmit}>
            {/* User ID */}
            <div className="relative mb-4">
              <input type="text" disabled value={user?.id || ""} className="pl-8 pr-4 py-2 border rounded-md w-full" />
              <BsPersonVcardFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Username */}
            <div className="relative mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="pl-8 pr-4 py-2 border rounded-md w-full"
              />
              <BsFillPersonFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Email */}
            <div className="relative mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="pl-8 pr-4 py-2 border rounded-md w-full"
              />
              <BsEnvelopeFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Account Creation Date */}
            <div className="relative mb-4">
              <input
                type="text"
                disabled
                value={dateFormatter(user?.created_at) || ""}
                className="pl-8 pr-4 py-2 border rounded-md w-full"
              />
              <BsCalendarDateFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Current Password */}
            <div className="relative mb-4">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="current password"
                className="pl-8 pr-4 py-2 border rounded-md w-full"
              />
              <BsFillLockFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* New Password */}
            <div className="relative mb-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="new password"
                className="pl-8 pr-4 py-2 border rounded-md w-full"
              />
              <BsFillLockFill className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            <div className="flex flex-col">
              <p className="text-red-500">{message}</p>
            </div>

            {/* Save Button */}
            <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </Page_BoilerPlate>
  );
}

function dateFormatter(isoDateTime) {
  const dateTime = new Date(isoDateTime);
  return dateTime.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default Landing_AccountSettings;
