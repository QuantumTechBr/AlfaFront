
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
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { _roles, USER_STATUS_OPTIONS, _ddzs } from 'src/_mock';
import userMethods from '../user/user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import permissaoMethods from '../permissao/permissao-repository';
import Alert from '@mui/material/Alert';
import { AuthContext } from 'src/auth/context/alfa';

// ----------------------------------------------------------------------

export default function ProfissionalNewEditForm({ currentUser }) {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [permissoes, setPermissoes] = useState([]);
  const [funcaoProfessor, setFuncaoProfessor] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [velhasFuncoes, setVelhasFuncoes] = useState([]);

  useEffect(() => {
    buscaFuncoes().then(_funcoes => {
      setFuncaoProfessor(_funcoes.find(funcao => funcao.nome == "PROFESSOR"))
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });

    permissaoMethods.getAllPermissoes().then(_permissoes => {
      setPermissoes(_permissoes.data);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de permissões');
    })
  }, []);

  useEffect(() => {
    let velhasFunc = [];
    funcoes.map((funcao) => {
      if (funcao.nome == "ASSESSOR DDZ" || funcao.nome == "DIRETOR" || funcao.nome == "PROFESSOR") {
        velhasFunc.push(funcao)
      }
    });
    setVelhasFuncoes(velhasFunc);
  }, [funcoes]);

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
    defaultValues,
  });


  const {
    register,
    reset,
    watch,
    control,
    setValue,
    getValues,
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
      if (data.funcao == '775bb893-032d-492a-b94b-4909e9c2aeab') {
        if (data.zona == '') {
          setErrorMsg('Voce deve selecionar uma zona');
          return
        } else {
          novoUsuario.funcao_usuario = [{
            funcao_id: data.funcao,
            zona_id: data.zona,
          }];
        }
      } else {
        if (data.escola == '') {
          setErrorMsg('Voce deve selecionar uma escola');
          return
        } else {
          novoUsuario.funcao_usuario = [{
            funcao_id: data.funcao,
            escola_id: data.escola,
          }];
        }
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
      router.push(paths.dashboard.profissional.list);
      console.info('DATA', data);
    } catch (error) { 
      let arrayMsg = Object.values(error).map((msg) => {
        return (msg[0] ? msg[0].charAt(0).toUpperCase() : '') + (msg[0]?.slice(1) || '');
      });
      let mensagem = arrayMsg.join(' ');
      currentUser ? setErrorMsg(`Tentativa de atualização do usuário falhou - `+`${mensagem}`) : setErrorMsg(`Tentativa de criação do usuário falhou - `+`${mensagem}`);
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

  const desabilitaMudarFuncao = () => {
    if (user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR") {
      return currentUser ? true : false
    }
    return false
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

              <RHFSelect name="funcao" label="Função" disabled={desabilitaMudarFuncao()}>
                {(user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR") ? 
                (<MenuItem key={funcaoProfessor?.id} value={funcaoProfessor?.id}>
                  {funcaoProfessor?.nome}
                </MenuItem>)
                : (velhasFuncoes.map((funcao) => (
                  <MenuItem key={funcao.id} value={funcao.id}>
                    {funcao.nome}
                  </MenuItem>
                )))
                }
              </RHFSelect>

              <RHFSelect name="status" label="Status">
                {USER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect sx={{
                display: !assessor() ? "none" : "inherit"
              }} id={`zona_`+`${currentUser?.id}`} disabled={getValues('funcao') == '' ? true : false} name="zona" label="DDZ">
                {zonas.map((zona) => (
                  <MenuItem key={zona.id} value={zona.id}>
                    <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect sx={{
                display: assessor() ? "none" : "inherit"
              }} id={`escola_`+`${currentUser?.id}`} disabled={getValues('funcao') == '' ? true : false} name="escola" label="Escola">
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

ProfissionalNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
