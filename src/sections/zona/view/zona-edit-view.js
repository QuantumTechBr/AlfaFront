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
import ZonaNewEditForm from '../zona-new-edit-form';

import Alert from '@mui/material/Alert';
import zonaMethods from '../zona-repository';

// ----------------------------------------------------------------------

export default function ZonaEditView({ id }) {
  const settings = useSettingsContext();

  const [errorMsg, setErrorMsg] = useState('');
  
  const [currentZona, setCurrentZona] = useState({});

  useEffect(()  => {
    zonaMethods.getZonaById(id).then(zona => {
      setCurrentZona(zona.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    })
  }, [id]);

  const nomeBreadcrumbs = currentZona?.nome;

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
            name: 'Zonas',
            href: paths.dashboard.zona.root,
          },
          { name: nomeBreadcrumbs },
        ]}
        youtubeLink="https://www.youtube.com/embed/h7_iVqBN6dM?si=NgoMolmmWPmBlyOW&cc_load_policy=1"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}  
      <ZonaNewEditForm currentZona={currentZona} />
    </Container>
  );
}

ZonaEditView.propTypes = {
  id: PropTypes.string,
};
