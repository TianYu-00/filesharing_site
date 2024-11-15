import React, { createContext, useState, useContext } from "react";
import { registerUser, loginUser, verifyUser, logoutUser } from "../api";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const userRegister = async (username, email, password) => {
    try {
      const response = await registerUser(username, email, password);
      if (response.success) {
        setUserInfo(response.data);
      }
      return response;
    } catch (error) {
      return error;
    }
  };

  const userLogin = async (email, password, isRememberMe) => {
    try {
      const response = await loginUser(email, password, isRememberMe);
      if (response.success) {
        setUserInfo(response.data);
      }
      return response;
    } catch (error) {
      return error;
    }
  };

  const userLogout = async () => {
    const response = await logoutUser();
    if (response.success) {
      setUserInfo(response.data);
      setUser(null);
    }
    return response;
  };

  const setUserInfo = (userData) => {
    setUser(userData);
  };

  const userVerify = async () => {
    try {
      setIsLoadingUser(true);
      const result = await verifyUser();
      if (result.success) {
        setUser(result.data);
      } else {
        console.log(result.msg);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoadingUser(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUserInfo, userLogout, userRegister, userLogin, userVerify, isLoadingUser }}>
      {children}
    </UserContext.Provider>
  );
};
