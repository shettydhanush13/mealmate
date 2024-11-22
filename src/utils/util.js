const getPricing = (selectedItems) => {
    const totalPrice = Object.values(selectedItems).reduce((acc, section) => {
        return acc + section.reduce((acc, item) => acc + item.price, 0);
    }, 0);
    return totalPrice;
};

const handleItemAddition = (item, section, limit, selectedItems, selectedItemsId) => {
    const { name, price, id, desc } = item;
    const itemId = `${section}_${id}`;
    const _selectedItems = {...selectedItems};
    const _selectedItemsId = [...selectedItemsId];
    if(!_selectedItems[section]) _selectedItems[section] = [];
    if (_selectedItemsId.includes(itemId)) {
        const index = _selectedItemsId.indexOf(itemId);
        const sectionIndex = _selectedItems[section].findIndex(item => item.id === id);
        if (index > -1) {
            _selectedItemsId.splice(index, 1);
            _selectedItems[section].splice(sectionIndex, 1);
        }
    } else {
        if(_selectedItems[section].length === limit) {
            alert(`Only ${limit} item(s) for this section.`);
        } else {
            _selectedItemsId.push(itemId);
            const selectedItem = {
                id,
                desc,
                name,
                price,
                section,
            }
            _selectedItems[section].push(selectedItem);
        }
    }
    return { _selectedItemsId, _selectedItems };
}

export { getPricing, handleItemAddition };