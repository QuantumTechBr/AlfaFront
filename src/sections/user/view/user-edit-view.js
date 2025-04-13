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
      if (usuario.data.funcao_usuario.length > 0) {
        const funcao = [];
        const escola = [];
        const zona = [];
        for (let index = 0; index < usuario.data.funcao_usuario.length; index++) {  
          funcao.push(usuario.data.funcao_usuario[index]?.nome_exibicao);
          escola.push(usuario.data.funcao_usuario[index].escola?.id);
          zona.push(usuario.data.funcao_usuario[index].zona?.id);
          usuario.data.funcao_usuario[index]['nome_exibicao'] = usuario.data.funcao_usuario[index]?.nome_exibicao ?? usuario.data.funcao_usuario[index].funcao?.nome;
          usuario.data.funcao_usuario[index]['escola_id'] = usuario.data.funcao_usuario[index].escola?.id ?? null;
          usuario.data.funcao_usuario[index]['zona_id'] = usuario.data.funcao_usuario[index].zona?.id ?? null;
          usuario.data.funcao_usuario[index]['funcao_id'] = usuario.data.funcao_usuario[index].funcao?.id ?? null;
        }
        usuario.data.funcao = funcao[0] ? funcao[0] : '';
        usuario.data.escola = escola ? escola : '';
        usuario.data.zona = zona[0] ? zona[0] : '';
      } else {
        usuario.data.funcao = '';
        usuario.data.escola = '';
        usuario.data.zona = '';
      }
      if (usuario.data.length === 0) {
        setWarningMsg('A API retornou uma lista vazia de usuário');
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
            name: 'Usuário',
            href: paths.dashboard.user.list,
          },
          { name: currentUser?.nome },
        ]}
        youtubeLink="https://www.youtube.com/embed/CCRIjmY_6Xs?si=SH1R_J1YtN-gffFz&cc_load_policy=1"
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
