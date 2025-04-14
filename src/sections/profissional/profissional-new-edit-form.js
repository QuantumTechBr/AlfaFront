
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Tooltip from '@mui/material/Tooltip';
import { Button } from '@mui/material';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableBody from '@mui/material/TableBody';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
// components
import Iconify from 'src/components/iconify';
import LoadingBox from 'src/components/helpers/loading-box';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  useTable,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';
import { USER_STATUS_OPTIONS, _ddzs } from 'src/_mock';
import userMethods from '../user/user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import Alert from '@mui/material/Alert';
import { AuthContext } from 'src/auth/context/alfa';
import UserFuncaoEditModal from '../user/user-funcao-edit-modal';
import UserFuncaoTableRow from '../user/user-funcao-table-row';

// ----------------------------------------------------------------------
const filtros = {
  escolasAG: [],
};
export default function ProfissionalNewEditForm({ currentUser }) {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [filters, setFilters] = useState(filtros);
  const { permissoes, buscaPermissoes } = useContext(PermissoesContext);
  const [funcoesOptions, setFuncoesOptions] = useState([]);
  const [ zonaCtrl, setZonaCtrl ] = useState('');
  
  const table = useTable();
  const edit = useBoolean(false);
  const [tableData, setTableData] = useState([]);
  const [rowToEdit, setRowToEdit] = useState();
  const contextReady = useBoolean(false);

  const [funcaoProfessorDiretor, setFuncaoProfessorDiretor] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
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

  }, [buscaEscolas, buscaFuncoes, buscaZonas, buscaPermissoes]);

  useEffect(() => {
    const idsAC = [];
      let idAG = [];
      let funcoes_opts = [];
      let funcoes_professor_diretor = [];
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
          funcoes_professor_diretor.push({
            ..._funcao,
            nome_exibicao: 'PEDAGOGO',
          })
          funcoes_professor_diretor.push({
            ..._funcao,
            nome_exibicao: _funcao.nome,
          });
          funcoes_opts.push({
            ..._funcao,
            nome_exibicao: 'PEDAGOGO',
          })
        } else if (_funcao.nome == "PROFESSOR") {
          funcoes_professor_diretor.push({
            ..._funcao,
            nome_exibicao: 'PROFESSOR',
          })
        }
      });
      console.log(funcoes_professor_diretor)
      setFuncaoProfessorDiretor(funcoes_professor_diretor);
      setFuncoesOptions(funcoes_opts);
  }, [funcoes]);

  const atualizaTableData = useCallback((user) => {
    const data = []
    if (user?.funcao_usuario?.length > 0) {
      for (const funcaoUsuario of user.funcao_usuario) {
        data.push({
          ...funcaoUsuario,
          user_id: user.id,
        })
      }
    }
    setTableData(data);
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
      status: (currentUser?.status ? "true" : "false") || '',
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
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novoUsuario = {
        nome:  data.nome,
        email: data.email,
        login: data.email,
        status: data.status,
      }
      if (data.senha) {
        novoUsuario['senha'] = data.senha;
      }
      

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
    } catch (error) {
      const arrayMsg = Object.values(error).map((msg) => {
        return (msg[0] ? msg[0].charAt(0).toUpperCase() + msg[0].slice(1) : '');
      });
      const mensagem = arrayMsg.join(' ');
      currentUser ? setErrorMsg(`Tentativa de atualização do usuário falhou - `+`${mensagem}`) : setErrorMsg(`Tentativa de criação do usuário falhou - `+`${mensagem}`);
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
    atualizaTableData(currentUser);
  }, [currentUser, defaultValues, reset]);

  const handleSaveRow = async (novosDadosFuncaoUsuario) => {
    setErrorMsg('');
    let permissoesObjects = permissoes ?? await buscaPermissoes();
    if (!permissoesObjects || permissoesObjects.length == 0) {
      setErrorMsg('Permissões não encontradas!');
      return;
    }
    try {
      const funcaoUsuario = {
        id: novosDadosFuncaoUsuario.id,
        funcao_id: novosDadosFuncaoUsuario.funcao.id,
        funcao: novosDadosFuncaoUsuario.funcao,
        escola_id: novosDadosFuncaoUsuario.escola?.id ?? null,
        zona_id: novosDadosFuncaoUsuario.zona?.id ?? null,
        nome_exibicao: novosDadosFuncaoUsuario.nome_exibicao,
      }

      if (!novosDadosFuncaoUsuario.id || novosDadosFuncaoUsuario.id == 'novo' || novosDadosFuncaoUsuario.id == '') {

        // primeiro verifica se o usuário já tem a função na escola/zona
        const funcaoUsuarioOld = tableData.find((item) => item.funcao_id == novosDadosFuncaoUsuario.funcao?.id && item.zona_id == novosDadosFuncaoUsuario.zona?.id && item.escola_id == novosDadosFuncaoUsuario.escola?.id);
        if (funcaoUsuarioOld) {
          setErrorMsg('Usuário já possui esta função na escola/zona!');
          return;
        }
        // se não tiver, insere a nova funcao na lista do currentUser
        currentUser.funcao_usuario.push(funcaoUsuario);

      } else {
        // verifica se o usuário já tem a função na escola/zona repetida
        const funcaoUsuarioRepetida = tableData.find((item) => item.funcao_id == novosDadosFuncaoUsuario.funcao.id && item.zona_id == novosDadosFuncaoUsuario.zona?.id && item.escola_id == novosDadosFuncaoUsuario.escola?.id && item.id != novosDadosFuncaoUsuario.id);
        if (funcaoUsuarioRepetida) {
          setErrorMsg('Usuário já possui esta função na escola/zona!');
          return;
        }

        currentUser.funcao_usuario = currentUser.funcao_usuario.map((item) => {
          if (item.id === novosDadosFuncaoUsuario.id) {
            return { ...item, ...funcaoUsuario };
          }
          return item;
        });

      }
      // copiando permissoes para parametro de updateUserById
      const permissoes = [];
      currentUser.funcao_usuario.map((item) => {
        const permissao = permissoesObjects.find((permissao) => permissao.nome == item.funcao?.nome);
        if (permissao) {
          permissoes.push(permissao);
        }
      });
      // atualiza o currentUser com as permissoes
      currentUser['permissao_usuario_id'] = permissoes.map((permissao) => permissao.id);
      // atualiza o currentUser 
      await userMethods.updateUserById(currentUser.id, currentUser).then((response) => {
        currentUser.funcao_usuario = response.data.funcao_usuario.map((item) => {
          item.funcao_id = item.funcao.id;
          item.zona_id = item.zona?.id ?? null;
          item.escola_id = item.escola?.id ?? null;
          return item;  
        })
        atualizaTableData(response.data);
        enqueueSnackbar('Atualizado com sucesso!');
      }).catch((error) => {
        setErrorMsg('Erro ao atualizar usuário', error);
        console.error(error);
      }).finally(() => {
        edit.onFalse();
        setRowToEdit(null);
      });
      
    } catch (error) {
      setErrorMsg('Tentativa de atualização de função do usuário falhou', error);
      console.error(error);
    }
  }

  const handleDeleteRow = async (row) => {
    setErrorMsg('');
    if (!row || !row.id) {
      setErrorMsg('Nenhum dado encontrado!');
      return;
    }
    try {
      currentUser.funcao_usuario = currentUser.funcao_usuario.filter((item) => item.id !== row.id);
      const nomesPermissoes = currentUser.funcao_usuario.map((item) => item.funcao.nome);
      currentUser['permissao_usuario_id'] =  permissoes.filter((permissao) => nomesPermissoes.includes(permissao.nome)).map((permissao) => permissao.id);
      await userMethods.updateUserById(currentUser.id, currentUser).then((response) => {
        atualizaTableData(response.data);
        enqueueSnackbar('Atualizado com sucesso!');
      }).catch((error) => {
        setErrorMsg('Erro ao atualizar usuário', error);
        console.error(error);
      }).finally(() => {
        edit.onFalse();
        setRowToEdit(null);
      });

    } catch (error) {
      setErrorMsg('Tentativa de atualização de função do usuário falhou', error);
      console.error(error);
    }
  }

  
  const botaoLabel = () => {
    return (
      <Tooltip
        title={'Atributir Função em Escola/Zona'}
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: '#d3d3d3', 
              color: '#333',
              boxShadow: 1,
              fontSize: '0.875rem',
              textAlign: 'center', 
            },
          },
          arrow: {
            sx: {
              color: '#d3d3d3', 
            },
          },
        }}
      >
        <Box>
          <Button
            variant="contained"
            onClick={() => {
              edit.onTrue();
              setRowToEdit();
            }}
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{
              bgcolor: '#00A5AD',
            }}
          >
            Função
          </Button>
        </Box>
      </Tooltip>
    );
  }

  const saveAndClose = (retorno = null) => {
    handleSaveRow(retorno);
    edit.onFalse();
  };
  
  const TABLE_HEAD = [
    { id: 'funcao', label: 'Função', width: 400, notsortable: true },
    { id: 'escola/zona', label: 'Escola/DDZ', width: 100, notsortable: true },
    { id: '', label: botaoLabel(), width: 88 },
  ];
  
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <Grid container spacing={3}>
        <Grid sx={{ width: '100%' }} xs={12} md={12}>
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
              <RHFTextField name="email" label="Email" autoComplete="new-item"/>
              <RHFTextField name="senha" label="Nova Senha" type="password" autoComplete="new-password"/>

              <RHFSelect name="status" label="Status">
                {USER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained"  loading={isSubmitting || !contextReady.value}>
                {!currentUser ? 'Criar Usuário' : 'Atualizar Usuário'}
              </LoadingButton>
            </Stack>
          </Card>

          {currentUser && (
                        
            <TableContainer sx={{ pt: 2, position: 'relative', }}>
              <Table>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {!contextReady.value ? (
                    <LoadingBox texto="Carregando dependências" mt={4} />
                  ) : (
                    tableData.map((row) => (
                      <UserFuncaoTableRow
                        key={row.id}
                        row={row}
                        onEditRow={() => {
                          edit.onTrue();
                          setRowToEdit(row);
                        }}
                        onDeleteRow={() => handleDeleteRow(row)}
                      />
                    ))
                  )}

                  <TableEmptyRows
                    height={49}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      <UserFuncaoEditModal
              row={rowToEdit}
              open={edit.value}
              onClose={edit.onFalse}
              onSave={saveAndClose}
              funcoesOptions={funcoesOptions}
            />
    </FormProvider>
  );
}

ProfissionalNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
