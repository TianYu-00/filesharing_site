import React, { useEffect, useState } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { useUser } from "../context/UserContext";

function Landing_MyFiles() {
  const { user, isLoadingUser } = useUser();

  useEffect(() => {
    if (!user && !isLoadingUser) {
      setTimeout(() => navigate("/login"), 0);
    }
  }, [user, isLoadingUser]);

  return <Page_BoilerPlate> MyFiles Landing Page</Page_BoilerPlate>;
}

export default Landing_MyFiles;
