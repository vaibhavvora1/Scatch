const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(value = 0) {
  return inrFormatter.format(Number(value) || 0);
}

export function discountedPrice(product) {
  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  return price - (price * discount) / 100;
}

export function shortId(value = '') {
  return String(value).slice(-8).toUpperCase();
}
