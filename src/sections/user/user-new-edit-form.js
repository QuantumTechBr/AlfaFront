import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Alert from '@mui/material/Alert';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import userMethods from './user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import { useBoolean } from 'src/hooks/use-boolean';
import LoadingBox from 'src/components/helpers/loading-box';

// ----------------------------------------------------------------------
const defaultFilters = {
  escolasAssessorGestao: [],
};
export default function UserNewEditForm({ currentUser, isNewUser = true }) {
  const router = useRouter();

  const [filters, setFilters] = useState(defaultFilters);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { permissoes, buscaPermissoes } = useContext(PermissoesContext);
  const [idsAssessorCoordenador, setIdsAssessorCoordenador] = useState([]);
  const [idAssessorGestao, setIdAssessorGestao] = useState('');
  const [idAdmin, setIdAdmin] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const contextReady = useBoolean(false);
  const isFirstLayoutData = useBoolean(true);

  const defaultValues = useMemo(
    () => ({
      nome: currentUser?.nome || '',
      emailFormUser: currentUser?.email || '',
      senhaFormUser: currentUser?.senha || '',
      funcao: currentUser?.funcao || '',
      zona: currentUser?.zona || '',
      escola: currentUser?.escola || '',
      status: (currentUser?.status ? 'true' : 'false') || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const { funcao } = values;

  const _funcaoSelected = funcoes.find((_funcao) => _funcao.id == funcao);
  const _isSingleEscola = _funcaoSelected
    ? ['DIRETOR'].includes(_funcaoSelected.nome)
    : true;

  const preparacaoInicial = useCallback(async () => {
    isFirstLayoutData.onTrue();
    console.log('!!! preparacaoInicial !!!');

    await Promise.all([
      buscaFuncoes().catch((error) => {
        console.error(error);
        setErrorMsg('Erro de comunicação com a API de funções');
      }),
      buscaEscolas().catch((error) => {
        console.error(error);
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
      buscaZonas().catch((error) => {
        console.error(error);
        setErrorMsg('Erro de comunicação com a API de zonas');
      }),
      buscaPermissoes().catch((error) => {
        console.error(error);
        setErrorMsg('Erro de comunicação com a API de permissoes');
      }),
    ]);

    contextReady.onTrue();
  }, [buscaFuncoes, buscaEscolas, buscaZonas, buscaPermissoes, contextReady]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    if (contextReady.value) {
      if (idsAssessorCoordenador.length == 0 && idAssessorGestao.length == 0) {
        setIdsAssessorCoordenador(
          funcoes
            .filter((_funcao) =>
              ['ASSESSOR DDZ', 'COORDENADOR DE GESTÃO'].includes(_funcao.nome.toUpperCase())
            )
            .map((_funcao) => _funcao.id)
        );

        setIdAssessorGestao(
          funcoes.find((_funcao) => _funcao.nome.toUpperCase() == 'ASSESSOR DE GESTÃO')?.id ?? ''
        );

        setIdAdmin(funcoes.find((_funcao) => _funcao.nome.toUpperCase() == 'ADMIN')?.id ?? '');
      }

      if (!!currentUser) {
        const __funcaoSelected = funcoes.find((_funcao) => _funcao.id == currentUser.funcao);
        const __isSingleEscola = __funcaoSelected
          ? ['DIRETOR'].includes(__funcaoSelected.nome)
          : true;

        if (currentUser?.escola && _.isArray(currentUser?.escola) && !__isSingleEscola) {
          setFilters(() => ({ escolasAssessorGestao: currentUser?.escola }));
        }

        const _no = {
          ...defaultValues,
          ...(__isSingleEscola && _.isArray(currentUser?.escola)
            ? { escola: _.first(currentUser.escola) }
            : {}),
        };
        reset(_no);
      } else if (isNewUser) {
        isFirstLayoutData.onFalse();
      }
    }
  }, [contextReady.value, currentUser]);
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    emailFormUser: Yup.string()
      .required('Email é obrigatório')
      .email('Email tem que ser um endereço de email válido'),
    senhaFormUser: Yup.string(),
    funcao_usuario: Yup.string(),
  });

  useEffect(() => {
    if (contextReady.value) {
      if (!isFirstLayoutData.value) {
        setValue('escola', '');
        setValue('zona', '');
        setFilters(defaultFilters);
      } else {
        isFirstLayoutData.onFalse();
      }
    }
  }, [funcao, setValue]);

  const handleFilters = useCallback(
    async (nome, value) => {
      const novosFiltros = {
        ...filters,
        [nome]: value,
      };
      setFilters(novosFiltros);
    },
    [filters]
  );

  const handleEscolasAssessorGestao = useCallback(
    (event) => {
      handleFilters(
        'escolasAssessorGestao',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const renderValueEscolasAssessorGestao = (selected) =>
    selected
      .map((escolaId) => {
        return escolas.find((option) => option.id == escolaId)?.nome;
      })
      .join(', ');

  const onSubmit = handleSubmit(async (data) => {
    try {
      var payloadUsuario = {};
      if (data.senhaFormUser) {
        payloadUsuario = {
          nome: data.nome,
          email: data.emailFormUser,
          senha: data.senhaFormUser,
          login: data.emailFormUser,
          status: data.status,
        };
      } else {
        payloadUsuario = {
          nome: data.nome,
          email: data.emailFormUser,
          login: data.emailFormUser,
          status: data.status,
        };
      }

      const _permissao = permissoes.find((permissao) => permissao.nome == _funcaoSelected.nome);

      if (idsAssessorCoordenador.includes(data.funcao)) {
        if (data.zona == '') {
          setErrorMsg('Voce deve selecionar uma zona');
          return;
        } else {
          payloadUsuario.funcao_usuario = [
            {
              funcao_id: data.funcao,
              zona_id: data.zona,
            },
          ];
        }
      } else if (data.funcao == idAssessorGestao) {
        if (filters.escolasAssessorGestao.length == 0) {
          setErrorMsg('Voce deve selecionar uma ou mais escolas');
        } else {
          payloadUsuario.funcao_usuario = [];
          filters.escolasAssessorGestao.map((escolaId) => {
            payloadUsuario.funcao_usuario.push({
              funcao_id: data.funcao,
              escola_id: escolaId,
            });
          });
        }
      } else {
        if (data.escola == '') {
          setErrorMsg('Voce deve selecionar uma escola');
          return;
        } else {
          payloadUsuario.funcao_usuario = [
            {
              funcao_id: data.funcao,
              escola_id:
                _isSingleEscola && _.isArray(data.escola) ? _.first(data.escola) : data.escola,
            },
          ];
        }
      }

      payloadUsuario.permissao_usuario_id = [_permissao.id];

      if (currentUser) {
        await userMethods.updateUserById(currentUser.id, payloadUsuario).catch((error) => {
          throw error;
        });
      } else {
        await userMethods.insertUser(payloadUsuario).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentUser ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      console.info('DATA', data);
      router.push(paths.dashboard.user.list);
    } catch (error) {
      const arrayMsg = Object.values(error).map((msg) => {
        return msg[0] ? msg[0].charAt(0).toUpperCase() + msg[0].slice(1) : '';
      });
      const mensagem = arrayMsg.join(' ');
      currentUser
        ? setErrorMsg(`Tentativa de atualização do usuário falhou - ${mensagem}`)
        : setErrorMsg(`Tentativa de criação do usuário falhou - ${mensagem}`);
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {!contextReady.value && <LoadingBox texto="Carregando dependências" />}
      {!!contextReady.value && (
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
                <RHFTextField
                  name="emailFormUser"
                  label="Email"
                  type="email"
                  inputProps={{ autoComplete: 'off' }}
                />

                <RHFSelect name="funcao" label="Função">
                  {funcoes.map((_funcao) => (
                    <MenuItem key={_funcao.id} value={_funcao.id}>
                      {_funcao.nome}
                    </MenuItem>
                  ))}
                </RHFSelect>

                {idsAssessorCoordenador.includes(funcao) && (
                  <RHFSelect disabled={funcao == '' ? true : false} name="zona" label="DDZ">
                    {zonas.map((_zona) => (
                      <MenuItem key={_zona.id} value={_zona.id}>
                        <Box sx={{ textTransform: 'capitalize' }}>{_zona.nome}</Box>
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}

                {funcao == idAssessorGestao && (
                  <FormControl
                    sx={{
                      flexShrink: 0,
                    }}
                  >
                    <InputLabel>Escolas</InputLabel>
                    <Select
                      multiple
                      name="escola"
                      disabled={funcao == '' ? true : false}
                      value={filters.escolasAssessorGestao}
                      onChange={handleEscolasAssessorGestao}
                      input={<OutlinedInput label="Escolas" />}
                      renderValue={renderValueEscolasAssessorGestao}
                      MenuProps={{
                        PaperProps: {
                          sx: { maxHeight: 240 },
                        },
                      }}
                    >
                      {escolas?.map((_escola) => (
                        <MenuItem key={_escola.id} value={_escola.id}>
                          <Checkbox
                            disableRipple
                            size="small"
                            checked={filters.escolasAssessorGestao.includes(_escola.id)}
                          />
                          {_escola.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {![...idsAssessorCoordenador, idAssessorGestao, idAdmin].includes(funcao) && (
                  <RHFSelect disabled={funcao == '' ? true : false} name="escola" label="Escola">
                    {escolas.map((_escola) => (
                      <MenuItem key={_escola.id} value={_escola.id}>
                        {_escola.nome}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}

                {funcao == idAdmin && <Box></Box>}

                <RHFTextField
                  name="senhaFormUser"
                  label={currentUser ? 'Nova senha' : 'Senha'}
                  type="password"
                  inputProps={{ autoComplete: 'off' }}
                />

                <RHFSelect name="status" label="Status">
                  {USER_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
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
      )}
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
  isNewUser: PropTypes.bool,
};
