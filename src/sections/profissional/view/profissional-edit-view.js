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
import ProfissionalNewEditForm from '../profissional-new-edit-form';
import userMethods from 'src/sections/user/user-repository';
import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';

// ----------------------------------------------------------------------

export default function ProfissionalEditView({ id }) {
  const settings = useSettingsContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUser, setCurrentUser] = useState({});
  useEffect(()  => {
    userMethods.getUserById(id).then(usuario => {
      usuario.data.funcao = usuario.data.funcao_usuario.length > 0 ? usuario.data.funcao_usuario[0].funcao?.id : '';
      usuario.data.escola = usuario.data.funcao_usuario.length > 0 ? usuario.data.funcao_usuario[0].escola?.id : '';
      usuario.data.zona = usuario.data.funcao_usuario.length > 0 ? usuario.data.funcao_usuario[0].zona?.id : '';
      if (usuario.data.length === 0) {
        setErrorMsg('A API retornou uma lista vazia de usuários');
      }
      setCurrentUser(usuario.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de usuários');
    })
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
            name: 'Profissionais',
            href: paths.dashboard.profissional.list,
          },
          { name: currentUser?.nome },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <ProfissionalNewEditForm currentUser={currentUser} />
    </Container>
  );
}

ProfissionalEditView.propTypes = {
  id: PropTypes.string,
};
