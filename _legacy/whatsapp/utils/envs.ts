require('dotenv').config();

export const isDev = () => {
  return typeof process?.env?.IS_DEV !== 'undefined' && process?.env?.IS_DEV;
}
