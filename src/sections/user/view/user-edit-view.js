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
  const [currentUser, setCurrentUser] = useState();
  useEffect(() => {
    userMethods
      .getUserById(id)
      .then((usuario) => {
        const usuarioData = usuario.data;
        if (usuarioData.funcao_usuario.length > 0) {
          const _funcao = [];
          const _escola = [];
          const _zona = [];
          for (let index = 0; index < usuarioData.funcao_usuario.length; index++) {
            _funcao.push(usuarioData.funcao_usuario[index].funcao?.id);
            _escola.push(usuarioData.funcao_usuario[index].escola?.id);
            _zona.push(usuarioData.funcao_usuario[index].zona?.id);
          }
          usuarioData.funcao = _funcao[0] ? _funcao[0] : '';
          usuarioData.escola = _escola ? _escola : '';
          usuarioData.zona = _zona[0] ? _zona[0] : '';
        } else {
          usuarioData.funcao = '';
          usuarioData.escola = '';
          usuarioData.zona = '';
        }
        if (usuarioData.length === 0) {
          setWarningMsg('A API retornou uma lista vazia de usuário');
        }
        setCurrentUser(usuarioData);
      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de usuários');
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
      <UserNewEditForm currentUser={currentUser} isNewUser={false} />
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
