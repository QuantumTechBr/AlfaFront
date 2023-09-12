'use client';

import PropTypes from 'prop-types';
// auth
import { AuthGuard } from 'src/auth/guard';
// components
import DashboardLayout from 'src/layouts/dashboard';

import { AnosLetivosProvider } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasProvider } from 'src/sections/escola/context/escola-context';
import { FuncoesProvider } from 'src/sections/funcao/context/funcao-context';
import { TurmasProvider } from 'src/sections/turma/context/turma-context';
// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <AnosLetivosProvider>
        <EscolasProvider>
          <FuncoesProvider>
            <TurmasProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </TurmasProvider>
          </FuncoesProvider>
        </EscolasProvider>
      </AnosLetivosProvider>
    </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
