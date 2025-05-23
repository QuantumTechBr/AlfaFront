import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { usePathname, useRouter, useSearchParams } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';

import { clearSession, isValidToken, setHeaderSession } from '../context/alfa/utils';

// ----------------------------------------------------------------------

const loginPaths = {
  alfa: paths.auth.alfa.login,
};

// ----------------------------------------------------------------------

export default function AuthGuard({ children }) {
  const router = useRouter();

  const { authenticated, method, logout  } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const checkValidAuth = useCallback(() => {
    if (isValidToken() && authenticated) {
      setHeaderSession();
      setChecked(true);
    } else {
      logout();
      clearSession();

      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();
      const loginPath = loginPaths[method];
      const href = `${loginPath}?${searchParams}`;
      router.replace(href);
    }
  }, [logout, authenticated, method, router]);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const url = pathname + searchParams.toString();
    // console.log(`url is : ${url}`);
    if(authenticated) checkValidAuth();
  }, [ pathname, searchParams, authenticated, checkValidAuth]);

  useEffect(() => {
    checkValidAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkValidAuth]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node,
};
