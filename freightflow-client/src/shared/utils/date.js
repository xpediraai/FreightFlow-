export const formatDate = (date, locale = 'en-US', options = {}) => {
  if (!date) return '';
  const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
};
