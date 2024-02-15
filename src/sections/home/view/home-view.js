'use client';

import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function HomeView() {
  const router = useRouter();
  router.replace('/dashboard');

  return <></>;
}
