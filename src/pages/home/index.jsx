import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import MenuList from "../../components/menuList";
import Wrapper from "../../components/wrapper";
import logo_orange from '../../assets/logo_orange.png'
import { menuList } from "../../data/menuList";
import "./styles.scss";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Customize Your Menu | CaterKart</title>
        <meta
          name="description"
          content="Explore a variety of menus and customize your favorite dishes to create the perfect dining experience with CaterKart."
        />
        <meta
          name="keywords"
          content="CaterKart, Custom Menus, Party Menu, Corporate Catering, Food Customization"
        />
        <meta name="author" content="CaterKart Team" />
        <meta property="og:title" content="Home | Customize Your Menu | CaterKart" />
        <meta
          property="og:description"
          content="Choose and customize your menu with CaterKart for your next event or gathering. Delicious food tailored to your taste!"
        />
        <meta property="og:image" content={logo_orange} />
        <meta property="og:url" content="https://caterkart.in/menu" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://caterkart.in/menu" />
      </Helmet>

      <Wrapper headertext="CaterKart" footer={false}>
        <section className="pageDescSection">
          <header>
              <h1>PICK AND PERSONALIZE YOUR MEAL</h1>
              <p>AUTHENTIC SOUTH/NORTH INDIAN CUISINE</p>
          </header>
        </section>

        <section className="home">
          {menuList.length ? (
            menuList.map((menu) => <MenuList key={menu.id} menu={menu} />)
          ) : (
            <p>No menu items available.</p>
          )}
        </section>
      </Wrapper>
    </>
  );
};

export default Home;
