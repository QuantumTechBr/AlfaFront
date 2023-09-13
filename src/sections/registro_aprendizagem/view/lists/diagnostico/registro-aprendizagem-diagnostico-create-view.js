'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import { TurmasContext } from '../../../../turma/context/turma-context'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import RegistroAprendizagemDiagnosticoNewEditForm from '../../form/diagnostico/registro-aprendizagem-diagnostico-new-edit-form';
import { useState, useContext, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoCreateView( turma ) {
  const settings = useSettingsContext();

  const {turmas, buscaTurmas, buscaTurmaPorId} = useContext(TurmasContext);
  const [_turma, setTurma] = useState(turma);

  const periodo = 'Inicial';

  useEffect(() => {
    buscaTurmas();
    buscaTurmaPorId({ id: "e019006c-f490-4c6e-a89c-829fe6c74c64" }).then(turma => {
      setTurma(turma);
    });
  }, []);

  const handleTurma = useCallback((event) => {
    setTurma(event.target.value);
  }, [_turma])

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar nova Avaliação de Diagnóstico"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Avaliações de Diagnóstico',
            href: paths.dashboard.registro_aprendizagem.root_diagnostico,
          },
          { name: 'Avaliação de Diagnóstico - ' + `${periodo}` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <RegistroAprendizagemDiagnosticoNewEditForm turma={_turma} periodo={periodo} handleTurma={handleTurma} />
    </Container>
  );
}
