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
// _mock
import { PLANO_STATUS_OPTIONS } from 'src/_mock';
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

import PlanoIntervencaoTableRow from '../plano-intervencao-table-row';
import PlanoIntervencaoTableToolbar from '../plano-intervencao-table-toolbar';
import PlanoIntervencaoTableFiltersResult from '../plano-intervencao-table-filters-result';
import planoIntervencaoMethods from '../plano-intervencao-repository';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import LoadingBox from 'src/components/helpers/loading-box';
import NovoPlanoIntervencaoForm from '../plano-intervencao-modal-form';
import parse from 'date-fns/parse';
import { useAuthContext } from 'src/auth/hooks';
// ----------------------------------------------------------------------



const TABLE_HEAD = [
  { id: 'nome', label: 'Variáveis a melhorar', width: 200 },
  { id: 'acao', label: 'Ação', width: 300 },
  { id: 'responsavel', label: 'Responsável pela ação', width: 300 },
  { id: 'data_inicio', label: 'Inicio previsto', width: 80 },
  { id: 'data_termino', label: 'Término previsto', width: 80 },
  { id: 'ano_escolar', label: 'Ano de Ensino', width: 80 },
  { id: 'aplicacao', label: 'Aplicação', width: 80 },
  { id: 'status', label: 'Status', width: 80 },
  { id: 'data_conclusao', label: 'Data de Conclusão', width: 80 },
  { id: 'farol', label: 'Farol', width: 50 },
  { id: '', width: 88 },
];

const defaultFilters = {
  nome: '',
  role: [],
  zona: [],
  escola: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function PlanoIntervencaoListView() {

  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { checkPermissaoModulo } = useAuthContext();
  const preparado = useBoolean(false);

  const permissaoCadastrar = checkPermissaoModulo("plano_intervencao","cadastrar");


  useEffect(() => {
    planoIntervencaoMethods.getAllPlanosIntervencao({fase: '', habilidades: ''}).then(planos => {
      setTableData(planos.data);
      preparado.onTrue();
    }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de planos');
        preparado.onTrue();
    })
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
      preparado.onTrue();
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
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
      planoIntervencaoMethods.deletePlanoIntervencaoById(id).then(retorno => {
        setTableData(deleteRow);
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de usuários no momento da exclusão do plano de intervenção');
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
        const newPromise = planoIntervencaoMethods.deletePlanoIntervencaoById(row.id).catch((error) => {
          remainingRows.push(row);
          setErrorMsg('Erro de comunicação com a API de usuários no momento da exclusão do plano de intervenção');
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
      router.push(paths.dashboard.plano_intervencao.edit(id));
    },
    [router]
  );

  const handleNewFrom = useCallback(
    (id) => {
      router.push(paths.dashboard.plano_intervencao.new_from(id));
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

  const novoPlano = useBoolean();

  const closeNovoPlano = (retorno = null) => {
    novoPlano.onFalse();
  };


  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Planos de Intervenção"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Planos de Intervenção', href: paths.dashboard.plano_intervencao.list },
            { name: 'Listar' },
          ]}
          action={permissaoCadastrar &&
            <Button
              // component={RouterLink}
              // href={paths.dashboard.plano_intervencao.new}
              onClick={novoPlano.onTrue}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Adicionar
            </Button>
          }
          youtubeLink="https://www.youtube.com/embed/bf9xNpG2NZ4?si=P0prPKwf74aOXPf8&cc_load_policy=1"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <NovoPlanoIntervencaoForm open={novoPlano.value} onClose={closeNovoPlano} />

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
            {PLANO_STATUS_OPTIONS.map((tab) => (
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
                      (tab.value === 'Concluído' && 'success') ||
                      (tab.value === 'Em Andamento Dentro do Prazo' && 'warning') ||
                      (tab.value === 'Em Andamento Fora do Prazo' && 'error') ||
                      (tab.value === 'Criado' && 'info') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && tableData.length}
                    {tab.value === 'Concluído' &&
                      tableData.filter((plano) => filtraStatus(plano) === 'Concluído').length}
                    {tab.value === 'Em Andamento Dentro do Prazo' &&
                      tableData.filter((plano) => filtraStatus(plano) === 'Em Andamento Dentro do Prazo').length}
                    {tab.value === 'Em Andamento Fora do Prazo' &&
                      tableData.filter((plano) => filtraStatus(plano) === 'Em Andamento Fora do Prazo').length}
                    {tab.value === 'Criado' &&
                      tableData.filter((plano) => filtraStatus(plano) === 'Criado').length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <PlanoIntervencaoTableToolbar
            filters={filters}
            onFilters={handleFilters}
            zonaOptions={zonas}
            escolaOptions={escolas}
          />

          {canReset && (
            <PlanoIntervencaoTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              zonaOptions={zonas}
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
                  onSelectAllRows={
                    permissaoCadastrar ? (
                    (checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )) : (
                      permissaoCadastrar
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
                      <PlanoIntervencaoTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onNewFrom={() => handleNewFrom(row.id)}
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
            Tem certeza que deseja excluir <strong> {table.selected.length} </strong> planos de intervenção?
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

const filtraStatus = (plano) => {
  const date_inicio = parse(plano?.inicio_previsto, 'yyyy-MM-dd', new Date())

  const date_termino = parse(plano?.termino_previsto, 'yyyy-MM-dd', new Date())

  const hoje = new Date()

  if (plano?.status == 'Concluído') {
    return 'Concluído'
  }
  if (hoje > date_inicio && hoje < date_termino) {
    return 'Em Andamento Dentro do Prazo';
  } else if (hoje < date_inicio) {
    return 'Criado';
  } else {
    return 'Em Andamento Fora do Prazo';
  }
}

function applyFilter({ inputData, comparator, filters }) {
  const { nome, status, role, zona, escola } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  const filtraEscola = (plano) => {
    const aplicacao = plano?.aplicacao || '';
    const encontrado = new Boolean();
    aplicacao?.escolas?.map((esc) => {
      if (escola.includes(esc)) {
        encontrado.value = true;
      }
    })
    return encontrado.value
  }

  const filtraZona = (plano) => {
    const aplicacao = plano?.aplicacao || '';
    const encontrado = new Boolean();
    aplicacao?.zonas?.map((zon) => {
      if (zona.includes(zon)) {
        encontrado.value = true;
      }
    })
    return encontrado.value
  }

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (user) => user?.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((plano) => filtraStatus(plano) === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user?.funcao));
  }

  if (escola.length) {
    inputData = inputData.filter((plano) => filtraEscola(plano));
  }

  if (zona.length) {
    inputData = inputData.filter((plano) => filtraZona(plano));
  }

  return inputData;
}
