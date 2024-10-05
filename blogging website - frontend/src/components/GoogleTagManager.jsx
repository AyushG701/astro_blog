import React from "react";

const GoogleTagManager = () => {
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-CLH22WVYRQ"; // Replace with your actual GTM ID
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "G-CLH22WVYRQ"); // Replace with your actual GTM ID

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null; // This component does not render anything
};

export default GoogleTagManager;
