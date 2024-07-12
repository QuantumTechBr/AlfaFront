'use client'
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
import { useState, useEffect } from 'react';
import alunoMethods from '../aluno-repository';
import Alert from '@mui/material/Alert';

// ----------------------------------------------------------------------

export default function AlunoEditView({ id }) {
  const settings = useSettingsContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const [currentAluno, setCurrentAluno] = useState({});

  useEffect(()  => {
    alunoMethods.getAlunoById(id).then(aluno => {
      if (aluno.data.length === 0) {
        setWarningMsg('A API retornou uma lista vazia de estudantes')
      }
      setCurrentAluno(aluno.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de estudantes');
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
            name: 'Estudantes',
            href: paths.dashboard.aluno.root,
          },
          { name: currentAluno?.nome },
        ]}
        youtubeLink="https://www.youtube.com/embed/2tfCF7lzilw?si=WYiCrwjrMm_RbZbr"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}
      <AlunoNewEditForm currentAluno={currentAluno} />
    </Container>
  );
}

AlunoEditView.propTypes = {
  id: PropTypes.string,
};
