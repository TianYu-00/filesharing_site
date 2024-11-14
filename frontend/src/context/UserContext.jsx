import React, { createContext, useState, useContext } from "react";
import { registerUser, loginUser, verifyUser } from "../api";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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

  const userLogin = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        setUserInfo(response.data);
      }
      return response;
    } catch (error) {
      return error;
    }
  };

  const userLogout = async () => {
    setUser(null);
  };

  const setUserInfo = (userData) => {
    setUser(userData);
  };

  const userVerify = async () => {
    const result = await verifyUser();
    if (result.success) {
      setUser(result.data);
    } else {
      console.log(result.msg);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUserInfo, userLogout, userRegister, userLogin, userVerify }}>
      {children}
    </UserContext.Provider>
  );
};
