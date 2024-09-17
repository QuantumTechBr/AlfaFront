'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useSearchParams, useRouter } from 'src/routes/hook';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { maxWidth } from '@mui/system';
import { da } from 'date-fns/locale';
import { templateSettings } from 'lodash';

// ----------------------------------------------------------------------

export default function AlfaLoginView() {
  const { login: loginContext } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const [login, setLogin] = useState('');

  const [bgSenhaColor, setBgSenhaColor] = useState('lightgrey');

  const [senhaDisabled, setSenhaDisabled] = useState(true);

  const [botaoDisabled, setBotaoDisabled] = useState(true);

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    senha: Yup.string().required('Esse campo não pode ser vazio'),
  });

  const defaultValues = {
    login: '',
    senha: '',
    tentativas: 0,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: {login: login, senha:defaultValues.senha, tentativas:defaultValues.tentativas},
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await loginContext?.(login, data.senha);
      if (login == ''){
        setErrorMsg(typeof error === 'string' ? error : 'O campo Login não pode ser vazio.');
      }
      console.log("sucesso login")
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.log(error);
      data.tentativas += 1;

      if (data.tentativas > 2){
        setErrorMsg(typeof error === 'string' ? error : 'Login ou Senha incorretos. "Clique em Esqueceu a senha?" para recuperar.');
      } else {
        setErrorMsg(typeof error === 'string' ? error : error.non_field_errors);  
      } 
    
    }
  });

  const onChangeLogin = (e) => {
    e.target.value? setSenhaDisabled(false) : setSenhaDisabled(true)
    e.target.value? setBgSenhaColor('white') : setBgSenhaColor('lightgrey')
    e.target.value? setBotaoDisabled(false) : setBotaoDisabled(true)
    setLogin(e.target.value)
  }

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
     {/* <Typography variant="h4">Sign in to Minimal</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New user?</Typography>

        <Link component={RouterLink} href={paths.auth.alfa.register} variant="subtitle2">
          Create an account
        </Link>
  </Stack>*/}
        <Box
          component="img"
          alt="auth"
          src="/assets/illustrations/escudo_prefeitura_manaus.png"
          sx={{ maxWidth: 720 }}
        />
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField 
        name="login" 
        label="Login" 
        value={login}
        onChange={onChangeLogin}
      />

      <RHFTextField
        name="senha"
        label="Senha"
        type={password.value ? 'text' : 'password'}
        disabled={senhaDisabled}
        sx={{ bgcolor: bgSenhaColor }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link component={RouterLink} href={paths.auth.alfa.forgotPassword} variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
        Esqueceu a senha?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        disabled={botaoDisabled}
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
