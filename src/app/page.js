'use client';

// sections
import { HomeView } from 'src/sections/home/view';
import { useRouter } from 'src/routes/hook';
// ----------------------------------------------------------------------

export const metadata = {
  title: 'Minimal: The starting point for your next project',
};

export default function HomePage() {
  const router = useRouter();
  router.replace('/dashboard');
}
