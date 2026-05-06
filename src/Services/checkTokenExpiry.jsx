const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1])); // Decode JWT token payload
  } catch (e) {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  console.log("isTokenExpired check every 5mi");

  return decoded.exp * 1000 < Date.now();
};
