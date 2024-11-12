'use client';

import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _userList } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import PlanoIntervencaoNewEditForm from '../plano-intervencao-new-edit-form';
import planoIntervencaoMethods from '../plano-intervencao-repository';
import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
// ----------------------------------------------------------------------

export default function PlanoIntervencaoCreateFromView({ id }) {
  const settings = useSettingsContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [currentPlano, setCurrentPlano] = useState({});
  useEffect(()  => {
    planoIntervencaoMethods.getPlanoIntervencaoById(id).then(plano => {
      if (plano.data.length === 0) {
        setWarningMsg('A API retornou uma lista vazia de plano');
      }
      setCurrentPlano(plano.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de planos de intervenção');
    })
  }, [id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar a Partir de..."
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Plano de Intervenção',
            href: paths.dashboard.plano_intervencao.list,
          },
          { name: 'Criar' },
        ]}
        youtubeLink="https://www.youtube.com/embed/bf9xNpG2NZ4?si=P0prPKwf74aOXPf8&cc_load_policy=1"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}
      <PlanoIntervencaoNewEditForm currentPlano={currentPlano} newFrom={true}/>
    </Container>
  );
}

PlanoIntervencaoCreateFromView.propTypes = {
  id: PropTypes.string,
};
