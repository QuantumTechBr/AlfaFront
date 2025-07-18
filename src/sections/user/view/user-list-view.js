'use client';

import { useEffect, useState, useCallback, useContext } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { IconButton, Tooltip } from '@mui/material';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
//
import userMethods from '../user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import LoadingBox from 'src/components/helpers/loading-box';
// auth
import { useAuthContext } from 'src/auth/hooks';
import UserQuickEditForm from '../user-quick-edit-form';
import ImportHelperButton from 'src/components/helpers/import-helper-button';
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Todos' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', notsortable: true },
  { id: 'email', label: 'E-Mail', width: 300, notsortable: true },
  { id: 'funcao', label: 'Função', width: 200, notsortable: true },
  { id: 'status', label: 'Status', width: 200, notsortable: true },
  { id: '', width: 88, notsortable: true },
];

const defaultFilters = {
  nome: '',
  role: [],
  ddz: [],
  escola: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function UserListView() {
  const { checkPermissaoModulo } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const preparado = useBoolean(false);

  const [countAtivos, setCountAtivos] = useState(0);
  const [countInativos, setCountInativos] = useState(0);
  const [countAll, setCountAll] = useState(0);
  const [countUsuarios, setCountUsuarios] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);
  const [funcoesOptions, setFuncoesOptions] = useState([]);
  const permissaoCadastrar = checkPermissaoModulo('usuario', 'cadastrar');
  const permissaoSuperAdmin = checkPermissaoModulo('superadmin', 'upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const quickEdit = useBoolean();
  const [rowToEdit, setRowToEdit] = useState();

  const [tableData, setTableData] = useState([]);
  
  const closeUploadModal = () => {
    setOpenUploadModal(false);
  }

  const handleFileUpload = (event) => {
    setUploadedFile(event.target.files[0]);
  }

  const modalStyle = {
    position: 'absolute',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  
  const uploadUsuarios = async () => {
    try {
      const formData = new FormData();
      formData.append('arquivo', uploadedFile);

      closeUploadModal();

      setWarningMsg('Enviando arquivo. Por favor, aguarde... ' +
        'O processo de importação pode demorar alguns minutos e até mesmo horas dependendo do número de registros a serem validados. ' +
        'Você pode acompanhar o status do processo pela página Importações. Por favor, evite iniciar vários processos de importação simultaneamente. ' +
        'Isso pode gerar lentidão no sistema e até mesmo inconsistência de dados.'
      );

      const response = await userMethods.importFileUsers(formData);

      if (response.ok) {
        // File uploaded successfully
        console.log('File uploaded successfully');
      } else {
        // Error uploading file
        console.error('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  const buscaUsuarios = useCallback(
    async (pagina = 0, linhasPorPagina = 25, oldUserList = [], filtros = filters) => {
      preparado.onFalse();
      setWarningMsg('');
      setErrorMsg('');
      const offset = pagina * linhasPorPagina;
      const limit = linhasPorPagina;
      let { nome, escola, role, zona, status } = filtros;
      // Separar permissões ADMIN e SUPERADMIN
      // e filtrar as demais permissões
      let permissao = [];
      role = role.filter((item) => {
        if (item == 'ADMIN') {
          permissao.push('ADMIN');
        } else if (item == 'SUPERADMIN') {
          permissao.push('SUPERADMIN');
        } else {
          return item;
        }
      });
      let statusFilter = '';

      switch (status) {
        case 'false':
          statusFilter = 'False';
          break;
        case 'true':
          statusFilter = 'True';
      }

      await userMethods
        .getAllUsersPaginado({
          offset,
          limit,
          nome: nome,
          escolas: escola,
          funcao: role,
          zona: zona,
          status: '',
          permissao: permissao,
        })
        .then(async (resultado) => {
          setCountAll(resultado.data.count);
        });

      await userMethods
        .getAllUsersPaginado({
          offset,
          limit,
          nome: nome,
          escolas: escola,
          funcao: role,
          zona: zona,
          status: 'True',
          permissao: permissao
        })
        .then(async (resultado) => {
          setCountAtivos(resultado.data.count);
        });

      await userMethods
        .getAllUsersPaginado({
          offset,
          limit,
          nome: nome,
          escolas: escola,
          funcao: role,
          zona: zona,
          status: 'False',
          permissao: permissao
        })
        .then(async (resultado) => {
          setCountInativos(resultado.data.count);
        });

      await userMethods
        .getAllUsersPaginado({
          offset,
          limit,
          nome: nome,
          escolas: escola,
          funcao: role,
          zona: zona,
          status: statusFilter,
          permissao: permissao
        })
        .then(async (usuarios) => {
          if (usuarios.data.count == 0) {
            setWarningMsg('A API retornou uma lista vazia de usuários');
            setTableData([]);
          } else {
            const users = usuarios.data.results;

            for (var i = 0; i < users.length; i++) {
              const funcao = [];
              const userZona = [];
              const userEscola = [];
              if (users[i].funcao_usuario?.length > 0) {
                for (let index = 0; index < users[i].funcao_usuario.length; index++) {
                  funcao.push(users[i].funcao_usuario[index]?.nome_exibicao);
                  userEscola.push(users[i].funcao_usuario[index].escola?.id);
                  userZona.push(users[i].funcao_usuario[index].zona?.id);
                }
                users[i].funcao = funcao[0] ? funcao[0] : '';
                users[i].escola = userEscola ? userEscola : '';
                users[i].zona = userZona[0] ? userZona[0] : '';
              } else {
                users[i].funcao = '';
                users[i].escola = '';
                users[i].zona = '';
              }
              users[i].status = users[i].status.toString();
            }

            setTableData([...oldUserList, ...users]);
          }
          setCountUsuarios(usuarios.data.count);
        })
        .catch((error) => {
          setErrorMsg(error);
          console.log("errou",error);
        });
        preparado.onTrue();
    },
    [preparado, filters]
  );

  useEffect(() => {
    let funcoes_opts = [];
    funcoes.map((_funcao) => {
      funcoes_opts.push({..._funcao,
        nome_exibicao: _funcao.nome,
      });
      if (_funcao.nome == "ASSESSOR DE GESTAO") {
        funcoes_opts.push({..._funcao,
          nome_exibicao: 'ASSESSOR PEDAGOGICO',
        });
      } else if (_funcao.nome == "DIRETOR") {
        funcoes_opts.push({..._funcao,
          nome_exibicao: 'PEDAGOGO',
        })
      }
    });
    funcoes_opts.push({
      id: 'ADMIN',
      nome: 'ADMIN',
      nome_exibicao: 'ADMIN',
    })
    funcoes_opts.push({
      id: 'SUPERADMIN',
      nome: 'SUPERADMIN',
      nome_exibicao: 'SUPERADMIN',
    })
    setFuncoesOptions(funcoes_opts);
  }, [funcoes]);

 

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaEscolas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
        preparado.onTrue();
      }),
      buscaFuncoes().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de funções');
        preparado.onTrue();
      }),
    ]);
    preparado.onTrue();
  }, [buscaEscolas, buscaUsuarios, preparado, table.page, table.rowsPerPage]);

  const onChangePage = async (event, newPage) => {
    if (tableData.length < (newPage + 1) * table.rowsPerPage) {
      buscaUsuarios(newPage, table.rowsPerPage, tableData);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback(
    (event) => {
      table.setPage(0);
      table.setRowsPerPage(parseInt(event.target.value, 10));
      setTableData([]);
      buscaUsuarios(0, event.target.value);
    },
    [buscaUsuarios, table]
  );

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect( () => {
    buscaUsuarios(table.page, table.rowsPerPage).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de usuários');
      console.log(error);
    });
    // contarUsuarios();
 }, [escolas]);


  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !tableData.length;

  const handleFilters = useCallback(
    (nome, value) => {
      table.onResetPage();
      const novosFiltros = {
        ...filters,
        [nome]: value,
      };
      setFilters(novosFiltros);
    },
    [table, filters]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      userMethods
        .deleteUserById(id)
        .then((retorno) => {
          preparado.onFalse();
          setTableData([]);
          setTimeout(preparacaoInicial, 1000);
        })
        .catch((error) => {
          setErrorMsg(
            'Erro de comunicação com a API de usuários no momento da exclusão do usuário'
          );
        });

      // table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleSaveRow = useCallback(
    (novosDados) => {
      const _tableData = tableData.map((item) => {
        if (item.id === novosDados.id) {
          return { ...item, ...novosDados };
        }
        return item;
      });
      setTableData(_tableData);
    },
    [tableData]
  );

  const saveAndClose = (retorno = null) => {
    handleSaveRow({ ...rowToEdit, ...retorno });
    quickEdit.onFalse();
  };

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
      const filtrosNovos = { ...filters };
      filtrosNovos.status = newValue;
      buscaUsuarios(table.page, table.rowsPerPage, [], filtrosNovos);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
     
        <CustomBreadcrumbs
          heading="Usuários"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Usuário', href: paths.dashboard.user.list },
            { name: 'Listar' },
          ]}
          action={
            permissaoCadastrar && (
              <Button
                component={RouterLink}
                href={paths.dashboard.user.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{
                  bgcolor: '#00A5AD',
                }}
              >
                Adicionar
              </Button>
            )
          }
          youtubeLink="https://www.youtube.com/embed/CCRIjmY_6Xs?si=SH1R_J1YtN-gffFz&cc_load_policy=1"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {permissaoSuperAdmin && (
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              onClick={() => setOpenUploadModal(true)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: '#EE6C4D',
                marginBottom: "1em"
              }}
            >
              Importar Usuários
            </Button>
            <ImportHelperButton 
            ordemImportacao='escola -> turma -> usuário'
            nomeTela='USUARIOS'
            linkDownload={'/modelos-de-importacao/modelo-importacao-usuario.xlsx'}
            />
          </Box>

        )}

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'true' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'false' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && countAll}
                    {tab.value === 'true' && countAtivos}
                    {tab.value === 'false' && countInativos}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{
              xs: 'column',
              md: 'row',
            }}
            sx={{
              pr: { xs: 2.5, md: 2.5 },
            }}
          >
            <UserTableToolbar
              filters={filters}
              onFilters={handleFilters}
              roleOptions={funcoesOptions}
              escolaOptions={escolas}
              setErrorMsg={setErrorMsg}
              setWarningMsg={setWarningMsg}
            />
            <Button
              variant="contained"
              sx={{
                width: {
                  xs: '100%',
                  md: '15%',
                },
              }}
              onClick={() => {
                preparado.onFalse();
                setTableData([]);
                table.setPage(0);
                // contarUsuarios();
                buscaUsuarios(table.page, table.rowsPerPage, [], filters);
              }}
            >
              Aplicar filtros
            </Button>
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              {!preparado.value ? (
                <LoadingBox texto="Buscando usuários" />
              ) : (
                <Table size="small" sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataInPage.map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        quickEdit={() => {
                          quickEdit.onTrue();
                          setRowToEdit(row);
                        }}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                    <TableEmptyRows
                      height={52}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              )}
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={countUsuarios}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Card>
        <Modal open={openUploadModal} onClose={closeUploadModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6">Upload Arquivo</Typography>
            <input type="file" 
              onChange={handleFileUpload} 
            />
            <Button variant="contained" onClick={uploadUsuarios}>Upload</Button>
          </Box>
        </Modal>
      </Container>

      {checkPermissaoModulo('usuario', 'editar') && (
        <UserQuickEditForm
          row={rowToEdit}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onSave={saveAndClose}
        />
      )}
    </>
  );
}
