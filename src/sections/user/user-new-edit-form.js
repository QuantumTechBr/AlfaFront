import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useContext, useEffect, useState } from 'react';
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
import { _roles, USER_STATUS_OPTIONS, _ddzs } from 'src/_mock';
import userMethods from './user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import permissaoMethods from '../permissao/permissao-repository';
import Alert from '@mui/material/Alert';

// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [permissoes, setPermissoes] = useState([]);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    buscaFuncoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });
    
    permissaoMethods.getAllPermissoes().then(permissoes => {
      setPermissoes(permissoes.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de permissões');
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
      status: (currentUser?.status ? "true" : "false") || '',
      zona: currentUser?.zona || '',
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
    getValues,
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
      if (data.funcao == '775bb893-032d-492a-b94b-4909e9c2aeab') {
        novoUsuario.funcao_usuario = [{
          funcao_id: data.funcao,
          zona_id: data.zona,
        }];
      } else {
        novoUsuario.funcao_usuario = [{
          funcao_id: data.funcao,
          escola_id: data.escola,
        }];
      }
      const funcao = funcoes.find((funcaoEscolhida) =>  funcaoEscolhida.id == data.funcao)
      const permissao = permissoes.find((permissao) => permissao.nome == funcao.nome)
      novoUsuario.permissao_usuario_id = [permissao.id]
      if (currentUser) {
        await userMethods.updateUserById(currentUser.id, novoUsuario).catch((error) => {
          throw error;
        });
        
      } else {
        await userMethods.insertUser(novoUsuario).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentUser ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      currentUser ? setErrorMsg('Tentativa de atualização do usuário falhou') : setErrorMsg('Tentativa de criação do usuário falhou');
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
  }, [currentUser]);

  const assessor = () => {
    if (getValues('funcao') == '775bb893-032d-492a-b94b-4909e9c2aeab') {
      return true;
    } else {
      return false;
    }
  }

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
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

              {!assessor() ? (<RHFSelect disabled={getValues('funcao') == '' ? true : false} name="escola" label="Escola">
                {escolas.map((escola) => (
                  <MenuItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </MenuItem>
                ))}
              </RHFSelect>)
              :
              (<RHFSelect disabled={getValues('funcao') == '' ? true : false} name="zona" label="DDZ">
                {zonas.map((zona) => (
                  <MenuItem key={zona.id} value={zona.id}>
                    <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
                  </MenuItem>
                ))}
              </RHFSelect>) }

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
