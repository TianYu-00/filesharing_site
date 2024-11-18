import React, { useState, useEffect } from "react";

const CookieBanner = () => {
  const [isCookieBannerShowing, setIsCookieBannerShowing] = useState(false);

  useEffect(() => {
    const cookieAcknowledged = document.cookie.split("; ").find((row) => row.startsWith("cookieConsentStatus="));
    if (!cookieAcknowledged) {
      setIsCookieBannerShowing(true);
    }
  }, []);

  const handle_IUnderstandButton = () => {
    document.cookie = "cookieConsentStatus=true; max-age=" + 60 * 60 * 24 * 365;
    setIsCookieBannerShowing(false);
  };

  if (!isCookieBannerShowing) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 shadow-lg z-50 flex justify-between items-center">
      <p className="text-sm">
        We use cookies to improve your experience on our site. By clicking 'I Understand' or continuing to browse, you
        agree to our use of cookies.
      </p>
      <button onClick={handle_IUnderstandButton} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
        I Understand
      </button>
    </div>
  );
};

export default CookieBanner;
