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
import Stack from '@mui/material/Stack';
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

  const permissaoCadastrar = checkPermissaoModulo('usuario', 'cadastrar');

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const quickEdit = useBoolean();
  const [rowToEdit, setRowToEdit] = useState();

  const [tableData, setTableData] = useState([]);

  const buscaUsuarios = useCallback(
    async (pagina = 0, linhasPorPagina = 25, oldUserList = [], filtros = filters) => {
      preparado.onFalse();
      setWarningMsg('');
      setErrorMsg('');
      const offset = pagina * linhasPorPagina;
      const limit = linhasPorPagina;
      const { nome, escola, role, zona, status } = filtros;
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
          status: statusFilter,
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
                  funcao.push(users[i].funcao_usuario[index].funcao?.id);
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
          setErrorMsg('Erro de comunicação com a API de usuários');
          console.log(error);
        });
        preparado.onTrue();
    },
    [preparado, filters]
  );

  const contarUsuarios = useCallback(
    async (filtros = filters) => {
      const offset = 0;
      const limit = 1;
      const { nome, escola, role, zona, status } = filtros;

      await userMethods
        .getAllUsersPaginado({
          offset,
          limit,
          nome: nome,
          escolas: escola,
          funcao: role,
          zona: zona,
          status: '',
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
        })
        .then(async (resultado) => {
          setCountInativos(resultado.data.count);
        });
    },
    [filters]
  );

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
      buscaUsuarios(table.page, table.rowsPerPage).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de usuários');
        console.log(error);
      }),
      contarUsuarios(),
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
          setTableData(deleteRow);
        })
        .catch((error) => {
          setErrorMsg(
            'Erro de comunicação com a API de usuários no momento da exclusão do usuário'
          );
        });

      table.onUpdatePageDeleteRow(dataInPage.length);
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
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

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
              roleOptions={funcoes}
              escolaOptions={escolas}
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
                contarUsuarios();
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
