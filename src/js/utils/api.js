import { REQUEST_HEADER_HOST } from '../constants.js';

export const request = async (url, option = {}) => {
  const response = await fetch(url, option);
  if (response.ok) {
    return response;
  }
};

export const getPostOption = (
  body,
  headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Host: REQUEST_HEADER_HOST,
  },
) => {
  return {
    method: 'POST',
    headers,
    body,
  };
};
