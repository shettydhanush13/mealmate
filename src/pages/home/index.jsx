import React from "react";
import MenuList from '../../components/menuList';
import { menuList } from "../../data/menuList";
import "./styles.scss";

const Home = () => {
  return (
    <div className="home">
      <h3>Choose a menu and customize it!</h3>
      {menuList.map((menu) => <MenuList menu={menu}/>)}
    </div>
  );
};

export default Home;
