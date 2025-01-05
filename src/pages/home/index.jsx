import React, { useEffect } from "react";
import MenuList from '../../components/menuList';
import Wrapper from '../../components/wrapper';
import { menuList } from "../../data/menuList";
import existingMenuBanner from '../../assets/existingMenuBanner.webp';
import "./styles.scss";

const Home = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Wrapper headertext="Choose & Customize Your Menu" footer={false}>
      <section className="createMenu">
        <img src={existingMenuBanner} alt="A variety of delicious food options" />
      </section>

      <section className="home">
        {menuList.length ? (
          menuList.map((menu) => <MenuList key={menu.id} menu={menu} />)
        ) : (
          <p>No menu items available.</p>
        )}
      </section>
    </Wrapper>
  );
};

export default Home;
