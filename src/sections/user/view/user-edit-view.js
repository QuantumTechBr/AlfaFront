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
import UserNewEditForm from '../user-new-edit-form';
import userMethods from '../user-repository';
import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
// ----------------------------------------------------------------------

export default function UserEditView({ id }) {
  const settings = useSettingsContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [currentUser, setCurrentUser] = useState({});
  useEffect(()  => {
    userMethods.getUserById(id).then(usuario => {
      usuario.data.funcao = usuario.data.funcao_usuario.length > 0 ? usuario.data.funcao_usuario[0].funcao?.id : '';
      usuario.data.escola = usuario.data.funcao_usuario.length > 0 ? usuario.data.funcao_usuario[0].escola?.id : '';
      usuario.data.zona = usuario.data.funcao_usuario.length > 0 ? usuario.data.funcao_usuario[0].zona?.id : '';
      if (usuario.data.length === 0) {
        setWarningMsg('A API retornou uma lista vazia de usuário');
      }
      setCurrentUser(usuario.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de usuários');
    })
  }, []);

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
            name: 'Usuário',
            href: paths.dashboard.user.list,
          },
          { name: currentUser?.nome },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}
      <UserNewEditForm currentUser={currentUser} />
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
