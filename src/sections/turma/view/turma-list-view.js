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
import TurmaTableRow from '../turma-table-row';
import TurmaTableToolbar from '../turma-table-toolbar';
import TurmaTableFiltersResult from '../turma-table-filters-result';
//
import { AuthContext } from 'src/auth/context/alfa';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import turmaMethods from 'src/sections/turma/turma-repository';
import LoadingBox from 'src/components/helpers/loading-box';
import { useAuthContext } from 'src/auth/hooks';
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Todos' }, ...USER_STATUS_OPTIONS];



const anoAtual = new Date().getFullYear();
const defaultFilters = {
  nome: '',
  ddz: [],
  escola: [],
  status: 'all',
};

// ----------------------------------------------------------------------

// TODO quando limpa os filtros não está atualizando o contador de ativos e inativos
export default function TurmaListView() {

  const { checkPermissaoModulo } = useAuthContext();
  const { turmas, buscaTurmasPaginado } = useContext(TurmasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [turmaList, setTurmaList] = useState([]);
  const [countTurmas, setCountTurmas] = useState(0);
  const [countAtivos, setCountAtivos] = useState(0);
  const [countInativos, setCountInativos] = useState(0);
  const [countAll, setCountAll] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const [mapCachePromises, setMapCachePromises] = useState(new Map());

  const contextReady = useBoolean(false);
  const liberaResults = useBoolean(false);

  const permissaoCadastrar = checkPermissaoModulo("turma", "cadastrar");

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const TABLE_HEAD = [
    ...(escolas.length > 1 ? [{ id: 'escola', label: 'Escola', width: 300 }] : []),
    { id: 'ano_serie', label: 'Ano', width: 300 },
    { id: 'nome', label: 'Turma', width: 200 },
    { id: 'turno', label: 'Turno', width: 200 },
    { id: 'ano_escolar', label: 'Ano Letivo', width: 300 },
    { id: 'alunos', label: 'Estudantes', width: 200 },
    { id: 'status', label: 'Status', width: 200 },
    { id: '', width: 88 },
  ];

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const buscarTurmas = useCallback(async (pagina = 0, linhasPorPagina = 25, oldTurmaList = [], filtros = filters) => {
    liberaResults.onFalse();
    setWarningMsg('');
    setErrorMsg('');
    contextReady.onFalse();
    const offset = (pagina) * linhasPorPagina;
    const limit = linhasPorPagina;
    const { nome, escola, ddz, status } = filtros;
    let statusFilter = '';

    switch (status) {
      case "false":
        statusFilter = "False"
        break;
      case "true":
        statusFilter = "True"
    }

    await buscaTurmasPaginado({ args: { offset, limit, nome, ddzs: ddz, escolas: escola, status: statusFilter } }).then(async resultado => {

      if (resultado.count == 0) {
        setWarningMsg('A API retornou uma lista vazia de turmas');
        setTableData([]);
        contextReady.onTrue();
      } else {
        const listaTurmas = resultado.results;
        listaTurmas.map((turma) => {
          turma.status = turma.status.toString()
        })
        setTurmaList([...oldTurmaList, ...listaTurmas]);
        setTableData([...oldTurmaList, ...listaTurmas]);
        contextReady.onTrue();
      }
      setCountTurmas(resultado.count);
      liberaResults.onTrue();
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de turmas');
      console.log(error);
      contextReady.onTrue();
    });
  }, [contextReady, filters, liberaResults]);

  const contarTurmas = useCallback(async (filtros = filters) => {
    const offset = 0;
    const limit = 1;
    const { nome, escola, ddz, status } = filtros;

    await buscaTurmasPaginado({ args: { offset, limit, nome, ddzs: ddz, escolas: escola, status: "" } }).then(async resultado => {
      setCountAll(resultado.count);
    });

    await buscaTurmasPaginado({ args: { offset, limit, nome, ddzs: ddz, escolas: escola, status: "True" } }).then(async resultado => {
      setCountAtivos(resultado.count);
    });

    await buscaTurmasPaginado({ args: { offset, limit, nome, ddzs: ddz, escolas: escola, status: "False" } }).then(async resultado => {
      setCountInativos(resultado.count);
    });
  }, [filters]);

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaZonas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
      buscaEscolas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
      buscarTurmas(table.page, table.rowsPerPage).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de turmas');
        console.log(error);
      }),
      contarTurmas()
    ]);
    contextReady.onTrue();
  }, [buscaEscolas, buscarTurmas, contextReady, table.page, table.rowsPerPage]);

  const onChangePage = async (event, newPage) => {
    if (turmaList.length < (newPage + 1) * table.rowsPerPage) {
      buscarTurmas(newPage, table.rowsPerPage, turmaList);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback((event) => {
    table.setPage(0);
    table.setRowsPerPage(parseInt(event.target.value, 10));
    setTurmaList([]);
    setTableData([]);
    buscarTurmas(0, event.target.value);
  }, [buscarTurmas, table]);

  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleFilters = useCallback(
    async (nome, value) => {
      liberaResults.onFalse();
      table.onResetPage();
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
      setFilters(novosFiltros);
    },
    [table, filters, liberaResults]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      turmaMethods.deleteTurmaById(id).then(retorno => {
        setTableData(deleteRow);
        // buscarTurmas({force: true});
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de turmas no momento da exclusão da turma');
      });

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData, buscarTurmas]
  );

  const handleDeleteRows = useCallback(() => {
    const remainingRows = [];
    const promises = [];
    tableData.map((row) => {
      if (table.selected.includes(row.id)) {
        const newPromise = turmaMethods.deleteTurmaById(row.id).catch((error) => {
          remainingRows.push(row);
          setErrorMsg('Erro de comunicação com a API de turmas no momento da exclusão da turma');
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
        // buscarTurmas({force: true});
      }
    )

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: tableData.length,
    });
  }, [dataInPage.length, table, tableData, buscarTurmas]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.turma.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
      const filtrosNovos = {...filters};
      filtrosNovos.status = newValue
      buscarTurmas(table.page, table.rowsPerPage, [], filtrosNovos);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(async () => {
    liberaResults.onFalse();
    setFilters(defaultFilters);
    setTableData([]);
    setTurmaList([]);
    contarTurmas();
    buscarTurmas(table.page, table.rowsPerPage, [], defaultFilters);
  }, [buscarTurmas, table.page, table.rowsPerPage, contarTurmas, liberaResults]);

  useEffect(() => {
    preparacaoInicial();
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Turmas"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Turmas', href: paths.dashboard.turma.root },
            { name: 'Listar' },
          ]}
          // TODO: trocar por teste de permissão
          action={permissaoCadastrar &&
            <Button
              component={RouterLink}
              href={paths.dashboard.turma.new}
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

            <TurmaTableToolbar
              filters={filters}
              onFilters={handleFilters}
              ddzOptions={zonas}
              escolaOptions={escolas}
            />

            <Button
              variant="contained"
              sx={{
                width: {
                  xs: "100%",
                  md: "15%",
                },

              }}
              onClick={() => {
                contextReady.onFalse();
                setTableData([]);
                setTurmaList([]);
                contarTurmas();
                buscarTurmas(table.page, table.rowsPerPage, [], filters);
              }}
            >
              Aplicar filtros
            </Button>
          </Stack>
          {canReset && liberaResults.value && (
            <TurmaTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              escolaOptions={escolas}
              ddzsOptions={zonas}
              onResetFilters={handleResetFilters}
              results={countTurmas}
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
              {!contextReady.value ? (
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
                    {tableData
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <TurmaTableRow
                          key={row.id}
                          row={row}
                          showEscola={escolas.length > 1}
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
                </Table>)}
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={countTurmas}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      {/* TODO TRAZER PARA PÁGINA PRINCIPAL O MODAL, RETIRAR DE CADA LINHA */}
      {/* <TurmaQuickEditForm currentTurma={row} open={quickEdit.value} onClose={quickEdit.onFalse} /> */}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Tem certeza que deseja excluir <strong> {table.selected.length} </strong> turmas?
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
  const { nome, ddz, escola, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (turma) => turma.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (ddz.length) {
    inputData = inputData.filter((turma) => ddz.includes(turma.ddz));
  }

  if (escola.length) {
    inputData = inputData.filter((turma) => escola.includes(turma.escola.id));
  }

  if (status !== 'all') {
    inputData = inputData.filter((turma) => turma.status === status);
  }

  return inputData;
}