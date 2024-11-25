import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import bulkorderBanner from '../../assets/bulkorderBanner.png';
import { bulkData, bulkOrderCategories } from '../../data/bulkOrderData';
import ItemCard from '../../components/itemCard';
import Modal from '../../components/modal';
import { getPricing } from "../../utils/util";
import './styles.scss';

const BulkOrder = () => {
    const [bulkItems, setBulkItems] = useState(bulkData.options);
    const [orderCategory, setOrderCategory] = useState(bulkOrderCategories[0]);
    const [selectedItems, setSelectedItems] = useState({});
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const _bulkDataOptions = bulkData.options.filter((option) => option.type.includes(orderCategory));
        setBulkItems(_bulkDataOptions);
    }, [orderCategory])

    const createSelectItem = (name, price, quantity) => {
        const selectedItem = {
            quantity,
            name,
            pricePerItem: price,
            price: price * quantity,
        };
        return selectedItem;
    }

    const updateItemQuantity = (quantity, item) => {
        const { name, price } = item.item;
        const _selectedItems = {...selectedItems};
        if (_selectedItems[name]) {
            if (quantity === 0) {
                delete _selectedItems[name];
            } else {
                _selectedItems[name] = createSelectItem(name, price, quantity);;
            }
        } else {
            if (quantity !== 0) {
                _selectedItems[name] = createSelectItem(name, price, quantity);;
            }
        }
        setSelectedItems(_selectedItems);
    };

    const checkout = () => {
        const selected = {'Items': Object.values(selectedItems)};
        const totalPrice = getPricing(selected);
        if (totalPrice > 0) {
            navigate('/checkout', { state: { type: 'bulk', totalPrice, selectedItems: selected } })
        } else modalOn();
    };

    const modalOn = () => {
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
        }, 3000)
    };

    return (
        <Wrapper headertext={'ORDER IN BULK'} footer={true}>
            <Modal showModal={showModal} title='WARNING' content='Select at least 1 Item' type='warning' />
            <section className="createMenu">
                <img src={bulkorderBanner} alt="" />
            </section>
            <div className="mealBoxContainer">
                <ul className="boxOptionsTitle boxOptionsDishType">
                {bulkOrderCategories.map((category) => <li key={category} onClick={() => setOrderCategory(category)} className={category === orderCategory ? 'active' : ''}>{category}</li>)}
                </ul>
            </div>
            {bulkItems.length > 0 ? bulkItems.map((data =>
                <ItemCard
                    key={data.item.id}
                    item={data.item}
                    onClick={() => {}}
                    selected={false}
                    type='bulk'
                    minQuantity={data.minQuantity}
                    updateItemQuantity={(q) => updateItemQuantity(q, data)}
                />)) : <div className="notFoundMessage">No Items Found</div>}
            <footer className="footer-next" onClick={() => checkout()}>
                <span>Get Pricing</span>
            </footer>
        </Wrapper>
    );
};

export default BulkOrder;
