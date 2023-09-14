'use client';

import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _alunos } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import AlunoNewEditForm from '../aluno-new-edit-form';

// ----------------------------------------------------------------------

export default function AlunoEditView({ id }) {
  const settings = useSettingsContext();

  const currentAluno = _alunos.find((aluno) => aluno.id === id);

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
            name: 'Alunos',
            href: paths.dashboard.aluno.root,
          },
          { name: currentAluno?.nome },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AlunoNewEditForm currentAluno={currentAluno} />
    </Container>
  );
}

AlunoEditView.propTypes = {
  id: PropTypes.string,
};
