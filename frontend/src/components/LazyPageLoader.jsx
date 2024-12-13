import React, { useState, useEffect } from "react";
import HashLoader from "react-spinners/HashLoader";

const LazyPageLoader = ({ delay = 300, color = "#1764FF" }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  return show ? (
    <div className="fixed top-0 left-0 h-screen w-screen z-50 flex items-center justify-center bg-background overflow-hidden">
      <HashLoader color={color} />
    </div>
  ) : null;
};

export default LazyPageLoader;
