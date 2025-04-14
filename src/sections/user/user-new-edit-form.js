import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Tooltip from '@mui/material/Tooltip';
import Iconify from 'src/components/iconify';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableBody from '@mui/material/TableBody';
import { Button, IconButton } from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import LoadingBox from 'src/components/helpers/loading-box';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import userMethods from './user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import Alert from '@mui/material/Alert';
import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  useTable,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';
import UserFuncaoEditModal from './user-funcao-edit-modal';
import UserFuncaoTableRow from './user-funcao-table-row';

// ----------------------------------------------------------------------
const filtros = {
  escolasAG: [],
};

const uploadImagemButtonStyle = {
  marginTop: '0%',
  minWidth: '150px',
  backgroundColor: 'light-green !important',
  color: 'white',
}
export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [filters, setFilters] = useState(filtros);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { permissoes, buscaPermissoes } = useContext(PermissoesContext);
  const [funcoesOptions, setFuncoesOptions] = useState([]);
  const [zonaCtrl, setZonaCtrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectNewAvatar, setSelectNewAvatar] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const eAdmin = useBoolean(false);
  const table = useTable();
  const edit = useBoolean(false);
  const [tableData, setTableData] = useState([]);
  const [rowToEdit, setRowToEdit] = useState();
  const contextReady = useBoolean(false);

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
  }, [buscaFuncoes, buscaEscolas, buscaZonas, buscaPermissoes]);

  useEffect(() => {
    eAdmin.onFalse();
    currentUser?.permissao_usuario?.map((perm) => {
      if (perm.nome === "SUPERADMIN") {
        eAdmin.onTrue();
        setValue('funcao', 'SUPERADMIN');
      } else if (perm.nome === "ADMIN") {
        eAdmin.onTrue();
        setValue('funcao', 'ADMIN');
      } 
    })
  }, [currentUser]);

  useEffect(() => {
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
    setFuncoesOptions(funcoes_opts);
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
      funcao: currentUser?.funcao || currentUser?.permissao_usuario?.length > 0 ? currentUser.permissao_usuario[0].nome : '',
      status: (currentUser?.status ? "true" : "false") || '',
      zona: zonaCtrl,
      escola: currentUser?.escola?.length == 1 ? currentUser?.escola[0] : '',
      avatar: currentUser?.avatar || null,
    }),
    [currentUser]
  );

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
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

  const { funcao } = values;

  const updateUserAvatar = async () => {
    try {
      setEnviandoImagem(true);
      const userAvatar = getValues('avatar');
      if (!!userAvatar) {
        const formData = new FormData();
        formData.append('arquivo', userAvatar)
        await userMethods.updateUserAvatar(formData).then(() => {
          setEnviandoImagem(false);
          setSelectNewAvatar(false);
          enqueueSnackbar('Avatar atualizado com sucesso!');
        }).catch((error) => {
          setEnviandoImagem(false);
          setSelectNewAvatar(false);
          throw error;
        });
      }
    } catch (error) {
      setEnviandoImagem(false);
      setSelectNewAvatar(false);
      setErrorMsg(`Tentativa de atualização do avatar falhou - ` + `${error}`);
      console.error(error);
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (currentUser?.login == 'admin') { // usuário admin não pode ser editado pelo frontend
      setErrorMsg('Não é permitido editar o usuário admin diretamente! Por favor, entre em contato com o suporte técnico.');
      return;
    }

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
            permissao_usuario_id: [permissao.id],
            funcao_usuario: []

          }
        } else {
          novoUsuario = {
            nome: data.nome,
            email: data.email,
            login: data.email,
            status: data.status,
            permissao_usuario_id: [permissao.id],
            funcao_usuario: []
          }
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
        router.push(paths.dashboard.user.list);
        return;
      }

      var novoUsuario = {}
      // vamos reenviar as permissões excluindo permissao de admin/superadmin caso haja
      const permissoesValidas = currentUser.permissao_usuario.filter((permissao) => permissao.nome != 'ADMIN' && permissao.nome != 'SUPERADMIN');
      if (data.senha) {
        novoUsuario = {
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          login: data.email,
          status: data.status,
          permissao_usuario_id: permissoesValidas?.map((permissao) => permissao.id),
        }
      } else {
        novoUsuario = {
          nome: data.nome,
          email: data.email,
          login: data.email,
          status: data.status,
          permissao_usuario_id: permissoesValidas?.map((permissao) => permissao.id),
        }
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
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      currentUser ? setErrorMsg(`Tentativa de atualização do usuário falhou - ` + `${error}`) : setErrorMsg(`Tentativa de criação do usuário falhou - ` + `${error}`);
      console.error(error);
    }
  });

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


  useEffect(() => {
    reset(defaultValues);

    const data = []
    if (eAdmin.value) {
      return;
    }
    atualizaTableData(currentUser);
  }, [currentUser, defaultValues, reset]);


  const handleFilters = useCallback(
    async (nome, value) => {
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
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
    selected.map((escolaId) => {
      return escolas.find((option) => option.id == escolaId)?.nome;
    }).join(', ');

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatar', newFile, { shouldValidate: true });
        setSelectNewAvatar(true);
      }
    },
    [setValue]
  );

  
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
            {user?.id == currentUser?.id ? (
              <Box sx={{ mb: 5 }}>
                <RHFUploadAvatar
                  name="avatar"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  helperText={
                    <>
                      {selectNewAvatar && (
                        <div
                          style={{
                            width: 'min-content',
                            margin: 'auto',
                          }}
                        >
                          <LoadingButton
                            variant="contained"
                            loading={enviandoImagem}
                            style={uploadImagemButtonStyle}
                            onClick={updateUserAvatar}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                m: '0',
                                display: 'block',
                                textAlign: 'center',
                                color: 'white',
                              }}
                            >
                              Enviar imagem
                            </Typography>
                          </LoadingButton>
                        </div>
                      )}
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
                        Permitido *.jpeg, *.jpg, *.png
                        <br /> tamanho máximo {fData(3145728)}
                      </Typography>
                    </>
                  }
                />
              </Box>
            ) : (
              <>
                <Box
                  component="img"
                  src={currentUser?.avatar || '/assets/user-avatar.svg'}
                  alt="User Avatar"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    mx: 'auto',
                    mb: 3,
                  }}
                />
              </>
            )}
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

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 2,
                  gridColumn: 'span 2',
                  borderBottom: '1px solid',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  py: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ mr: 2 }}>
                  Usuário Admin?
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={values.funcao === 'ADMIN' ? 'contained' : 'outlined'}
                    onClick={() => {
                      if (values.funcao === 'ADMIN') {
                        setValue('funcao', '');
                        eAdmin.onFalse();
                      } else {
                        setValue('funcao', 'ADMIN')
                        eAdmin.onTrue();
                      }
                      }}
                  >
                    ADMIN
                  </Button>
                  <Button
                    variant={values.funcao === 'SUPERADMIN' ? 'contained' : 'outlined'}
                    onClick={() => {
                      if (values.funcao === 'SUPERADMIN') {
                        setValue('funcao', '');
                        eAdmin.onFalse();
                      } else {
                        setValue('funcao', 'SUPERADMIN')
                        eAdmin.onTrue();
                      }
                    }}
                  >
                    SUPERADMIN
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Card>
            {currentUser && !eAdmin.value && (
              
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
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting || !contextReady.value}
              >
                {!currentUser ? 'Criar Usuário' : 'Atualizar Usuário'}
              </LoadingButton>
            </Stack>
          
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

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
