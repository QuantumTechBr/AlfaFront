'use client';
import { useEffect } from 'react';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// auth
import { useAuthContext } from 'src/auth/hooks';

export default function OverviewAppView() {
  const { checkFuncao } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    console.log('redirecionando');
    if (checkFuncao('SUPERADMIN') || checkFuncao('ADMIN')) {
      router.push(`${paths.dashboard.root}/dash-rede`);
    } else if (checkFuncao('ASSESSOR DDZ')) {
      router.push(`${paths.dashboard.root}/dash-ddz`);
    } else if (checkFuncao('DIRETOR')) {
      router.push(`${paths.dashboard.root}/dash-escola`);
    } else if (checkFuncao('PROFESSOR')) {
      router.push(`${paths.dashboard.root}/dash-turma`);
    }
  }, [checkFuncao, router]);

  return;
}
