'use client';

import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _turmas } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import TurmaNewEditForm from '../turma-new-edit-form';

// ----------------------------------------------------------------------

export default function TurmaEditView({ id }) {
  const settings = useSettingsContext();

  const currentTurma = _turmas.find((turma) => turma.id === id);

  const nomeBreadcrumbs = currentTurma?.ano_serie + '° ' + currentTurma?.nome;

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
