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
import EscolaNewEditForm from '../escola-new-edit-form';

import { ZonasContext } from 'src/sections/zona/context/zona-context';
import Alert from '@mui/material/Alert';
import escolaMethods from '../escola-repository';

// ----------------------------------------------------------------------

export default function EscolaEditView({ id }) {
  const settings = useSettingsContext();

  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  

  const [currentEscola, setCurrentEscola] = useState({});

  useEffect(()  => {
    escolaMethods.getEscolaById(id).then(escola => {
      setCurrentEscola(escola.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
  }, [id]);

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
            name: 'Escolas',
            href: paths.dashboard.escola.root,
          },
          { name: currentEscola?.nome },
        ]}
        youtubeLink="https://www.youtube.com/embed/PRtd9syb-8k?si=IB5qYTX-wHmM2ZQ5"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}  
      {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}
      <EscolaNewEditForm currentEscola={currentEscola} />
    </Container>
  );
}

EscolaEditView.propTypes = {
  id: PropTypes.string,
};
