import React from "react";
import MenuList from '../../components/menuList';
import Wrapper from '../../components/wrapper';
// import logo from '../../assets/logo_white.png';
import { menuList } from "../../data/menuList";
import "./styles.scss";

const Home = () => {
  return (
    <Wrapper headertext={'Choose your menu and Customize It!'} footer={false}>
      {/* <img src={logo} alt="" /> */}
      <div className="home">
        {menuList.map((menu) => <MenuList menu={menu}/>)}
      </div>
    </Wrapper>
  );
};

export default Home;
