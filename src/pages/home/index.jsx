import React from "react";
import MenuList from '../../components/menuList';
import Wrapper from '../../components/wrapper';
import { menuList } from "../../data/menuList";
import "./styles.scss";

const Home = () => {
  return (
    <Wrapper headertext={'Choose your menu and Customize It!'} footer={false}>
      <section className="home">
        {menuList.map((menu) => <MenuList key={menu.id} menu={menu}/>)}
      </section>
    </Wrapper>
  );
};

export default Home;
