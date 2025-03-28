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
import { _disciplinas, _registrosAprendizagemComponente } from 'src/_mock';
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
import RegistroAprendizagemComponenteTableRow from './registro-aprendizagem-componente-table-row';
import RegistroAprendizagemTableToolbar from '../registro-aprendizagem-table-toolbar';
import RegistroAprendizagemTableFiltersResult from '../registro-aprendizagem-table-filters-result';
// ----------------------------------------------------------------------
import AppAvaliacaoComponente from 'src/sections/overview/app/app-avaliacao-componente.js';

const TABLE_HEAD = [
  { id: 'ano_escolar', label: 'Ano Letivo', width: 75 },
  { id: 'ano_serie', label: 'Ano de Ensino', width: 75 },
  { id: 'turma', label: 'Turma', width: 75 },
  { id: 'turno', label: 'Turno', width: 105 },
  { id: 'alunos', label: 'Estudantes', width: 80 },
  { id: 'escola', label: 'Escola' },
  { id: '', width: 88 },
];

const defaultFilters = {
  anoEscolar: new Date().getFullYear(),
  escola: [],
  turma: [],
  disciplina: [],
};

// ----------------------------------------------------------------------

export default function RegistroAprendizagemComponenteListView() {
  const [_RegistroAprendizagemList, setRegistroAprendizagemList] = useState([]);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  const [_turmasFiltered, setTurmasFiltered] = useState([]);

  useEffect(() => {
    buscaAnosLetivos();
    buscaEscolas();
    buscaTurmas().then((_turmas) => setTurmasFiltered(_turmas));
    // registroAprendizagemMethods.getAllRegistrosAprendizagem().then((response) => {
    //   setRegistroAprendizagemList(response.data);
    //   setTableData(response.data);
    // });
    setRegistroAprendizagemList(_registrosAprendizagemComponente);
    setTableData(_registrosAprendizagemComponente);
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas]);

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

  // TODO CRIAR FUNCAO UNICA PARA RECRIAR TODOS OS FILTROS

  const [dadosGrafico, setDadosGrafico] = useState([
    {
      name: 'Desenvolvida',
      data: [8, 6, 7, 9, 7],
      stack: 'A',
      title: '',
      label: 'Desenvolvida',
    },
  ]);

  const handleFilters = useCallback(
    (nome, value) => {
      if (nome == 'escola') {
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
        [nome]: value,
      }));
    },
    [table, turmas]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.registro_aprendizagem.edit_componente(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

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
          <Typography variant="h4">Acompanhamento por componente</Typography>
          {/* <Button
            component={RouterLink}
            href={paths.dashboard.registro_aprendizagem.new_componente}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{
              bgcolor: '#00A5AD',
            }}
          >
            Adicionar
          </Button> */}
        </Stack>

        <Card>
          {/* <RegistroAprendizagemTableToolbar
            filters={filters}
            onFilters={handleFilters}
            anoEscolarOptions={anosLetivos}
            escolaOptions={escolas}
            turmaOptions={_turmasFiltered}
            disciplinaOptions={_disciplinas}
            export_type='componente'
          />

          {canReset && (
            <RegistroAprendizagemTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} */}

          <AppAvaliacaoComponente
            title="Gráfico por Componente"
            list={dadosGrafico}
          />

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
                      <RegistroAprendizagemComponenteTableRow
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
  const { nome, anoEscolar, escola, turma, disciplina } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (anoEscolar) {
    inputData = inputData.filter((item) => item.ano_escolar == anoEscolar.ano);
  }

  if (escola.length) {
    inputData = inputData.filter((item) =>
      escola.map((baseItem) => baseItem.nome).includes(item.escola)
    );
  }

  if (turma.length) {
    inputData = inputData.filter((item) =>
      turma.map((baseItem) => baseItem.nome).includes(item.turma)
    );
  }

  if (disciplina.length) {
    inputData = inputData.filter((item) => disciplina.includes(item.disciplina));
  }

  if (nome) {
    inputData = inputData.filter(
      (item) => item.escola.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  return inputData;
}
