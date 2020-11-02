import React from "react";

type AuthProps = {
  isAuthenticated: boolean;
  authenticate: Function;
  signout: Function;
};

export const AuthContext = React.createContext({} as AuthProps);

const isValidToken = () => {
  const token = localStorage.getItem("pickbazar_token");
  // JWT decode & check token validity & expiration.
  if (token) return true;
  return false;
};

const AuthProvider = (props: any) => {
  const [isAuthenticated, makeAuthenticated] = React.useState(isValidToken());
  function authenticate({ username, password, authToken }, cb) {
    makeAuthenticated(true);
    // localStorage.setItem("pickbazar_token", `${username}.${password}`);
    localStorage.setItem("pickbazar_token", "2");
    setTimeout(cb, 100); // fake async
  }
  function signout(cb) {
    makeAuthenticated(false);
    localStorage.removeItem("pickbazar_token");
    localStorage.removeItem("myAuthToken");
    setTimeout(cb, 100);
  }
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        signout,
      }}
    >
      <>{props.children}</>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
