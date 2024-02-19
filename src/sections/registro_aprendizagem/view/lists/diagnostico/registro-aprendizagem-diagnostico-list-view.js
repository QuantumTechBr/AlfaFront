'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// _mock
import { _anos } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useContext } from 'react';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
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
import RegistroAprendizagemDiagnosticoTableRow from './registro-aprendizagem-diagnostico-table-row';
import RegistroAprendizagemTableToolbar from '../registro-aprendizagem-table-toolbar';
import RegistroAprendizagemTableFiltersResult from '../registro-aprendizagem-table-filters-result';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import NovaAvaliacaoForm from 'src/sections/registro_aprendizagem/registro-aprendizagem-modal-form';
import LoadingBox from 'src/components/helpers/loading-box';
import AppAvaliacaoDiagnostico from 'src/sections/overview/app/app-avaliacao-diagnostico.js';
import dashboardsMethods from 'src/sections/overview/dashboards-repository.js';
//

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ano_letivo', label: 'Ano Letivo', width: 75 },
  { id: 'ano_escolar', label: 'Ano Escolar', width: 75 },
  { id: 'nome', label: 'Turma', width: 75 },
  { id: 'turno', label: 'Turno', width: 105 },
  { id: 'alunos', label: 'Estudantes', width: 80 },
  { id: 'periodo', label: 'Período', width: 105 },
  { id: 'escola_nome', label: 'Escola' },
  { id: 'atualizado_por', label: 'Atualizado Por' },
  { id: '', width: 88 },
];

