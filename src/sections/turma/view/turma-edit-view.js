'use client';
import { useEffect, useState, useContext } from 'react';

import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import TurmaNewEditForm from '../turma-new-edit-form';

import { TurmasContext } from 'src/sections/turma/context/turma-context';

// ----------------------------------------------------------------------

export default function TurmaEditView({ id }) {
  const settings = useSettingsContext();

  
  const { buscaTurmaPorId } = useContext(TurmasContext);

  const [currentTurma, setCurrentTurma] = useState({});

  useEffect(()  => {
    buscaTurmaPorId({id}).then(turma => setCurrentTurma(turma))
  }, []);

  const nomeBreadcrumbs = currentTurma?.ano_escolar + '° ' + currentTurma?.nome;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Turmas',
            href: paths.dashboard.turma.root,
          },
          { name: nomeBreadcrumbs },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TurmaNewEditForm currentTurma={currentTurma} />
    </Container>
  );
}

TurmaEditView.propTypes = {
  id: PropTypes.string,
};
