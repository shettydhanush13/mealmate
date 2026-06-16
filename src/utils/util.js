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

const toINR = (number, fractionDigit = 2) => {
    return number.toLocaleString('en-IN', {
        maximumFractionDigits: fractionDigit,
        style: 'currency',
        currency: 'INR'
    });
}

function formatDateShort(dateInput) {
    if (!dateInput) return "";
    
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
  
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, "0");
  
    return `${month}-${day}`;
  }
 
export { getPricing, calculateProductPrice, toINR, formatDateShort };