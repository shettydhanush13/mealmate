import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import bulkorderBanner from '../../assets/bulkorderBanner.png';
import { bulkData } from '../../data/bulkOrderData';
import ItemCard from '../../components/itemCard';
import { getPricing } from "../../utils/util";
import './styles.scss';

const BulkOrder = () => {
    const [bulkItems] = useState(bulkData.options);
    const [selectedItems, setSelectedItems] = useState({});
    const navigate = useNavigate();

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
        } else alert('Pick at least 1 item');
    }

    return (
        <Wrapper headertext={'ORDER IN BULK'} footer={true}>
            <section className="createMenu">
                <img src={bulkorderBanner} alt="" />
            </section>
            {bulkItems.map((data =>
                <ItemCard
                    key={data.item.id}
                    item={data.item}
                    onClick={() => {}}
                    selected={false}
                    type='bulk'
                    minQuantity={data.minQuantity}
                    updateItemQuantity={(q) => updateItemQuantity(q, data)}
                />))}
            <footer className="footer-next" onClick={() => checkout()}>
                <span>Get Pricing</span>
            </footer>
        </Wrapper>
    );
};

export default BulkOrder;
