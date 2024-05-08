export const storeInSession = (key, value) => {
  return sessionStorage.setItem(key, value);
};

export const lookInSession = (key) => {
  return sessionStorage.getItem(key);
};

export const removeFromSession = (key) => {
  return sessionStorage.removeItem(key);
};

const logOutUser = () => {
  sessionStorage.clear();
};

export { storeInSession, lookInSession, removedFromSession, logOutUser };