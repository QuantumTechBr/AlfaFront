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
import ProfissionalNewEditForm from '../profissional-new-edit-form';

import { ProfissionalContext } from 'src/sections/profissional/context/profissional-context';

// ----------------------------------------------------------------------

export default function ProfissionalEditView({ id }) {
  const settings = useSettingsContext();

  
  const { buscaProfissionalPorId } = useContext(ProfissionaisContext);

  const [currentProfissional, setCurrentProfissional] = useState({});

  useEffect(()  => {
    buscaProfissionalPorId({id}).then(profissional => setCurrentProfissional(profissional))
  }, []);

  const nomeBreadcrumbs = currentProfissional?.escola + '° ' + currentProfissional?.profissional;

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
          { name: nomeBreadcrumbs },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProfissionalNewEditForm currentProfissional={currentProfissional} />
    </Container>
  );
}

ProfissionalEditView.propTypes = {
  id: PropTypes.string,
};
