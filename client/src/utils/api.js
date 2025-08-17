// API utility for handling different environments
export const getApiUrl = () => {
  return process.env.REACT_APP_API_URL || '';
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  return fetch(url, options);
};