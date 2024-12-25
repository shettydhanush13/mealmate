import React from "react";
import MenuList from '../../components/menuList';
import Wrapper from '../../components/wrapper';
import { menuList } from "../../data/menuList";
import existingMenuBanner from '../../assets/existingMenuBanner.webp';
import "./styles.scss";

const Home = () => {
  return (
    <Wrapper headertext={'Choose & Customize Your Menu'} footer={false}>
      <section className="createMenu">
        <img src={existingMenuBanner} alt="" />
      </section>
      <section className="home">
        {menuList.map((menu) => <MenuList key={menu.id} menu={menu}/>)}
      </section>
    </Wrapper>
  );
};

export default Home;
