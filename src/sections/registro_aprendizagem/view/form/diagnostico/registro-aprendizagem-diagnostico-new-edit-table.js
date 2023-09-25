'use client';

import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useContext } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { useRouter } from 'src/routes/hook';
// _mock
import { promo_options } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
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
import RegistroAprendizagemDiagnosticoNewEditTableRow from './registro-aprendizagem-diagnostico-new-edit-table-row';
import RegistroAprendizagemDiagnosticoNewEditTableToolbar from './registro-aprendizagem-diagnostico-new-edit-table-toolbar';
import InfoIcon from '@mui/icons-material/Info';
import { Box } from '@mui/material';
import RegistroAprendizagemDiagnosticoNewEditTableFiltersResult from './registro-aprendizagem-diagnostico-new-edit-table-filters-result';
// ----------------------------------------------------------------------
export default function RegistroAprendizagemDiagnosticoNewEditTable({ turma, alunosTurma, habilidades, handleTurma }) {
  const defaultFilters = {
    nome: '',
    promo_ano_anterior: [],
  };

  const [TABLE_HEAD, setTableHead] = useState([]);
  const [tableData, setTableData] = useState([]);

  const labelHabilidade = (habilidade) => {
    const { nome, descricao } = habilidade;
    return (
        <Box>
          {nome}
          <Tooltip title={descricao}>
          <InfoIcon 
              sx={{
                fontSize: 'large',
              }}
            />
          </Tooltip>
        </Box>
    );
  };

  useEffect(() => {
    let cabecalho = [
        { id: 'nome', label: 'Nome', width: 150 },
        { id: 'promo_ano_anterior', label: 'Promoção no ano anterior', width: 200 },
    ];
    for (var i = 0; i < habilidades.length; i++) {
      cabecalho.push({ id: habilidades[i].id, label: labelHabilidade(habilidades[i]), width: 120 });
    }
    setTableHead(cabecalho);
    const tableData = (alunosTurma == undefined) ? [] : alunosTurma;
    setTableData(tableData);
 
    
  }, [habilidades, alunosTurma]);

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>

        <Card>

          <RegistroAprendizagemDiagnosticoNewEditTableToolbar
            filters={filters}
            onFilters={handleFilters}
            promoOptions={promo_options}
            turma={turma}
            handleTurma={handleTurma}
          />

          
          {canReset && (
            <RegistroAprendizagemDiagnosticoNewEditTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              promoOptions={promo_options}
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
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <RegistroAprendizagemDiagnosticoNewEditTableRow
                        key={row.id}
                        row={row}
                        habilidades={habilidades}
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
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

    </>
  );
}

RegistroAprendizagemDiagnosticoNewEditTable.propTypes = {
  turma: PropTypes.object,
  alunosTurma: PropTypes.array,
  habilidades: PropTypes.array,
  handleTurma: PropTypes.func,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { nome, promo_ano_anterior } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (alunosTurma) => alunosTurma.aluno.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (promo_ano_anterior.length) {
    inputData = inputData.filter((alunosTurma) => promo_ano_anterior.includes(alunosTurma.promo_ano_anterior));
  }

  return inputData;
}
