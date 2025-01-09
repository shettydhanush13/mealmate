const getPricing = (selectedItems) => {
    const totalPrice = Object.values(selectedItems).reduce((acc, section) => {
        return acc + section.reduce((acc, item) => acc + item.price, 0);
    }, 0);
    return totalPrice;
};

const calculateProductPrice = (products) => {
    const _pricing = {
        total : 0,
        discount: 0,
        finalPrice: 0,
    };
    for(const product of products) {
        _pricing.total += product.price.max;
        _pricing.discount += (product.price.max - product.price.min);
    } 
    _pricing.finalPrice = _pricing.total - _pricing.discount;
    return {
        total: _pricing.total,
        discount: _pricing.discount,
        finalPrice: _pricing.finalPrice,
    }
}

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

const toINR = (number, fractionDigit = 2) => {
    return number.toLocaleString('en-IN', {
        maximumFractionDigits: fractionDigit,
        style: 'currency',
        currency: 'INR'
    });
}

const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
 
export { getPricing, handleItemAddition, calculateProductPrice, toINR, formatDate };