const defaultFilters = {
  anoLetivo: '',
  escola: [],
  turma: [],
  pesquisa: '',
};

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoListView() {
  const [_RegistroAprendizagemList, setRegistroAprendizagemList] = useState([]);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const contextReady = useBoolean(false);

  const [turmasComRegistro, setTurmasComRegistro] = useState([]);
  const [_turmasFiltered, setTurmasFiltered] = useState([]);

  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const debouncedFilters = useDebounce(filters, 1000);

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaAnosLetivos().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de anos letivos');
      }),
      buscaEscolas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
      buscaTurmas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de turmas');
      }),
    ]).finally(() => {
      contextReady.onTrue();
    });
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas, contextReady]);


  useEffect(() => {
    console.log(`debouncedFilters call`);
    preencheGraficos();
  }, [debouncedFilters]);

  const preencheTabela = useCallback(() => {
    const promisesList = [];
    if (turmas && turmas.length) {
      setTurmasFiltered(turmas);
      let turmasComRegistroNovo = [];
      const buscaPeriodoInicial = registroAprendizagemMethods
      .getListIdTurmaRegistroAprendizagemDiagnostico({ periodo: 'Inicial' })
      .then((turmasComRegistros) => {
          const turmasRegistroInicial = [];
          if (turmasComRegistros.data?.length) {
            turmasComRegistros.data.forEach((registro) => {
              const turma = turmas.find((turma) => turma.id == registro.turma_id);
              if (turma?.id) {
                const retorno = { ...turma };
                retorno.periodo = 'Inicial';
                retorno.alunos = turma.turmas_alunos?.length;
                retorno.escola_nome = turma.escola.nome;
                retorno.ano_letivo = turma.ano.ano;
                retorno.atualizado_por = registro.atualizado_por;

                turmasRegistroInicial.push(retorno);
              }
            });
            turmasComRegistroNovo = [...turmasComRegistroNovo, ...turmasRegistroInicial];
          }
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de Registro Aprendizagem Diagnostico');
          console.error(error);
          // preparado.onTrue();
        });
      promisesList.push(buscaPeriodoInicial);
      const buscaPeriodoFinal = registroAprendizagemMethods
        .getListIdTurmaRegistroAprendizagemDiagnostico({ periodo: 'Final' })
        .then((turmasComRegistros) => {
          const turmasRegistroFinal = [];
          if (turmasComRegistros.data?.length) {
            turmasComRegistros.data.forEach((registro) => {
              const turma = turmas.find((turma) => turma.id == registro.turma_id);
              if (turma?.id) {
                const retorno = { ...turma };
                retorno.periodo = 'Final';
                retorno.alunos = turma.turmas_alunos?.length;
                retorno.escola_nome = turma.escola.nome;
                retorno.ano_letivo = turma.ano.ano;
                retorno.atualizado_por = registro.atualizado_por;

                turmasRegistroFinal.push(retorno);
              }
            });
            turmasComRegistroNovo = [...turmasComRegistroNovo, ...turmasRegistroFinal];
          }
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de Registro Aprendizagem Diagnostico');
          console.error(error);
          // preparado.onTrue();
        })
        .finally(() => {
          contextReady.onTrue();
        });
      promisesList.push(buscaPeriodoFinal);
      Promise.all(promisesList).then(() => {
        setTurmasComRegistro(turmasComRegistroNovo);
        setTableData(turmasComRegistroNovo);
        contextReady.onTrue();
        setTurmasFiltered(turmasComRegistroNovo);
      });
    }
  }, [contextReady, turmas]);

  useEffect(() => {
    preparacaoInicial();
  }, []);

  useEffect(() => {
    if(contextReady.value){
      preencheTabela();
      preencheGraficos();
    }
  }, [contextReady.value]);

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

  // TODO CRIAR FUNCAO UNICA PARA RECRIAR TODOS OS FILTROS

  const handleFilters = useCallback(
    (campo, value) => {
      if (campo == 'escola') {
        if (value.length == 0) {
          setTurmasFiltered(turmas);
        } else {
          var filtered = turmas.filter((turma) =>
            value.map((escola) => escola.id).includes(turma.escola.id)
          );
          setTurmasFiltered(filtered);
        }
      }
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [campo]: value,
      }));
    },
    [table, turmas]
  );

  const handleDeleteRow = useCallback(
    (id, periodo) => {
      const deleteRow = tableData.find((row) => row.id == id && row.periodo == periodo);
      if (!deleteRow) {
        setErrorMsg('Linha a ser deletada não encontrada.');
        return;
      }
      const remainingRows = tableData.filter((row) => row.id !== id || row.periodo !== periodo);
      registroAprendizagemMethods
        .deleteRegistroAprendizagemByFilter({ tipo: 'diagnóstico', turmaId: id, periodo: periodo })
        .then((retorno) => {
          setTableData(remainingRows);
        })
        .catch((error) => {
          setErrorMsg(
            'Erro de comunicação com a API de registros aprendizagem no momento da exclusão do registro'
          );
        });

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const remainingRows = [];
    const promises = [];
    tableData.map((row) => {
      if (table.selected.includes(`${row.id}_${row.periodo}`)) {
        const newPromise = registroAprendizagemMethods
          .deleteRegistroAprendizagemByFilter({
            tipo: 'diagnóstico',
            turmaId: row.id,
            periodo: row.periodo,
          })
          .catch((error) => {
            remainingRows.push(row);
            setErrorMsg(
              'Erro de comunicação com a API de registros no momento da exclusão do registro'
            );
            throw error;
          });
        promises.push(newPromise);
      } else {
        remainingRows.push(row);
      }
    });
    Promise.all(promises).then((retorno) => {
      setTableData(remainingRows);
    });

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.registro_aprendizagem.edit_diagnostico(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const novaAvaliacao = useBoolean();

  const closeNovaAvaliacao = (retorno = null) => {
    novaAvaliacao.onFalse();
  };

  const [dadosGrafico, setDadosGrafico] = useState({
    avaliacao_diagnostico: {},
  });

  const preencheGraficos = useCallback(async () => {
    console.log('preenche gráficos');
    if (
      anosLetivos &&
      anosLetivos.length &&
      escolas &&
      escolas.length &&
      turmas &&
      turmas.length
    ) {
      const fullFilters = {
        // ddz: filters.zona.map((item) => item.id),
        ano_letivo: filters.anoLetivo != `` ? [filters.anoLetivo.id] : null,
        escola: filters.escola.map((item) => item.id),
        turma: filters.turma.map((item) => item.id),
      };

      await Promise.all([
        dashboardsMethods.getDashboardAvaliacaoDiagnostico(fullFilters).then((response) => {
          setDadosGrafico((prevState) => ({
            ...prevState,
            avaliacao_diagnostico: response.data,
          }));
        }),
      ]);
    }
  }, [anosLetivos, escolas, turmas, filters]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Typography variant="h4">Avaliação Diagnóstica</Typography>
          <Button
            onClick={novaAvaliacao.onTrue}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{
              bgcolor: '#00A5AD',
            }}
          >
            Adicionar
          </Button>
        </Stack>

        <NovaAvaliacaoForm open={novaAvaliacao.value} onClose={closeNovaAvaliacao} />

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Card>
          <RegistroAprendizagemTableToolbar
            filters={filters}
            onFilters={handleFilters}
            anoLetivoOptions={anosLetivos}
            turmaOptions={_turmasFiltered}
            escolaOptions={escolas}
            export_type='diagnostico'
          />

          {canReset && (
            <RegistroAprendizagemTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
        </Card>
        <Card sx={{ my: 2 }}>
          {/* <Button variant="contained" onClick={preencheGraficos}>Aplicar filtro ao gráfico</Button> */}

          <AppAvaliacaoDiagnostico
            title="Gráfico Avaliação Diagnóstica"
            list={dadosGrafico.avaliacao_diagnostico}
            subheader=""
          />
        </Card>
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => `${row.id}_${row.periodo}`)
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
                        tableData.map((row) => `${row.id}_${row.periodo}`)
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
                        <RegistroAprendizagemDiagnosticoTableRow
                          key={`${row.id}_${row.periodo}`}
                          row={row}
                          selected={table.selected.includes(`${row.id}_${row.periodo}`)}
                          onSelectRow={() => table.onSelectRow(`${row.id}_${row.periodo}`)}
                          onDeleteRow={() => handleDeleteRow(row.id, row.periodo)}
                          onEditRow={() => handleEditRow(row.id, row.periodo)}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              )}
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={false}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Tem certeza que deseja excluir <strong> {table.selected.length} </strong> registro?
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
  const { anoLetivo, escola, turma, pesquisa } = filters;

  if (!inputData) {
    return [];
  }

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (anoLetivo) {
    inputData = inputData.filter((item) => item.ano_letivo == anoLetivo.ano);
  }

  if (escola.length) {
    inputData = inputData.filter((item) =>
      escola.map((baseItem) => baseItem.nome).includes(item.escola_nome)
    );
  }

  if (turma.length) {
    inputData = inputData.filter((item) => turma.map((baseItem) => baseItem.id).includes(item.id));
  }

  if (pesquisa.trim().length) {
    inputData = inputData.filter((item) => {
      return (
        item.ano.ano.toString().toLowerCase().indexOf(pesquisa.trim().toLowerCase()) !== -1 ||
        `${item.ano_escolar.toLowerCase()}${item.nome.toLowerCase()}`.indexOf(
          pesquisa.trim().toLowerCase()
        ) !== -1 ||
        item.turno.toLowerCase().indexOf(pesquisa.trim().toLowerCase()) !== -1 ||
        item.periodo.toLowerCase().indexOf(pesquisa.trim().toLowerCase()) !== -1 ||
        item.escola.nome.toLowerCase().indexOf(pesquisa.trim().toLowerCase()) !== -1
      );
    });
  }

  return inputData;
}
