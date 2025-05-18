export const genPinCode = (size: number) =>
  Math.random().toFixed(size).toString().slice(-size);
