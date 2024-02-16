'use client';

import { useEffect } from 'react';
import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function HomeView() {
  const router = useRouter();

  useEffect(() => {
    console.log('redirect to dashboard');
    setTimeout(() => {
      router.replace('/dashboard');
    }, 150);
  }, []);

  return <></>;
}
