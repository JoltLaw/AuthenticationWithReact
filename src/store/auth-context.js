import react, { useState, useEffect, useCallback } from "react";

let logoutTimer;

const AuthContext = react.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calculateRemaningTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  const remaingDuration = adjExpirationTime - currentTime;

  return remaingDuration;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpiration = localStorage.getItem("expirationtime");

  const remaingTime = calculateRemaningTime(storedExpiration);
  if (remaingTime <= 6000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationtime");
    return null;
  }

  return { token: storedToken, duration: storedExpiration };
};

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  let initToken;
  if (tokenData) {
    initToken = tokenData.token;
  }
  const [token, setToken] = useState(initToken);

  const userIsLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationtime", expirationTime);
    const remaingTime = calculateRemaningTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remaingTime);
  };

  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
