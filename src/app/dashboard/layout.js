'use client';

import PropTypes from 'prop-types';
// auth
import { AuthGuard } from 'src/auth/guard';
// components
import DashboardLayout from 'src/layouts/dashboard';

import { ZonasProvider } from 'src/sections/zona/context/zona-context';
import { AnosLetivosProvider } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasProvider } from 'src/sections/escola/context/escola-context';
import { FuncoesProvider } from 'src/sections/funcao/context/funcao-context';
import { TurmasProvider } from 'src/sections/turma/context/turma-context';
import { BimestresProvider } from 'src/sections/bimestre/context/bimestre-context';
// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <ZonasProvider>
        <AnosLetivosProvider>
          <EscolasProvider>
            <FuncoesProvider>
              <TurmasProvider>
                <BimestresProvider>
                  <DashboardLayout>{children}</DashboardLayout>
                </BimestresProvider>
              </TurmasProvider>
            </FuncoesProvider>
          </EscolasProvider>
        </AnosLetivosProvider>
      </ZonasProvider>
    </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
