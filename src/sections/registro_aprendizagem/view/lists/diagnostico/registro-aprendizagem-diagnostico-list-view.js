'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// _mock
import { _anos } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
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
//

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ano_letivo', label: 'Ano Letivo', width: 75 },
  { id: 'ano_escolar', label: 'Ano Escolar', width: 75 },
  { id: 'nome', label: 'Turma', width: 75 },
  { id: 'turno', label: 'Turno', width: 105 },
  { id: 'alunos', label: 'Alunos', width: 80 },
  { id: 'periodo', label: 'Período', width: 105 },
  { id: 'escola_nome', label: 'Escola' },
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

  const [turmasComRegistro, setTurmasComRegistro] = useState([]);
  const [_turmasFiltered, setTurmasFiltered] = useState([]);

  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const preparacaoInicial = async () => {
    preencheTabela();
    await Promise.all([buscaAnosLetivos(), buscaEscolas(), buscaTurmas()]);
  };
  useEffect(() => {
    preparacaoInicial();
  }, [setTableData]);

  const preencheTabela = () => {
    const promisesList = [];
    let turmasRegistroInicial = [];
    let turmasRegistroFinal = [];
    if (!!turmas && turmas.length) {

      setTurmasFiltered(turmas);
      let turmasComRegistroNovo = [];
      const buscaPeriodoInicial = registroAprendizagemMethods
        .getListIdTurmaRegistroAprendizagemDiagnostico({ periodo: 'Inicial' })
        .then((listaIdsTurmas) => {
          if (listaIdsTurmas.data.length) {
            turmasRegistroInicial = turmas.filter((turma) =>
              listaIdsTurmas.data.includes(turma.id)
            );
            turmasRegistroInicial = turmasRegistroInicial.map((turma) => {
              const retorno = { ...turma };
              retorno.periodo = 'Inicial';
              retorno.alunos = turma.alunosTurmas.length;
              retorno.escola_nome = turma.escola.nome;
              retorno.ano_letivo = turma.ano.ano;
              return retorno;
            });
            turmasComRegistroNovo = [...turmasComRegistroNovo, ...turmasRegistroInicial];
          }
        });
      promisesList.push(buscaPeriodoInicial);
      const buscaPeriodoFinal = registroAprendizagemMethods
        .getListIdTurmaRegistroAprendizagemDiagnostico({ periodo: 'Final' })
        .then((listaIdsTurmas) => {
          if (listaIdsTurmas.data.length) {
            turmasRegistroFinal = turmas.filter((turma) => listaIdsTurmas.data.includes(turma.id));
            turmasRegistroFinal = turmasRegistroFinal.map((turma) => {
              const retorno = { ...turma };
              retorno.periodo = 'Final';
              retorno.alunos = turma.alunosTurmas.length;
              retorno.escola_nome = turma.escola.nome;
              retorno.ano_letivo = turma.ano.ano;
              return retorno;
            });
            turmasComRegistroNovo = [...turmasComRegistroNovo, ...turmasRegistroFinal];
          }
        });
      promisesList.push(buscaPeriodoFinal);
      Promise.all(promisesList).then(() => {
        setTurmasComRegistro(turmasComRegistroNovo);
        setTableData(turmasComRegistroNovo);
        setTurmasFiltered(turmasComRegistroNovo);
      });
    }
  };

  useEffect(() => {
    preencheTabela();
  }, [turmas, setTurmasComRegistro, setTableData, setTurmasFiltered]);

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
    [table]
  );

  const handleDeleteRow = useCallback(
    (id, periodo) => {
      const deleteRow = tableData.find((row) => (row.id == id && row.periodo == periodo));
      if(!deleteRow){
        console.log("Linha a ser deletada não encontrada.")
        return;
      } else {
        console.log("Linha a ser deletada: ", deleteRow);
      }
      const remainingRows = tableData.filter((row) => (row.id !== id || row.periodo !== periodo));
      setTableData(remainingRows);

      table.onUpdatePageDeleteRow(dataInPage.length);
      registroAprendizagemMethods.deleteRegistroAprendizagemByFilter({tipo:'diagnóstico', turmaId:id, periodo:periodo})

    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const remainingRows = [];
    tableData.map((row) => {
      if(table.selected.includes(`${row.id}_${row.periodo}`)) {
        registroAprendizagemMethods.deleteRegistroAprendizagemByFilter({tipo:'diagnóstico', turmaId:row.id, periodo:row.periodo});
      } else {
        remainingRows.push(row);
      }
    });
    setTableData(remainingRows);


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
          <Typography variant="h4">Avaliação de Diagnóstico</Typography>
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

        <Card>
          <RegistroAprendizagemTableToolbar
            filters={filters}
            onFilters={handleFilters}
            anoLetivoOptions={anosLetivos}
            turmaOptions={_turmasFiltered}
            escolaOptions={escolas}
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
    inputData = inputData.filter((item) =>
      turma.map((baseItem) => baseItem.id).includes(item.id)
    );
  }

  if (pesquisa.trim().length) {
    inputData = inputData.filter(
      (item) => {
        return item.ano.ano.toString().toLowerCase().indexOf(pesquisa.trim().toLowerCase()) !== -1 ||
        (`${item.ano_escolar.toLowerCase()}${item.nome.toLowerCase()}`).indexOf(pesquisa.trim().toLowerCase()) !== -1 ||
        item.turno.toLowerCase().indexOf(pesquisa.trim().toLowerCase()) !== -1 ||
        item.periodo.toLowerCase().indexOf(pesquisa.trim().toLowerCase()) !== -1 ||
        item.escola.nome.toLowerCase().indexOf(pesquisa.trim().toLowerCase()) !== -1 
        ;
      }
    );
  }

  return inputData;
}
