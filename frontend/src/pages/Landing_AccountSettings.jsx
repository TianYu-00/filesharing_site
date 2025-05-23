import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { editUser } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useErrorChecker from "../components/UseErrorChecker";
import PageLoader from "../components/PageLoader";
import PasswordChecklistChecker from "../components/PasswordChecklistChecker";
import { TbId, TbUser, TbMail, TbCalendar, TbLock } from "react-icons/tb";

function Landing_AccountSettings() {
  const navigate = useNavigate();
  const { user, isLoadingUser, setUserInfo, userVerify } = useUser();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const checkError = useErrorChecker();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isPasswordCheckAllPass, setIsPasswordCheckAllPass] = useState(false);

  useEffect(() => {
    const verifyUserLogin = async () => {
      try {
        setIsLoadingPage(true);
        await userVerify();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingPage(false);
      }
    };
    verifyUserLogin();
  }, []);

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
      if (isPasswordCheckAllPass) {
        changes.currentPassword = currentPassword;
        changes.newPassword = newPassword;
      } else {
        toast.error("Password requirements not met.");
        return;
      }
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
      checkError(err);
      // toast.error(err.response?.data?.msg || "Failed. Please try again");
    } finally {
      setNewPassword("");
      setCurrentPassword("");
    }
  };

  return (
    <PageLoader isLoading={isLoadingPage} timer={1500} message="Verifying User">
      <div className="flex justify-center w-full mt-10">
        <div className="grid gap-4 p-4 w-full max-w-[750px] rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="p-4 bg-card rounded-lg">
              {/* User Information */}
              <h2 className="flex font-bold text-2xl text-copy-primary">User Information</h2>
              <p className="flex text-sm text-copy-secondary mb-10">View and update your account details.</p>
              <table className="w-full table-auto">
                <tbody>
                  <tr>
                    <td className="text-copy-primary pr-4 w-2/6 my-2">User ID</td>
                    <td>
                      <div className="relative text-copy-primary my-2">
                        <input
                          type="text"
                          disabled
                          value={user?.id || ""}
                          className="pl-8 pr-4 py-2 border rounded-md w-full bg-card border-border"
                          aria-label="User ID"
                        />
                        <TbId className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="text-copy-primary pr-4 w-2/6 my-2">Username</td>
                    <td>
                      <div className="relative text-copy-primary my-2">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="username"
                          className="pl-8 pr-4 py-2 border rounded-md w-full bg-card border-border"
                          autoComplete="off"
                          aria-label="Username"
                        />
                        <TbUser className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="text-copy-primary pr-4 w-2/6 my-2">Email</td>
                    <td>
                      <div className="relative text-copy-primary my-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email"
                          className="pl-8 pr-4 py-2 border rounded-md w-full bg-card border-border"
                          autoComplete="new-email"
                          aria-label="Email"
                        />
                        <TbMail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="text-copy-primary pr-4 w-2/6 my-2">Created At</td>
                    <td>
                      <div className="relative text-copy-primary my-2">
                        <input
                          type="text"
                          disabled
                          value={dateFormatter(user?.created_at) || ""}
                          className="pl-8 pr-4 py-2 border rounded-md w-full bg-card border-border"
                          aria-label="Created At"
                        />
                        <TbCalendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Password Management */}
            <div className="p-4 bg-card rounded-lg mt-4">
              <h2 className="flex font-bold text-2xl text-copy-primary">Password Management</h2>
              <p className="flex text-sm text-copy-secondary mb-10">
                Update your password here. Password must meet the requirements.
              </p>

              <div className="pb-4">
                <PasswordChecklistChecker
                  rules={{ minLength: 8, capital: 1, specialChar: 1, number: 1, match: false }}
                  password={newPassword}
                  onChange={setIsPasswordCheckAllPass}
                  isHideRuleOnSuccess={false}
                  isCollapsable={true}
                />
              </div>

              <table className="w-full table-auto">
                <tbody>
                  <tr>
                    <td className="text-copy-primary pr-4 w-2/6 my-2">Current Password</td>
                    <td>
                      <div className="relative text-copy-primary my-2">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="current password"
                          className="pl-8 pr-4 py-2 border rounded-md w-full bg-card border-border"
                          autoComplete="new-password"
                          aria-label="Current Password"
                        />
                        <TbLock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="text-copy-primary pr-4 w-2/6 my-2">New Password</td>
                    <td>
                      <div className="relative text-copy-primary my-2">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="new password"
                          className="pl-8 pr-4 py-2 border rounded-md w-full bg-card border-border"
                          autoComplete="new-password"
                          aria-label="New Password"
                        />
                        <TbLock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="mt-4 bg-cta text-cta-text py-2 px-4 rounded hover:bg-cta-active font-bold transition duration-500 ease-in-out"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLoader>
  );
}

function dateFormatter(isoDateTime) {
  const dateTime = new Date(isoDateTime);
  return dateTime.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default Landing_AccountSettings;

/*

*/
