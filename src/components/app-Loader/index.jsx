import React from "react";
import appLoader from '../../assets/appLoader.gif';
import "./styles.scss";

const AppLoader = () => {
    return <div className="allLoaderBg">
        <img src={appLoader} alt="" /> 
    </div>
};

export default AppLoader;
