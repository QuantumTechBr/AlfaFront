'use client';

import PropTypes from 'prop-types';
// auth
import { AuthGuard } from 'src/auth/guard';
// components
import DashboardLayout from 'src/layouts/dashboard';

import { TurmasProvider } from 'src/sections/turma/context/turma-context';
import { EscolasProvider } from 'src/sections/escola/context/escola-context';
// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <TurmasProvider>
        <EscolasProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </EscolasProvider>
      </TurmasProvider>
    </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
