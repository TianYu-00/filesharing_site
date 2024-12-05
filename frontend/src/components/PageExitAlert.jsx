import { useEffect } from "react";

const PageExitAlert = () => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const alertMessage = "Are you sure you want to leave? Any unsaved changes will be lost.";
      event.returnValue = alertMessage;
      return alertMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
};

export default PageExitAlert;
