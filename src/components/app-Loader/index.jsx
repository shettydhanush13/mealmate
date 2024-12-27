import React from "react";
import appLoader from '../../assets/appLoader.gif';
import "./styles.scss";

const AppLoader = () => {
  return (
    <div className="allLoaderBg">
      <img 
        src={appLoader} 
        alt="Loading... Please wait while we prepare your experience." 
        className="loaderImage"
      /> 
    </div>
  );
};

export default AppLoader;
