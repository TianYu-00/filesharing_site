import React, { useState, useEffect } from "react";
import HashLoader from "react-spinners/HashLoader";

function PageLoader({ isLoading, timer = 2000, message = "", children }) {
  const [shouldDisplayLoader, setShouldDisplayLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShouldDisplayLoader(true);
    } else {
      const timeoutId = setTimeout(() => {
        setShouldDisplayLoader(false);
      }, timer);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isLoading]);

  if (shouldDisplayLoader || isLoading) {
    return (
      <div className="fixed top-0 left-0 h-screen w-screen z-50 flex items-center justify-center bg-background overflow-hidden flex flex-col">
        <HashLoader color="#1764FF" />
        <p className="text-copy-secondary pt-4 animate-pulse">{message}</p>
      </div>
    );
  } else {
    return <>{children}</>;
  }
}

export default PageLoader;
