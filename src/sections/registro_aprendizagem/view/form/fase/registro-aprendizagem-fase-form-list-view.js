'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Grid from '@mui/material/Unstable_Grid2';
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
import { _registrosAprendizagemFaseUnicaRegistros } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useContext } from 'react';
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
import RegistroAprendizagemFaseFormTableRow from './registro-aprendizagem-fase-form-table-row';
import RegistroAprendizagemFaseFormTableToolbar from './registro-aprendizagem-fase-form-table-toolbar';
import RegistroAprendizagemFaseFormTableFiltersResult from './registro-aprendizagem-fase-form-table-filters-result';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 150 },
  // {...RegistroAprendizagemFases.map((fase)=> { id: 'pre_alfabetica', label: 'Pré Alfabética', width: 80 },)}
  { id: 'pre_alfabetica', label: 'Pré Alfabética', width: 80 },
  { id: 'alfabetica_parcial', label: 'Alfabética Parcial', width: 80 },
  { id: 'alfabetica_completa', label: 'Alfabética Completa', width: 80 },
  { id: 'alfabetica_consolidada', label: 'Alfabética Consolidada', width: 80 },
  { id: 'nao_avaliado', label: 'Não Avaliado', width: 80 },
  { id: 'observacao', label: 'Observação' },
];

const defaultFilters = {
  turma: [],
};

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormListView() {
  const [_RegistroAprendizagemList, setRegistroAprendizagemList] = useState([]);
  const { turmas, buscaTurmas } = useContext(TurmasContext);


  useEffect(() => {
    buscaTurmas();
    // registroAprendizagemMethods.getAllRegistrosAprendizagem().then((response) => {
    //   setRegistroAprendizagemList(response.data);
    //   setTableData(response.data);
    // });
    setRegistroAprendizagemList(_registrosAprendizagemFaseUnicaRegistros);
    setTableData(_registrosAprendizagemFaseUnicaRegistros);
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

  // TODO CRIAR FUNCAO UNICA PARA RECRIAR TODOS OS FILTROS

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
      router.push(paths.dashboard.registro_aprendizagem.edit_fase(id));
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
          <Typography variant="h4">
            Criação/Edição Avaliação de Fases do Desenvolvimento da Leitura e da Escrita
          </Typography>
        </Stack>

        <Card>
          <RegistroAprendizagemFaseFormTableToolbar
            filters={filters}
            onFilters={handleFilters}
            turmaOptions={turmas}
          />

          {canReset && (
            <RegistroAprendizagemFaseFormTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>

              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataFiltered
                      .map((row) => (
                        <RegistroAprendizagemFaseFormTableRow key={row.id} row={row} id_avaliacao={row.id} />
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
            hidden
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={false}
          />
        </Card>

        <Stack
        style={{marginTop: 10}}
        direction="row"
        spacing={0.5}
        justifyContent="flex-end"
 >
          <Grid alignItems='center' xs={3}>
            <Button variant="contained" color="primary">
              Salvar
            </Button>
          </Grid>
        </Stack>
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
  const { nome, turma } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (turma.length) {
    inputData = inputData.filter((item) =>
      turma.map((baseItem) => baseItem.nome).includes(item.turma)
    );
  }

  if (nome) {
    inputData = inputData.filter(
      (item) => item.aluno.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  return inputData;
}
