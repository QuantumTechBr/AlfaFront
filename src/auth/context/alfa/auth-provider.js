'use client';

import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { AuthContext } from './auth-context';
import { clearSession, isValidToken, setHeaderSession, setSession } from './utils';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }

  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      if (isValidToken()) {
        setHeaderSession();

        const response = await axios.get(endpoints.auth.me);

        const user = response.data;

        dispatch({
          type: 'INITIAL',
          payload: {
            user,
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    clearSession();
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  // LOGIN
  const login = useCallback(async (login, senha) => {
    const data = {
      login,
      senha,
    };

    const response = await axios.post(endpoints.auth.login, data).catch((erro) => {
      console.log('login erro');
      logout();
      throw erro;
    });
    const accessToken = response.data.token;
    const user = response.data.usuario;
    const expiresIn = response.data.expires_in;
    const expiresIn_milliseconds =
      (typeof expiresIn).toUpperCase() == 'STRING'
        ? Math.floor(parseFloat(expiresIn) * 1000)
        : expiresIn;
    const expirationDate = new Date(Date.now() + expiresIn_milliseconds);

    setSession(accessToken, expirationDate);

    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });
  }, [logout]);

  // FORGOT PASSWORD
  const forgotPassword = useCallback(async (email) => {
    const response = await axios.post(endpoints.auth.reset_password, { email }).catch((erro) => {
      console.log('forgot password erro');
      throw erro;
    });
    console.log(response);
  }, []);

  const confirmResetPassword = useCallback(async (senha, token) => {
    const response = await axios
      .post(endpoints.auth.reset_confirm, { senha, token })
      .catch((erro) => {
        console.log('confirm reset password erro');
        throw erro;
      });
    console.log(response);
    return response;
  }, []);

  // let location = useLocation();
  // useEffect(() => {
  //   if (!isValidToken()) logout();
  // }, [location]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const checkPermissaoModulo = useCallback((nomeModulo, permissao) => {
    if (!state.user || !state.user.permissao_usuario) {
      return null;
    }
    for (let index = 0; index < state.user.permissao_usuario.length; index++) {
      if (state.user.permissao_usuario[index].nome == 'SUPERADMIN') { return true }
      const modulosPermitidos = state.user.permissao_usuario[index].permissao_modulo;
      if (!modulosPermitidos) { return false; }
      const moduloPermissao = modulosPermitidos.find(moduloPermissao => 
        moduloPermissao.modulo.namespace == nomeModulo
      );
      if (!moduloPermissao) {
        return false;
      }
      return moduloPermissao[permissao];
    }
    return false;
  }, [state.user]);

  const checkFuncao = useCallback((funcao) => {
    if (!state.user || !state.user.permissao_usuario) { return null}
    const permissaoUsuario = state.user.permissao_usuario[0];
    return permissaoUsuario?.nome == funcao;
    /* SUPERADMIN, ASSESSOR DDZ, DIRETOR, PROFESSOR */
  }, [state.user]);

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'alfa',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      logout,
      forgotPassword,
      confirmResetPassword,
      checkPermissaoModulo,
      checkFuncao,
    }),
    [state.user, status, login, logout, forgotPassword, confirmResetPassword, checkPermissaoModulo, checkFuncao]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
