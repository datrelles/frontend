import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const USER_SHINERAY = 'USER_SHINERAY';
const BRANCH_SHINERAY = 'branchShinerayS';
const KEY_JWT = 'KEY_JWT';
const ENTERPRICE_SHINERAY = 'ENTERPRICE_SHINERAY';
const SYSTEM_SHINERAY = 'SYSTEM_SHINERAY';

export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {

    const [userShineray, setuserShineray] = useState(() =>
        window.localStorage.getItem(USER_SHINERAY)
    );
    const [enterpriceShineray, setenterpriceShineray] = useState(() =>
        window.localStorage.getItem(ENTERPRICE_SHINERAY)
    );

    const [branchShineray, setbranchShineray] = useState(() =>
        window.localStorage.getItem(BRANCH_SHINERAY)
    );

    const [systemShineray, setsystemShineray] = useState(() =>
        window.localStorage.getItem(SYSTEM_SHINERAY)
    );

    const [jwt, setJwt] = useState(() =>
        window.localStorage.getItem(KEY_JWT)
    );
    
    
    const login = useCallback((userShineray, enterpriceShineray, branchShineray) => {
        window.localStorage.setItem(USER_SHINERAY, userShineray);
        window.localStorage.setItem(ENTERPRICE_SHINERAY, enterpriceShineray);
        window.localStorage.setItem(BRANCH_SHINERAY, branchShineray);
        setuserShineray(userShineray);
        setenterpriceShineray(enterpriceShineray);
        setbranchShineray(branchShineray);
    }, []);
    
    const setAuthToken = useCallback((token) => {
        window.localStorage.setItem(KEY_JWT, token);
        setJwt(token)
    }, []);

    const setHandleEnterprice = useCallback((enterpriceShineray) => {
        window.localStorage.setItem(ENTERPRICE_SHINERAY, enterpriceShineray);
        setenterpriceShineray(enterpriceShineray)
    }, []);

    const setHandleBranch = useCallback((branchShineray) => {
        window.localStorage.setItem(BRANCH_SHINERAY, branchShineray);
        setbranchShineray(branchShineray)
    }, []);

    const setHandleSystemShineray = useCallback((systemShineray) => {
        window.localStorage.setItem(SYSTEM_SHINERAY, systemShineray);
        setsystemShineray(systemShineray)
    }, []);

    
    
    const logout = useCallback(() => {
        window.localStorage.removeItem(USER_SHINERAY);
        window.localStorage.removeItem(ENTERPRICE_SHINERAY);
        window.localStorage.removeItem(BRANCH_SHINERAY);
        window.localStorage.removeItem(KEY_JWT);
        window.localStorage.removeItem(SYSTEM_SHINERAY);
        setuserShineray('');
        setbranchShineray('');
        setsystemShineray('')
        setJwt('');
    }, []);


  
    const value = useMemo(
        () => ({
            login,
            logout,
            setAuthToken,
            setHandleEnterprice,
            setHandleBranch,
            setHandleSystemShineray,
            jwt,
            systemShineray,
            branchShineray,
            enterpriceShineray,
            userShineray
        }),
        [userShineray, login, logout, branchShineray, jwt, setAuthToken, enterpriceShineray, setHandleEnterprice,setHandleBranch, setHandleSystemShineray, systemShineray]
    );
    

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthContextProvider.propTypes = {
    children: PropTypes.object
  };

export function useAuthContext() {
    return useContext(AuthContext);
}
