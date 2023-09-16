'use client';

import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _profissionais } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ProfissionalNewEditForm from '../profissional-new-edit-form';

// ----------------------------------------------------------------------

export default function ProfissinalEditView({ id }) {
  const settings = useSettingsContext();

  const currentProfissional = _profissionais.find((profissional) => profissional.id === id);

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
            name: 'Profissionais',
            href: paths.dashboard.profissional.root,
          },
          { name: currentProfissional?.nome },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProfissionalNewEditForm currentProfissional={currentProfissional} />
    </Container>
  );
}

ProfissinalEditView.propTypes = {
  id: PropTypes.string,
};
