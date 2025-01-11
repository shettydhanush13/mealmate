import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Wrapper from "../../components/wrapper";
import ItemCard from "../../components/itemCard";
import BasicModal from "../../components/modal";
import logowhite from "../../assets/logowhite.png";
import "./styles.scss";

const Menu = () => {
  const location = useLocation();
  const menu = location.state;

  const navigate = useNavigate();
  const [sections] = useState(Object.keys(menu.sections));
  const [selectedItems, setSelectedItems] = useState(null);
  const [itemsWithPrice, setItemsWithPrice] = useState({});
  const [itemsLimit, setItemsLimit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: "", body: "" });

  useEffect(() => {
    if (sections) {
      let _selectedItems = {};
      let _itemsWithPrice = {};
      let _itemsLimit = {};
      for (const section of sections) {
        _selectedItems[section] = [];
        _itemsLimit[section] = menu.sections[section].limit;
        for (const option of menu.sections[section].options) {
          if (option.extraPricing) _itemsWithPrice[option.name] = option.extraPricing;
          if (section === "Fixed Items") {
            _selectedItems[section].push(option.name);
          }
        }
      }
      setSelectedItems(_selectedItems);
      setItemsWithPrice(_itemsWithPrice);
      setItemsLimit(_itemsLimit);
    }
  }, [sections, menu.sections]);

  const handleAdd = (section, { name, price }) => {
    let _selectedItems = { ...selectedItems };
    const selectedItemsInSection = _selectedItems[section];
    if (selectedItemsInSection.includes(name)) {
      const index = selectedItemsInSection.indexOf(name);
      if (index > -1) {
        selectedItemsInSection.splice(index, 1);
      }
    } else {
      const limitExceeded = selectedItemsInSection.length + 1 > itemsLimit[section];
      if (itemsLimit[section] && limitExceeded) {
        const message = {
          title: "Item Limit Exceeded",
          body: `Only ${selectedItemsInSection.length} Item${selectedItemsInSection.length > 1 ? "s" : ""} can be added in ${section}.`,
        };
        modalOn(message);
      } else selectedItemsInSection.push(name);
    }
    setSelectedItems(_selectedItems);
  };

  const modalOn = (message) => {
    setModalMessage(message);
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 2000);
  };

  const getPricing = () => {
    for (const section of sections) {
      const limit = itemsLimit[section];
      const selected = selectedItems[section].length;
      if (limit && selected < limit) {
        const message = { title: "WARNING!", body: `Add ${limit - selected} more Items to ${section}` };
        modalOn(message);
        return;
      }
    }
    navigate("/menu/checkout", { state: { selectedItems, itemsWithPrice, menu } });
  };

  return (
    <>
      <Helmet>
        <title>Customize {menu.name} | CaterKart</title>
        <meta
          name="description"
          content={`Customize your menu for ${menu.name}. Add dishes, tailor selections, and create the perfect dining experience with CaterKart.`}
        />
        <meta
          name="keywords"
          content="CaterKart, Customize Menu, Catering Options, Party Menus, Event Menus"
        />
        <meta name="author" content="CaterKart Team" />
        <meta property="og:title" content={`${menu.name} | Customize Your Menu | CaterKart`} />
        <meta
          property="og:description"
          content={`Create your own custom menu for ${menu.name}. Explore a wide variety of dishes tailored for your event.`}
        />
        <meta property="og:image" content={logowhite} />
        <meta property="og:url" content={`https://caterkart.in/menu/${menu.name}`} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://caterkart.in/menu/${menu.name}`} />
      </Helmet>

      <Wrapper headertext={menu.name} footer={true}>
        {selectedItems && (
          <div className="menu">
            <BasicModal
              showModal={showModal}
              title={modalMessage.title}
              content={modalMessage.body}
              type="warning"
            />
            <section className="menu-section">
              {sections.map((section) => (
                <div key={section} className="menu-category">
                  <div className="sectionHeader">
                    {menu.sections[section].fixed || !menu.sections[section].limit ? (
                      <p>{section}</p>
                    ) : (
                      <p>
                        {section} ( {selectedItems[section].length} / {menu.sections[section].limit} )
                      </p>
                    )}
                  </div>
                  <div className="sectionItems">
                    {menu.sections[section].options.map((option) => (
                      <ItemCard
                        key={option.id}
                        item={option}
                        onClick={() => handleAdd(section, option)}
                        selected={selectedItems[section]?.includes(option.name)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
            <div className="footer-next" onClick={getPricing}>
              <img src={logowhite} alt="" />
              <span>Checkout</span>
            </div>
          </div>
        )}
      </Wrapper>
    </>
  );
};

export default Menu;
