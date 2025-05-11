import { useState, useEffect } from "react";

const LoadingScreen = ({ isLoading }) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [isLoading]);

  if (showLoader) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-primary">
        <div className="flex items-center">
          <img src="/nav.png" alt="logo" className="h-15 animate-pulse" />
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingScreen;
