import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const USER_SHINERAY = 'USER_SHINERAY';
const BRANCH_SHINERAY = 'branchShinerayS';
const KEY_JWT = 'KEY_JWT';
const enterprise_SHINERAY = 'enterprise_SHINERAY';
const SYSTEM_SHINERAY = 'SYSTEM_SHINERAY';
const SECONDAUTH = 'SECONDAUTH';
const FLAG = 'FLAG';
const TEMPORAL_FLAG = 'TEMPORAL_FLAG';
const KEY_JWT_NET = 'KEY_JWT_NET';


export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {

    const [userShineray, setuserShineray] = useState(() =>
        window.localStorage.getItem(USER_SHINERAY)
    );
    const [enterpriseShineray, setenterpriseShineray] = useState(() =>
        window.localStorage.getItem(enterprise_SHINERAY)
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

    const [secondAuth, setSecondAuth] = useState(() =>
        window.localStorage.getItem(SECONDAUTH)
    );

    const [flag, setFlag] = useState(() =>
        window.localStorage.getItem(FLAG)
    );
    const [temporalFlag, setTemporalFlag] = useState(() =>
        window.sessionStorage.getItem(TEMPORAL_FLAG)
    );

    const [keyJwtNet, setKeyJwtNet] = useState(() =>
        window.sessionStorage.getItem(KEY_JWT_NET)
    );


    const login = useCallback((userShineray, enterpriseShineray, branchShineray) => {
        window.localStorage.setItem(USER_SHINERAY, userShineray);
        window.localStorage.setItem(enterprise_SHINERAY, enterpriseShineray);
        window.localStorage.setItem(BRANCH_SHINERAY, branchShineray);
        setuserShineray(userShineray);
        setenterpriseShineray(enterpriseShineray);
        setbranchShineray(branchShineray);
        window.localStorage.removeItem(SECONDAUTH);
        setSecondAuth('')
    }, []);

    const setAuthToken = useCallback((token) => {
        window.localStorage.setItem(KEY_JWT, token);
        setJwt(token)
    }, []);

    const setHandleenterprise = useCallback((enterpriseShineray) => {
        window.localStorage.setItem(enterprise_SHINERAY, enterpriseShineray);
        setenterpriseShineray(enterpriseShineray)
    }, []);

    const setHandleBranch = useCallback((branchShineray) => {
        window.localStorage.setItem(BRANCH_SHINERAY, branchShineray);
        setbranchShineray(branchShineray)
    }, []);

    const setHandleSystemShineray = useCallback((systemShineray) => {
        window.localStorage.setItem(SYSTEM_SHINERAY, systemShineray);
        setsystemShineray(systemShineray)
    }, []);


    const setSecondAuthInit = useCallback((secondAuth) => {
        window.localStorage.setItem(SECONDAUTH, secondAuth);
        setSecondAuth(secondAuth)
    }, []);

    const setSecondAuthFinish = useCallback(() => {
        window.localStorage.removeItem(SECONDAUTH);
        setSecondAuth('')
    }, []);

    const setHandleFlag = useCallback((flag) => {
        window.localStorage.setItem(FLAG, flag);
        setFlag(flag)
    }, []);

    const setHandleFlagTemporal = useCallback((temporalFlag) => {
        window.sessionStorage.setItem(TEMPORAL_FLAG, temporalFlag);
        setTemporalFlag(temporalFlag)
    }, []);

    const logout = useCallback(() => {
        window.localStorage.removeItem(USER_SHINERAY);
        window.localStorage.removeItem(enterprise_SHINERAY);
        window.localStorage.removeItem(BRANCH_SHINERAY);
        window.localStorage.removeItem(KEY_JWT);
        window.localStorage.removeItem(SYSTEM_SHINERAY);
        window.localStorage.removeItem(FLAG);
        window.localStorage.removeItem(KEY_JWT_NET);
        window.sessionStorage.removeItem(TEMPORAL_FLAG);
        setuserShineray('');
        setbranchShineray('');
        setsystemShineray('');
        setJwt(null);
        setFlag(null);
        setTemporalFlag(null)

    }, []);



    const value = useMemo(
        () => ({
            login,
            logout,
            setAuthToken,
            setHandleenterprise,
            setHandleBranch,
            setHandleSystemShineray,
            jwt,
            systemShineray,
            branchShineray,
            enterpriseShineray,
            userShineray,
            secondAuth,
            setSecondAuthInit,
            setSecondAuthFinish,
            setHandleFlag,
            flag,
            setHandleFlagTemporal,
            temporalFlag,
            keyJwtNet
        }),
        [
            userShineray,
            login,
            logout,
            branchShineray,
            jwt,
            setAuthToken,
            enterpriseShineray,
            setHandleenterprise,
            setHandleBranch,
            setHandleSystemShineray,
            systemShineray,
            secondAuth,
            setSecondAuthInit,
            setSecondAuthFinish,
            setHandleFlag,
            flag,
            setHandleFlagTemporal,
            temporalFlag,
            keyJwtNet
        ]
    );


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthContextProvider.propTypes = {
    children: PropTypes.object
};

export function useAuthContext() {
    return useContext(AuthContext);
}
