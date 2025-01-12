import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import ItemCard from "../../components/itemCard";
import Modal from "../../components/modal";
import { bulkData } from "../../data/bulkOrderData";
import { getPricing } from "../../utils/util";
import logowhite from "../../assets/logowhite.png";

import "./styles.scss";

const BulkOrder = () => {
    const [bulkItems] = useState(bulkData.options);
    const [selectedItems, setSelectedItems] = useState({});
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const createSelectItem = (name, price, quantity) => {
        return {
            quantity,
            name,
            pricePerItem: price,
            price: price * quantity,
        };
    };

    const updateItemQuantity = (quantity, item) => {
        const { name, price } = item.item;
        const _selectedItems = { ...selectedItems };
        if (_selectedItems[name]) {
            if (quantity === 0) {
                delete _selectedItems[name];
            } else {
                _selectedItems[name] = createSelectItem(name, price, quantity);
            }
        } else {
            if (quantity !== 0) {
                _selectedItems[name] = createSelectItem(name, price, quantity);
            }
        }
        setSelectedItems(_selectedItems);
    };

    const checkout = () => {
        const selected = { Items: Object.values(selectedItems) };
        const totalPrice = getPricing(selected);
        if (totalPrice > 0) {
            navigate("checkout", { state: { totalPrice, selectedItems: selected } });
        } else {
            modalOn();
        }
    };

    const modalOn = () => {
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
        }, 3000);
    };

    return (
        <>
            <Helmet>
                <title>Bulk Orders | CaterKart</title>
                <meta
                    name="description"
                    content="Order delicious meals in bulk for your corporate events, parties, or gatherings with CaterKart. Customize your order to suit your needs."
                />
                <meta
                    name="keywords"
                    content="CaterKart, Bulk Orders, Corporate Events, Party Catering, Food Delivery"
                />
                <meta name="author" content="CaterKart Team" />
                <meta property="og:title" content="Bulk Orders | CaterKart" />
                <meta
                    property="og:description"
                    content="Order bulk meals and food items for parties, corporate events, or gatherings. Customize your bulk order easily with CaterKart."
                />
                <meta property="og:image" content={logowhite} />
                <meta property="og:url" content="https://caterkart.in/bulk" />
                <meta property="og:type" content="website" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://caterkart.in/bulk" />
            </Helmet>
            <Wrapper headertext={"CaterKart"} footer={true}>
                <Modal showModal={showModal} title="WARNING" content="Select at least 1 Item" type="warning" />
                <section className="pageDescSection">
                    <header>
                        <h1>BULK ORDER BREAKFAST / SNACKS</h1>
                        <p>AUTHENTIC UDUPI STYLE CUISINE</p>
                    </header>
                </section>
                <section className="bulkItemsSection">
                    {bulkItems.length > 0 ? (
                        bulkItems.map((data) => (
                            <ItemCard
                                key={data.item.id}
                                item={data.item}
                                onClick={() => {}}
                                selected={false}
                                type="bulk"
                                minQuantity={data.minQuantity}
                                updateItemQuantity={(q) => updateItemQuantity(q, data)}
                            />
                        ))
                    ) : (
                        <div className="notFoundMessage">No Items Found</div>
                    )}
                </section>
                <footer className="footer-next" onClick={() => checkout()}>
                    <img src={logowhite} alt="CaterKart Logo" />
                    <span>Checkout</span>
                </footer>
            </Wrapper>
        </>
    );
};

export default BulkOrder;
