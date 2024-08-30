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
import Label from 'src/components/label';
import parse from 'date-fns/parse';
// ----------------------------------------------------------------------

export default function PlanoIntervencaoEditView({ id }) {
  const settings = useSettingsContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [currentPlano, setCurrentPlano] = useState({});
  const [status, setStatus] = useState('')
  const [date_inicio, setDateInicio] = useState('');
  const [date_termino, setDateTermino] = useState('');

  const hoje = new Date()

  useEffect(()  => {
    planoIntervencaoMethods.getPlanoIntervencaoById(id).then(plano => {
      if (plano.data.length === 0) {
        setWarningMsg('A API retornou uma lista vazia de plano');
      }
      setDateInicio(parse(plano.data.inicio_previsto, 'yyyy-MM-dd', new Date()))
      setDateTermino(parse(plano.data.termino_previsto, 'yyyy-MM-dd', new Date()))
      setStatus(plano.data.status)
      setCurrentPlano(plano.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de planos de intervenção');
    })
  }, [id]);
  
  const retornoStatus = () => {
    if (status == 'Concluído') {
      return status
    }
    if (hoje > date_inicio && hoje < date_termino) {
      return 'Em Andamento Dentro do Prazo';
    } else if (hoje < date_inicio) {
      return 'Criado';
    } else {
      return 'Em Andamento Fora do Prazo';

    }
  }

  const statusConcluido = () => {
    setStatus('Concluído')
  }

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
            name: 'Plano de Intervenção',
            href: paths.dashboard.plano_intervencao.list,
          },
          { name: currentPlano?.responsavel?.nome },
        ]}
        youtubeLink="https://www.youtube.com/embed/iUP0CRlH7Gs?si=S_TqzfCnhYEtq45F"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Label
        variant="filled"
        color={
          (retornoStatus() === 'Concluído' && 'success') ||
          (retornoStatus() === 'Em Andamento Dentro do Prazo' && 'warning') ||
          (retornoStatus() === 'Em Andamento Fora do Prazo' && 'error') ||
          'default'
        }
        sx={{
          mb: 3,
          fontSize: 18,
          height: 36,
        }}
      >
        {retornoStatus()}
      </Label>

      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}
      <PlanoIntervencaoNewEditForm currentPlano={currentPlano} statusConcluido={() => statusConcluido()}/>
    </Container>
  );
}

PlanoIntervencaoEditView.propTypes = {
  id: PropTypes.string,
};
