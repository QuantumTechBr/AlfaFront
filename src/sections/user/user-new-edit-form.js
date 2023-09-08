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
import userMethods from './user-repository';
import { useEffect, useState } from 'react';
import funcaoMethods from '../funcao/funcao-repository';
import escolaMethods from '../escola/escola-repository';
import permissaoMethods from '../permissao/permissao-repository';


// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const [funcoes, setFuncoes] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [permissoes, setPermissoes] = useState([]);


  useEffect(() => {
    funcaoMethods.getAllFuncoes().then(funcoes => {
      // const funcoesList = funcoes.data.map(funcao => {
      //   return {'label': funcao.nome, 'value': funcao.id}
      // })
      setFuncoes(funcoes.data);
    }).catch((erro) => {
      console.log(erro);
      throw(erro);
    })

    escolaMethods.getAllEscolas().then(escolas => {
      // const escolasList = escolas.data.map(escola => {
      //   return {'label': escola.nome, 'value': escola.id}
      // })
      setEscolas(escolas.data);
    }).catch((erro) => {
      console.log(erro);
      throw(erro);
    })

    
    permissaoMethods.getAllPermissoes().then(permissoes => {
      // const permissoesList = permissoes.data.map(permissao => {
      //   return {'label': permissao.nome, 'value': permissao.id}
      // })
      setPermissoes(permissoes.data);
    }).catch((erro) => {
      console.log(erro);
      throw(erro);
    })
  }, []);

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
      novoUsuario.funcao_usuario = [{
        funcao_id: data.funcao,
        escola_id: data.escola
      }];
      const funcao = funcoes.find((funcaoEscolhida) =>  funcaoEscolhida.id == data.funcao)
      const permissao = permissoes.find((permissao) => permissao.nome == funcao.nome)
      novoUsuario.permissao_usuario_id = [permissao.id]
      if (currentUser) {
        await userMethods.updateUserById(currentUser.id, novoUsuario);
        
      } else {
        // novoUsuario.permissao_usuario_id = ['fc3d719c-7a2c-4d2a-a966-831dbb38922c'];
        // novoUsuario.permissao_usuario = [{
        //   id: '91bbd3c9-61fa-4987-b31e-2a41f623e002',
        //   created_at: '2023-08-23 15:06:10',
        //   updated_at: null,
        //   deleted_at: null,
        //   nome: 'SUPERADMIN',
        //   permissao_modulo: [],
        // }];
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

  useEffect(()  => {
    reset(defaultValues)
  }, [currentUser]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
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
                {funcoes.map((funcao) => (
                  <MenuItem key={funcao.id} value={funcao.id}>
                    {funcao.nome}
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

              <RHFSelect name="escola" label="Escola">
                {escolas.map((escola) => (
                  <MenuItem key={escola.id} value={escola.id}>
                    {escola.nome}
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
