'use client';

import PropTypes from 'prop-types';
// auth
import { AuthGuard } from 'src/auth/guard';
// components
import DashboardLayout from 'src/layouts/dashboard';

import { AnosLetivosProvider } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasProvider } from 'src/sections/escola/context/escola-context';
import { TurmasProvider } from 'src/sections/turma/context/turma-context';
// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <AnosLetivosProvider>
        <EscolasProvider>
          <TurmasProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </TurmasProvider>
        </EscolasProvider>
      </AnosLetivosProvider>
    </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
