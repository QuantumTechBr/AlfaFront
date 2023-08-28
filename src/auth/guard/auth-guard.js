import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

const loginPaths = {
  alfa: paths.auth.alfa.login,
  jwt: paths.auth.jwt.login,
  auth0: paths.auth.auth0.login,
  amplify: paths.auth.amplify.login,
  firebase: paths.auth.firebase.login,
};

// ----------------------------------------------------------------------

export default function AuthGuard({ children }) {
  console.log("auth guard");
  const router = useRouter();


  const { authenticated, method } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {

    console.log("check");
    console.log(authenticated);
    if (!authenticated) {
      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();

      const loginPath = loginPaths[method];

      const href = `${loginPath}?${searchParams}`;
      console.log("!authenticated");
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('expirationDate');

      router.replace(href);
    } else {
      setChecked(true);
    }
  }, [authenticated, method, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node,
};
