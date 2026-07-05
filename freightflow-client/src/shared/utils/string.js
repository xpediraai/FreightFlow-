export const capitalize = (str) => {
  if (typeof str !== 'string' || !str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str, length = 30) => {
  if (typeof str !== 'string' || !str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};
