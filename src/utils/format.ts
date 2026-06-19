export function formatPoints(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
}
