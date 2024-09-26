export const toINR = (number, fractionDigit = 2) => {
    return number.toLocaleString('en-IN', {
        maximumFractionDigits: fractionDigit,
        style: 'currency',
        currency: 'INR'
    });
}