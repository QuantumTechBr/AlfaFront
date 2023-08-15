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

export const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }

  //const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  //return decoded.exp > currentTime;
  return true;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp) => {
  // eslint-disable-next-line prefer-const
  let expiredTimer;

  const currentTime = Date.now();

  // Test token expires after 10s
  // const timeLeft = currentTime + 10000 - currentTime; // ~10s
  const timeLeft = exp * 1000 - currentTime;
  console.log(timeLeft)

  clearTimeout(expiredTimer);

  expiredTimer = setTimeout(() => {
    alert('Token expired');

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('expirationDate');

    window.location.href = paths.auth.alfa.login;
  }, timeLeft);
};

// ----------------------------------------------------------------------

export const setSession = (accessToken, expirationDate) => {
  if (accessToken) {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('expirationDate', expirationDate);
    
    axios.defaults.headers.common.Authorization = `Token ${accessToken}`;

    // This function below will handle when token is expired
    //const { exp } = jwtDecode(accessToken); // ~3 days by minimals server
    
    //tokenExpired(expirationDate);
  } else {
    sessionStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
  }
};
