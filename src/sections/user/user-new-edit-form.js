import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
import { countries } from 'src/assets/data';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { _roles, USER_STATUS_OPTIONS, _ddzs, _escolas } from 'src/_mock';
import userMethods from './user-provider';
import { useEffect, useState } from 'react';


// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });
  
  const defaultValues = useMemo(
    () => ({
      nome: currentUser?.nome || '',
      email: currentUser?.email || '',
      senha: currentUser?.senha || '',
      funcao: currentUser?.funcao || '',
      funcao_usuario: currentUser?.funcao_usuario || '',
      status: (currentUser?.status ? "true" : "false") || '',
      escola: currentUser?.escola || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    //resolver: yupResolver(NewUserSchema),
    defaultValues,
  });


  const {
    register,
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novoUsuario = {}
      if (data.senha) {
        novoUsuario = {
          nome:  data.nome,
          email: data.email,
          senha: data.senha, 
          login: data.email,
          status: data.status,
        }
      } else {
        novoUsuario = {
          nome:  data.nome,
          email: data.email,
          login: data.email,
          status: data.status,
        }
      }
      if (currentUser) {
        await userMethods.updateUserById(currentUser.id, novoUsuario);
        
      } else {
        novoUsuario.permissao_usuario = [{
          id: '91bbd3c9-61fa-4987-b31e-2a41f623e002',
          created_at: '2023-08-23 15:06:10',
          updated_at: null,
          deleted_at: null,
          nome: 'SUPERADMIN',
          permissao_modulo: [],
        }];
        await userMethods.insertUser(novoUsuario);
      }
      reset();
      enqueueSnackbar(currentUser ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

 /* const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatarUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );*/

  useEffect(()  => {
    reset(defaultValues)
  }, [currentUser]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/*<Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label
                color={
                  (values.status === 'ativo' && 'success') ||
                  (values.status === 'inativo' && 'error') ||
                  'warning'
                }
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
              )}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
              </Box>

            {currentUser && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'ativo'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'inativo' : 'ativo')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Inativo
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Apply disable account
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}

            <RHFSwitch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Email Verified
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Disabling this will automatically send the user a verification email
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {currentUser && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button variant="soft" color="error">
                  Delete User
                </Button>
              </Stack>
            )}
          </Card>
            </Grid>*/}
        
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="nome" label="Nome Completo" />
              <RHFTextField name="email" label="Email" />
              <RHFTextField name="senha" label="Nova Senha" type="password" />

              <RHFSelect name="funcao" label="Função">
                {_roles.map((funcao) => (
                  <MenuItem key={funcao} value={funcao}>
                    {funcao}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="status" label="Status">
                {USER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              {/*<RHFSelect name="ddz" label="DDZ">
                {_ddzs.map((ddz) => (
                  <MenuItem key={ddz} value={ddz}>
                    {ddz}
                  </MenuItem>
                ))}
              </RHFSelect>*/}

              <RHFSelect name="escola" label="Escola">
                {_escolas.map((escola) => (
                  <MenuItem key={escola} value={escola}>
                    {escola}
                  </MenuItem>
                ))}
              </RHFSelect>

            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Criar Usuário' : 'Atualizar Usuário'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
