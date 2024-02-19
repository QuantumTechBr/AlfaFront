'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useContext } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
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
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
//
import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';
//
import userMethods from '../user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import LoadingBox from 'src/components/helpers/loading-box';
// ----------------------------------------------------------------------


const STATUS_OPTIONS = [{ value: 'all', label: 'Todos' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 200 },
  { id: 'email', label: 'E-Mail', width: 300 },
  { id: 'funcao', label: 'Função', width: 200 },
  { id: 'status', label: 'Status', width: 200 },
  { id: '', width: 88 },
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

  const [_userList, setUserList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const preparado = useBoolean(false);

  useEffect(() => {
    userMethods.getAllUsers().then(usuarios => {
      const usuariosNaoDeletados = usuarios.data.filter((usuario) => usuario.deleted_at == null);
      if (usuariosNaoDeletados.length == 0) {
        setWarningMsg('A API retornou uma lista vazia de usuários');
        setUserList([]);
        preparado.onTrue();
      }
      for (var i = 0; i < usuariosNaoDeletados.length; i++) {
        const funcao = [];
        const zona = [];
        const escola = [];
        if(usuariosNaoDeletados[i].funcao_usuario?.length > 0 ){
          for (let index = 0; index < usuariosNaoDeletados[i].funcao_usuario.length; index++) {  
            funcao.push(usuariosNaoDeletados[i].funcao_usuario[index].funcao?.id);
            escola.push(usuariosNaoDeletados[i].funcao_usuario[index].escola?.id);
            zona.push(usuariosNaoDeletados[i].funcao_usuario[index].zona?.id);
          }
          usuariosNaoDeletados[i].funcao = funcao[0] ? funcao[0] : '';
          usuariosNaoDeletados[i].escola = escola ? escola : '';
          usuariosNaoDeletados[i].zona = zona[0] ? zona[0] : '';
        } else {
          usuariosNaoDeletados[i].funcao = '';
          usuariosNaoDeletados[i].escola = '';
          usuariosNaoDeletados[i].zona = '';
        }
        usuariosNaoDeletados[i].status = usuariosNaoDeletados[i].status.toString();
      }
      // usuariosNaoDeletados.map((usuario => {
      //   usuario.status = usuario.status.toString()
      // }))
      setUserList(usuariosNaoDeletados);
      setTableData(usuariosNaoDeletados);
      preparado.onTrue();
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de usuários');
        preparado.onTrue();
      })
      buscaEscolas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
        preparado.onTrue();
      });
      buscaFuncoes().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de funções');
        preparado.onTrue();
    });
  }, []);

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (nome, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [nome]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      userMethods.deleteUserById(id).then(retorno => {
        setTableData(deleteRow);
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de usuários no momento da exclusão do usuário');
      });

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const remainingRows = [];
    const promises = [];
    tableData.map((row) => {
      if(table.selected.includes(row.id)) {
        const newPromise = userMethods.deleteUserById(row.id).catch((error) => {
          remainingRows.push(row);
          setErrorMsg('Erro de comunicação com a API de usuários no momento da exclusão do usuário');
          throw error;
        });
        promises.push(newPromise)
      } else {
        remainingRows.push(row);
      }
    });
    Promise.all(promises).then(
      retorno => {
        setTableData(remainingRows);
      }
    )

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

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
            <Button
              component={RouterLink}
              href={paths.dashboard.user.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Adicionar
            </Button>
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
                    {tab.value === 'all' && tableData.length}
                    {tab.value === 'true' &&
                      tableData.filter((user) => user.status === 'true').length}
                    {tab.value === 'pending' &&
                      tableData.filter((user) => user.status === 'pending').length}
                    {tab.value === 'false' &&
                      tableData.filter((user) => user.status === 'false').length}
                    {tab.value === 'rejected' &&
                      tableData.filter((user) => user.status === 'rejected').length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            roleOptions={funcoes}
            escolaOptions={escolas}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              roleOptions={funcoes}
              escolaOptions={escolas}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
            {!preparado.value ? (
                <LoadingBox />
                ) : (
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table> )}
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Tem certeza que deseja excluir <strong> {table.selected.length} </strong> usuários?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { nome, status, role, ddz, escola } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (user) => user.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.funcao));
  }

  if (escola.length) {
    inputData = inputData.filter((user) => escola.includes(user.escola));
  }

  return inputData;
}
