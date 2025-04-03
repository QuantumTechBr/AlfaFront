import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState, useContext } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import userMethods from './user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import { useBoolean } from 'src/hooks/use-boolean';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import LoadingBox from 'src/components/helpers/loading-box';
import { useAuthContext } from 'src/auth/hooks';
import _ from 'lodash';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ row, open, onClose, onSave }) {
  const defaultFilters = {
    escolasAG: [],
  };

  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const [currentUser, setCurrentUser] = useState();
  const [filters, setFilters] = useState(defaultFilters);
  const contextReady = useBoolean(false);
  const liberaSalvar = useBoolean(true);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { permissoes, buscaPermissoes } = useContext(PermissoesContext);
  const [idsAssessorCoordenador, setIdsAssessorCoordenador] = useState([]);
  const [idAssessorGestao, setIdAssessorGestao] = useState([]);
  const [zonaCtrl, setZonaCtrl] = useState('');
  const [funcoesOptions, setFuncoesOptions] = useState([]);
  const eAdmin = useBoolean(false);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    contextReady.onFalse();
    setErrorMsg('');
    if (open) {
      setCurrentUser(row);
      Promise.all([
        buscaFuncoes().catch((error) => {
          setErrorMsg('Erro de comunicação com a API de funções');
        }),
        buscaEscolas().catch((error) => {
          setErrorMsg('Erro de comunicação com a API de escolas');
        }),
        buscaZonas().catch((error) => {
          setErrorMsg('Erro de comunicação com a API de zonas');
        }),
        buscaPermissoes().catch((error) => {
          setErrorMsg('Erro de comunicação com a API de permissoes');
        }),
      ]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [buscaFuncoes, buscaEscolas, buscaZonas, buscaPermissoes, open]);

  useEffect(() => {
    user.permissao_usuario.map((perm) => {
      if (perm.nome === "SUPERADMIN") {
        eAdmin.onTrue();
        setValue('funcao', 'SUPERADMIN');
      }
      if (perm.nome === "ADMIN") {
        eAdmin.onTrue();
        setValue('funcao', 'ADMIN');
      }
    })
  }, [user]);

  useEffect(() => {
    if (contextReady.value) {
      const idsAC = [];
      let idAG = [];
      let funcoes_opts = [];
      funcoes.map((_funcao) => {
        funcoes_opts.push({
          ..._funcao,
          nome_exibicao: _funcao.nome,
        });
        if (_funcao.nome == "ASSESSOR DDZ" || _funcao.nome == "COORDENADOR DE GESTAO") {
          idsAC.push(_funcao.nome);
        } else if (_funcao.nome == "ASSESSOR DE GESTAO") {
          funcoes_opts.push({
            ..._funcao,
            nome_exibicao: 'ASSESSOR PEDAGOGICO',
          })
          idAG.push(_funcao.nome);
          idAG.push('ASSESSOR PEDAGOGICO');
        } else if (_funcao.nome == "DIRETOR") {
          funcoes_opts.push({
            ..._funcao,
            nome_exibicao: 'PEDAGOGO',
          })
        }
      });
      setIdsAssessorCoordenador(idsAC);
      setIdAssessorGestao(idAG);
      setFuncoesOptions(funcoes_opts);
    }
  }, [contextReady.value]);

  useEffect(() => {
    if (permissoes.length > 0) {
      liberaSalvar.onFalse();
    }
  }, [permissoes]);

  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string()
      .required('Email é obrigatório')
      .email('Email tem que ser um endereço de email válido'),
    funcao_usuario: Yup.string(),
    escola: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentUser?.nome || '',
      email: currentUser?.email || '',
      funcao: currentUser?.funcao || currentUser?.permissao_usuario ? currentUser.permissao_usuario[0].nome : '',
      status: (currentUser?.status && currentUser?.status === 'true' ? 'true' : 'false') || '',
      zona: zonaCtrl,
      escola: currentUser?.escola?.length == 1 ? currentUser?.escola[0] : '',
    }),
    [currentUser]
  );

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
    setValue,
    getValues,
  } = methods;

  const values = watch();

  const { funcao } = values;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.funcao == "ADMIN" || data.funcao == "SUPERADMIN") {
        console.log(data.funcao)
        const permissao = permissoes.find((permissao) => permissao.nome == data.funcao);
        if (data.senha) {
          novoUsuario = {
            nome: data.nome,
            email: data.email,
            senha: data.senha,
            login: data.email,
            status: data.status,
            permissao_usuario_id: [permissao.id]
          }
        } else {
          novoUsuario = {
            nome: data.nome,
            email: data.email,
            login: data.email,
            status: data.status,
            permissao_usuario_id: [permissao.id]
          }
        }
        const retornoPatch = await userMethods
          .updateUserById(currentUser.id, novoUsuario)
          .catch((error) => {
            throw error;
          });

        retornoPatch.data.status = novoUsuario.status;

        enqueueSnackbar('Atualizado com sucesso!');
        onSave(retornoPatch.data);
        reset();
      }
      const funcaoEscolhida = funcoesOptions.filter((func) => func.nome_exibicao === data.funcao)[0];
      var novoUsuario = {
        nome: data.nome,
        email: data.email,
        login: data.email,
        status: data.status,
      };

      if (idsAssessorCoordenador.includes(data.funcao)) {
        if (zonaCtrl == '') {
          setErrorMsg('Voce deve selecionar uma zona');
          return;
        } else {
          novoUsuario.funcao_usuario = [{
            funcao_id: funcaoEscolhida.id,
            zona_id: zonaCtrl,
            nome_exibicao: funcaoEscolhida.nome_exibicao,
          }];
        }
      } else if (idAssessorGestao.includes(data.funcao)) {
        if (filters.escolasAG.length == 0) {
          setErrorMsg('Voce deve selecionar uma ou mais escolas');
        } else {
          novoUsuario.funcao_usuario = [];
          filters.escolasAG.map((escolaId) => {
            novoUsuario.funcao_usuario.push({
              funcao_id: funcaoEscolhida.id,
              escola_id: escolaId,
              nome_exibicao: funcaoEscolhida.nome_exibicao,
            });
          });
        }
      } else {
        if (data.escola == '') {
          setErrorMsg('Voce deve selecionar uma escola');
          return;
        } else {
          novoUsuario.funcao_usuario = [{
            funcao_id: funcaoEscolhida.id,
            escola_id: data.escola,
            nome_exibicao: funcaoEscolhida.nome_exibicao,
          }];
        }
      }
      const permissao = permissoes.find((permissao) => permissao.nome == funcaoEscolhida.nome);
      novoUsuario.permissao_usuario_id = [permissao.id];

      const retornoPatch = await userMethods
        .updateUserById(currentUser.id, novoUsuario)
        .catch((error) => {
          throw error;
        });

      retornoPatch.data.status = novoUsuario.status;

      enqueueSnackbar('Atualizado com sucesso!');
      onSave(retornoPatch.data);
      reset();
    } catch (error) {
      const arrayMsg = _.flattenDeep(
        Object.values(error).map((er) => Object.values(er).map((e) => Object.values(e)))
      );
      const mensagem = arrayMsg.join(' ');
      currentUser
        ? setErrorMsg(`Tentativa de atualização do usuário falhou - ` + `${mensagem}`)
        : setErrorMsg(`Tentativa de criação do usuário falhou - ` + `${mensagem}`);
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues)
    const escIds = [];
    setZonaCtrl(currentUser?.zona);
    if (currentUser?.escola) {
      if (currentUser.escola[0]) {
        currentUser.escola.map((escolaId) => {
          escIds.push(escolaId)
        })
      }
    }
    const novosFiltros = {
      escolasAG: escIds
    }
    setFilters(novosFiltros);
  }, [currentUser, defaultValues, reset]);

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

  const handleEscolasAG = useCallback(
    (event) => {
      handleFilters(
        'escolasAG',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const handleZona = useCallback((event) => {
    setZonaCtrl(event.target.value);
  }, [setZonaCtrl]);

  const renderValueEscolasAG = (selected) =>
    selected
      .map((escolaId) => {
        return escolas.find((option) => option.id == escolaId)?.nome;
      })
      .join(', ');

  const escolaOuZona = () => {
    if (idsAssessorCoordenador.includes(getValues('funcao'))) {
      return (
        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >
          <InputLabel>DDZ</InputLabel>
          <Select
            id={`zona_` + `${currentUser?.id}`}
            name="zona"
            disabled={getValues('funcao') == '' ? true : false}
            value={zonaCtrl}
            onChange={handleZona}
            label="DDZ"
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {zonas.map((zona) => (
              <MenuItem key={zona.id} value={zona.id}>
                <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    if (idAssessorGestao.includes(getValues('funcao'))) {
      return (
        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >
          <InputLabel>Escolas</InputLabel>
          <Select
            multiple
            id={`escolas_` + `${currentUser?.id}`}
            name="escolas"
            disabled={getValues('funcao') == '' ? true : false}
            value={filters.escolasAG}
            onChange={handleEscolasAG}
            input={<OutlinedInput label="Escolas" />}
            renderValue={renderValueEscolasAG}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {escolas?.map((escola) => (
              <MenuItem key={escola.id} value={escola.id}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.escolasAG.includes(escola.id)}
                />
                {escola.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else if (getValues('funcao') == "ADMIN" || getValues('funcao') == "SUPERADMIN") {
      return (
        <></>
      )
    } else {
      return (
        <RHFSelect
          id={`escola_` + `${currentUser?.id}`}
          disabled={getValues('funcao') == '' ? true : false}
          name="escola"
          label="Escola"
        >
          {escolas.map((escola) => (
            <MenuItem key={escola.id} value={escola.id}>
              {escola.nome}
            </MenuItem>
          ))}
        </RHFSelect>
      );
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={() => {
        setCurrentUser();
        onClose();
      }}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      {!contextReady.value && <LoadingBox texto="Carregando dependências" mt={4} />}

      {contextReady.value && (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle>Edição Rápida</DialogTitle>

          <DialogContent>
            {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <br></br>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              mb={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="nome" label="Nome Completo" />
              <RHFTextField name="email" label="Email" />
            </Box>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              mb={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFSelect name="funcao" label="Função">
                {funcoesOptions.map((_funcao) => (
                  <MenuItem key={_funcao.nome_exibicao} value={_funcao.nome_exibicao}>
                    {_funcao.nome_exibicao}
                  </MenuItem>
                ))}
                {eAdmin &&

                  <MenuItem key={"ADMIN"} value={"ADMIN"}>
                    {"ADMIN"}
                  </MenuItem>

                }
                {eAdmin &&

                  <MenuItem key={"SUPERADMIN"} value={"SUPERADMIN"}>
                    {"SUPERADMIN"}
                  </MenuItem>

                }
              </RHFSelect>
            </Box>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              mb={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              {escolaOuZona()}
            </Box>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              mb={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFSelect name="status" label="Status">
                {USER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={onClose}>
              Cancelar
            </Button>

            <LoadingButton
              disabled={liberaSalvar.value}
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Atualizar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      )}
    </Dialog>
  );
}

UserQuickEditForm.propTypes = {
  row: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool,
};
