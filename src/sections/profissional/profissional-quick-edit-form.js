import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState, useContext, useCallback } from 'react';
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
import { USER_STATUS_OPTIONS, _ddzs } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import userMethods from '../user/user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import { useBoolean } from 'src/hooks/use-boolean';
import { ZonasContext } from '../zona/context/zona-context';
import { AuthContext } from 'src/auth/context/alfa';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import LoadingBox from 'src/components/helpers/loading-box';

import _ from 'lodash';

// ----------------------------------------------------------------------
const filtros = {
  escolasAG: [],
};
export default function ProfissionalQuickEditForm({ row, open, onClose, onSave }) {
  const [currentUser, setCurrentUser] = useState();
  const [filters, setFilters] = useState(filtros);
  const contextReady = useBoolean(false);
  const liberaSalvar = useBoolean(true);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { permissoes, buscaPermissoes } = useContext(PermissoesContext);
  const [idsAssessorCoordenador, setIdsAssessorCoordenador] = useState([]);
  const [idAssessorGestao, setIdAssessorGestao] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    contextReady.onFalse();
    setErrorMsg('');
    if (open) {
      setCurrentUser({ nome: row.profissional, ...row });
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
    if (contextReady.value) {
      const idsAC = [];
      let idAG = '';
      funcoes.map((_funcao) => {
        if (_funcao.nome == 'ASSESSOR DDZ' || _funcao.nome == 'COORDENADOR DE GESTÃO') {
          idsAC.push(_funcao.id);
        } else if (_funcao.nome == 'ASSESSOR DE GESTÃO') {
          idAG = _funcao.id;
        }
      });
      setIdsAssessorCoordenador(idsAC);
      setIdAssessorGestao(idAG);
    }
  }, [contextReady.value]);

  useEffect(() => {
    if (currentUser) {
      //
      const escIds = [];
      if (currentUser?.escola) {
        const _escolasIds = escolas.map((item) => item.id);
        (currentUser?.escola ?? []).map((escolaId) => {
          if (escolaId) {
            if (_escolasIds.includes(escolaId)) {
              escIds.push(escolaId);
            }
          }
        });
      }
      const novosFiltros = {
        escolasAG: escIds,
      };
      setFilters(novosFiltros);
    }
  }, [currentUser]);

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
      funcao: currentUser
        ? typeof currentUser?.funcao == 'object'
          ? _.first(currentUser?.funcao)
          : currentUser?.funcao
        : '',
      status: (currentUser?.status && currentUser?.status === 'true' ? 'true' : 'false') || '',
      zona: currentUser?.zona || '',
      escola: currentUser?.escola || '',
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
    getValues,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novoUsuario = {
        nome: data.nome,
        email: data.email,
        login: data.email,
        status: data.status,
      };

      if (idsAssessorCoordenador.includes(data.funcao)) {
        if (data.zona == '') {
          setErrorMsg('Voce deve selecionar uma zona');
          return;
        } else {
          novoUsuario.funcao_usuario = [
            {
              funcao_id: data.funcao,
              zona_id: data.zona,
            },
          ];
        }
      } else if (data.funcao == idAssessorGestao) {
        if (filters.escolasAG.length == 0) {
          setErrorMsg('Voce deve selecionar uma ou mais escolas');
        } else {
          novoUsuario.funcao_usuario = [];
          filters.escolasAG.map((escolaId) => {
            novoUsuario.funcao_usuario.push({
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
          novoUsuario.funcao_usuario = [
            {
              funcao_id: data.funcao,
              escola_id: data.escola,
            },
          ];
        }
      }
      const _funcao = funcoes.find((funcaoEscolhida) => funcaoEscolhida.id == data.funcao);
      const permissao = permissoes.find((permissao) => permissao.nome == _funcao.nome);
      novoUsuario.permissao_usuario_id = [permissao.id];

      const retornoPatch = await userMethods
        .updateUserById(currentUser.id, novoUsuario)
        .catch((error) => {
          throw error;
        });

      retornoPatch.data.profissional = retornoPatch.data.nome;
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
        ? setErrorMsg(`Tentativa de atualização do profissional falhou - ` + `${mensagem}`)
        : setErrorMsg(`Tentativa de criação do usuário falhou - ` + `${mensagem}`);
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues);
  }, [currentUser]);

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

  const renderValueEscolasAG = (selected) =>
    selected
      .map((escolaId) => {
        return escolas.find((option) => option.id == escolaId)?.nome;
      })
      .join(', ');

  const escolaOuZona = () => {
    if (idsAssessorCoordenador.includes(getValues('funcao'))) {
      return (
        <RHFSelect
          id={`zona_` + `${currentUser?.id}`}
          disabled={getValues('funcao') == '' ? true : false}
          name="zona"
          label="DDZ"
        >
          {zonas.map((zona) => (
            <MenuItem key={zona.id} value={zona.id}>
              <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
            </MenuItem>
          ))}
        </RHFSelect>
      );
    }
    if (getValues('funcao') == idAssessorGestao) {
      return (
        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >
          <InputLabel>Escolas</InputLabel>
          <Select
            multiple
            name="escola"
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

  const desabilitaMudarFuncao = () => {
    if (user?.funcao_usuario[0]?.funcao?.nome == 'DIRETOR') {
      return true;
    }
    return false;
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
      {!contextReady.value && <LoadingBox texto='Carregando dependências' mt={4} />}

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

              <RHFSelect name="funcao" label="Função" disabled={desabilitaMudarFuncao()}>
                {funcoes.map((_funcao) => (
                  <MenuItem key={_funcao.id} value={_funcao.id}>
                    {_funcao.nome}
                  </MenuItem>
                ))}
              </RHFSelect>

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

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Atualizar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      )}
    </Dialog>
  );
}

ProfissionalQuickEditForm.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool,
};
