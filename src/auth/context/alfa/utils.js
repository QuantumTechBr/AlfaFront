// routes
import { paths } from 'src/routes/paths';
// utils
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

function jwtDecode(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = () => {
  return localStorage.accessToken && new Date(localStorage.expirationDateToken) > new Date();
};

// ----------------------------------------------------------------------

export const setAlertTokenExpired = (expirationDate) => {
  // eslint-disable-next-line prefer-const
  let expiredTimer;

  const currentTime = Date.now();

  const timeLeft = expirationDate - currentTime;
  // Test token expires after 10s
  // timeLeft = currentTime + 10000 - currentTime; // ~10s

  clearTimeout(expiredTimer);

  expiredTimer = setTimeout(() => {
    alert('Token expired');
    clearSession();
    window.location.href = paths.auth.alfa.login;
  }, timeLeft);
};

// ----------------------------------------------------------------------

export const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('expirationDateToken');
  delete axios.defaults.headers.common.Authorization;
};

export const setSession = (accessToken, expirationDate) => {
  if (accessToken && expirationDate > new Date()) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('expirationDateToken', expirationDate);
    setHeaderSession();
    setAlertTokenExpired(expirationDate);
  } else {
    clearSession();
  }
};

export const setHeaderSession = () => {
  localStorage.setItem('accessToken', localStorage.accessToken);
  axios.defaults.headers.common.Authorization = `Token ${localStorage.accessToken}`;
};
