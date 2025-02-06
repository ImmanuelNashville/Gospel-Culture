export const validatePromoCodeFormat = (value: string) => {
  if (typeof value !== 'string') return false;
  if (value.trim().length < 3) return false;
  if (!/^[a-zA-Z0-9]+$/.test(value)) return false;
  return true;
};
