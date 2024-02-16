'use client';

import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import { useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useCountdownSeconds } from 'src/hooks/use-countdown';
// auth
import { useAuthContext } from 'src/auth/hooks';
// assets
import { SentIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function AlfaNewPasswordView() {
  const { confirmResetPassword } = useAuthContext();

  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get('email');

  const secret = searchParams.get('secret');

  const password = useBoolean();

  const [success, setSuccess] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');

  const NewPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .matches(/[a-z]/, 'Senha deve ter pelo menos 1 letra minúscula')
      .matches(/[A-Z]/, 'Senha deve ter pelo menos 1 letra maiúscula')
      .matches(/(?=.*\d)/, 'Senha deve ter pelo menos 1 número')
      .required('Digite a senha'),
    confirmPassword: Yup.string()
      .required('Confirme sua senha digitando novamente')
      .oneOf([Yup.ref('password')], 'Senha e confirmação devem ser iguais'),
  });

  const defaultValues = {
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(NewPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      const retorno = await confirmResetPassword?.(data.password, secret).catch(erro => {throw erro});
      console.info('confirm', retorno);
      if(retorno.status) {
        setSuccess(true)
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Não foi possível recuperar a senha. Tente novamente com o link enviado para seu email ou entre em contato com o suporte.');
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Por favor digite sua nova senha para o email:
      </Typography>
      {email}


      <RHFTextField
        name="password"
        label="Senha"
        type={password.value ? 'text' : 'password'}
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

      <RHFTextField
        name="confirmPassword"
        label="Confirmar Senha"
        type={password.value ? 'text' : 'password'}
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

      
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Atualizar Senha
      </LoadingButton>

      
    </Stack>
  );

  const renderHead = (
    <>
      <SentIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ mt: 5 }}>
        <Typography variant="h3">Recuperação de senha!</Typography>


      </Stack>
    </>
  );

  const msgNoSecret = (
    <>
      <Typography variant="body2" sx={{ my: 5 }}>
        Link incorreto. 
        <br/>
        Tente novamente o link enviado para o seu email.
        <br/>
        Se não funcionar, entre em contato com o suporte.
      </Typography>
    </>
  )

  const msgSuccess = (
    <>
      <Typography variant="body2" sx={{ my: 5 }}>
        Senha alterada com sucesso.
      </Typography>
    </>
  )

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}


      {(!!secret && !success) && (renderForm)}
      {success && msgSuccess}
      {!secret && (msgNoSecret)}

      <Link 
        component={RouterLink}
        href={paths.auth.alfa.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
          my: 2
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Voltar para o login
      </Link>
    </FormProvider>
  );
}
