import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import createMenuBanner from '../../assets/createMenuBanner.png';
import { bulkData } from '../../data/bulkOrderData';
import ItemCard from '../../components/itemCard';
import { getPricing } from "../../utils/util";
import './styles.scss';

const BulkOrder = () => {
    const [bulkItems] = useState(bulkData.options);
    const [selectedItems, setSelectedItems] = useState({});
    const navigate = useNavigate();

    const updateItemQuantity = (quantity, item) => {
        const _selectedItems = {...selectedItems};

        if (_selectedItems[item.item.name]) {
            if (quantity === 0 ) {
                delete _selectedItems[item.item.name];
            } else {
                const selectedItem = {
                    quantity,
                    name: item.item.name,
                    price: item.item.price,
                    totalPrice: item.item.price * quantity,
                };
                _selectedItems[item.item.name] = selectedItem;
            }
        } else {
            const selectedItem = {
                quantity,
                name: item.item.name,
                pricePerItem: item.item.price,
                price: item.item.price * quantity,
            };
            _selectedItems[item.item.name] = selectedItem;
        }
        setSelectedItems(_selectedItems);
    };

    const checkout = () => {
        const selected = { 'Items': Object.values(selectedItems)};
        const totalPrice = getPricing(selected);
        navigate('/mealbox/checkout', { state: { type: 'bulk', totalPrice, selectedItems: selected } })
    }

    return (
        <Wrapper headertext={'Order In Bulk'} footer={true}>
            <section className="createMenu">
                <img src={createMenuBanner} alt="" />
            </section>
            {bulkItems.map((data => <>
                <ItemCard
                    key={data.item.id}
                    item={data.item}
                    onClick={() => {}}
                    selected={false}
                    type='bulk'
                    minQuantity={data.minQuantity}
                    updateItemQuantity={(q) => updateItemQuantity(q, data)}
                />
            </>))}
            <footer className="footer-next" onClick={() => checkout()}>
                <span>Get Pricing</span>
            </footer>
        </Wrapper>
    );
};

export default BulkOrder;
