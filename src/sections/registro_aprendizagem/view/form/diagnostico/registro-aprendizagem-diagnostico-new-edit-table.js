'use client';

import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// _mock
import { frequencia_options } from 'src/_mock';
// components
import Scrollbar from 'src/components/scrollbar';
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
import { useBoolean } from 'src/hooks/use-boolean';
import LoadingBox from 'src/components/helpers/loading-box';
// ----------------------------------------------------------------------
export default function RegistroAprendizagemDiagnosticoNewEditTable({ turma, periodo, alunosTurma, habilidades, handleTurma, prep }) {
  const defaultFilters = useMemo(() => {
    return {
      nome: '',
      promo_ano_anterior: [],
    }
  }, []);

  const [TABLE_HEAD, setTableHead] = useState([]);
  const [tableData, setTableData] = useState([]);
  const preparado = prep;

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
    const cabecalho = [
        { id: 'matricula', label: 'Matrícula', width: 150 },
        { id: 'nome', label: 'Nome', width: 150 },
        { id: 'frequencia', label: 'Frequência', width: 200 },
    ];
    for (var i = 1; i < 21; i++) {
      cabecalho.push({ id: `R${i}`, label: `R${i}`, width: 50 });
    }
    cabecalho.push({ id: 'mediaLP', label: 'MÉDIA LP', width: 70 });
    cabecalho.push({ id: 'nvEscrita', label: 'Nível escrita - LP (resultado do item 10)', width: 150 });
    cabecalho.push({ id: 'nvLP', label: 'NÍVEL_LP', width: 50 });
    cabecalho.push({ id: 'mediaMAT', label: 'MÉDIA MAT', width: 70 });
    cabecalho.push({ id: 'nvResolucao', label: 'Nível Resolução de problemas - MAT (resultado do item 20)', width: 150 });
    cabecalho.push({ id: 'nvMAT', label: 'NÍVEL_MAT', width: 50 });
    cabecalho.push({ id: 'mediaFinal', label: 'Média Final', width: 50 });
    cabecalho.push({ id: 'nivelFinal', label: 'NÍVEL FINAL', width: 50 });
    setTableHead(cabecalho);
    setTableData((alunosTurma == undefined) ? [] : alunosTurma);
 
    
  }, [habilidades, alunosTurma]);

  const table = useTable();

  const settings = useSettingsContext();

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
  }, [defaultFilters]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>

        <Card>

          <RegistroAprendizagemDiagnosticoNewEditTableToolbar
            filters={filters}
            onFilters={handleFilters}
            promoOptions={frequencia_options}
            turma={turma}
            handleTurma={handleTurma}
          />

          {canReset && (
            <RegistroAprendizagemDiagnosticoNewEditTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              promoOptions={frequencia_options}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative',overflow: 'unset', }}  >
            <Scrollbar sx={{
              "& .simplebar-scrollbar": {
                "backgroundColor": "#D3D3D3",
                'borderRadius': 10,
              },
             }}>
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
                  />

                <TableBody sx={{ bgcolor: 'white' }}>
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
                        periodo={periodo}
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
            rowsPerPageOptions={[5]}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            // dense={table.dense}
            // onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>
  );
}

RegistroAprendizagemDiagnosticoNewEditTable.propTypes = {
  turma: PropTypes.object,
  periodo: PropTypes.string,
  alunosTurma: PropTypes.array,
  habilidades: PropTypes.array,
  handleTurma: PropTypes.func,
  prep: PropTypes.object,
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
    inputData = inputData.filter((alunosTurma) => {
      if (promo_ano_anterior.includes('')) {
        if (alunosTurma.promo_ano_anterior == undefined) {
          return alunosTurma
        }
      } 
      return promo_ano_anterior.includes(alunosTurma.promo_ano_anterior);
    }
    )
  }

  return inputData;
}
