'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useMemo } from 'react';
import '../../form/style.css';
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
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { useContext } from 'react';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import zIndex from '@mui/material/styles/zIndex';
import { CSVLink } from "react-csv";
import { useFormContext } from 'react-hook-form';

// ----------------------------------------------------------------------
export default function RegistroAprendizagemDiagnosticoNewEditTable({ turma, periodo, alunosTurma, habilidades, handleTurma, prep }) {
  const defaultFilters = useMemo(() => {
    return {
      nome: '',
      frequencia: [],
    }
  }, []);

  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const theme = useTheme();
  const [TABLE_HEAD, setTableHead] = useState([]);
  const [tableData, setTableData] = useState([]);
  const preparado = prep;
  const { getValues, watch } = useFormContext();
  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');

  const values = watch();
  const labelHabilidade = (hab, i) => {
    const list_retorno = [];
    list_retorno.push(`- ${hab[0].nome}: `);
    list_retorno.push(` ${hab[0].descricao}\n`);
    list_retorno.push(`- ${hab[1].nome}: `);
    list_retorno.push(` ${hab[1].descricao} `);
    // const nome_1 = habilidades[0].nome;
    // const descricao_1 = habilidades[0].descricao;
    // const nome_2 = habilidades[1].nome;
    // const descricao_2 = habilidades[1].descricao;
    // ''.concat(...list_retorno)]
    <br></br>
    return (
      <Box>
        {`R${i}`}
        <Tooltip
          title={
            // ''.concat(...list_retorno)
            <React.Fragment>
              <Typography color="inherit">Tooltip with HTML</Typography>
              <em>"And here's"</em> <b>'some'</b> <u>'amazing content'</u>.' '
              "It's very engaging. Right?"
            </React.Fragment>
          }
        >
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
    buscaAnosLetivos().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de anos letivos');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
  }, []);

  useEffect(() => {
    let descritivoLP = "Nível escrita - LP (resultado"
    let descritivoMAT = "Nível Resolução de problemas - MAT (resultado"
    switch (turma.ano_escolar) {
      case '1':
        descritivoLP += " do item 10)"
        descritivoMAT += " do item 20)"
        break;
      case '2':
        descritivoLP += " dos itens 9 e 10)"
        descritivoMAT += " dos itens 19 e 20)"
        break;
      case '3':
        descritivoLP += " dos itens 8, 9 e 10)"
        descritivoMAT += " dos itens 18, 19 e 20)"
        break;
      default:
        descritivoLP += " do item 10)"
        descritivoMAT += " do item 20)"
        break;
    }
    const cabecalho = [
      { id: 'matricula', label: 'Matrícula', width: 150 },
      { id: 'nome', label: 'Nome', width: 150 },
      { id: 'frequencia', label: 'Frequência', width: 200 },
    ];
    for (var i = 1; i < 21; i++) {
      cabecalho.push({ id: `R${i}`, label: habilidades.length > 0 ? labelHabilidade(habilidades, i) : `R${i}`, width: 50 });
    }
    cabecalho.push({ id: 'mediaLP', label: 'MÉDIA LP', width: 70 });
    cabecalho.push({ id: 'nvEscrita', label: descritivoLP, width: 200, minWidth: 200 });
    cabecalho.push({ id: 'nvLP', label: 'NÍVEL_LP', width: 50 });
    cabecalho.push({ id: 'mediaMAT', label: 'MÉDIA MAT', width: 70 });
    cabecalho.push({ id: 'nvResolucao', label: descritivoMAT, width: 200, minWidth: 200 });
    cabecalho.push({ id: 'nvMAT', label: 'NÍVEL_MAT', width: 50 });
    cabecalho.push({ id: 'mediaFinal', label: 'Média Final', width: 50 });
    cabecalho.push({ id: 'nivelFinal', label: 'NÍVEL FINAL', width: 50 });
    setTableHead(cabecalho);
    setTableData((alunosTurma == undefined) ? [] : alunosTurma);
  }, [habilidades, alunosTurma]);

  useEffect(() => {
    setCsvData(getValues('csvData'));
    setCsvFileName(getValues('csvFileName'));
  }, [values]);

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
          anoLetivoOptions={anosLetivos}
          escolaOptions={escolas}
          freqOptions={frequencia_options}
          turma={turma}
          handleTurma={handleTurma}
        />

        {canReset && (
          <RegistroAprendizagemDiagnosticoNewEditTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            freqOptions={frequencia_options}
            results={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        {csvData?.length > 0 && <CSVLink className='downloadCVSBtn' filename={csvFileName} data={csvData} >
          Exportar para CSV
        </CSVLink>}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }} >
          <Scrollbar sx={{
            "& .simplebar-scrollbar": {
              "backgroundColor": "#D3D3D3",
              'borderRadius': 10,
            },
            maxHeight: 800,
          }}>
            {!preparado.value ? (
              <LoadingBox />
            ) : (
              <Table stickyHeader size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                        turma={turma}
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
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          rowsPerPageOptions={[5, 15, 25]}
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
  const { nome, frequencia } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (alunosTurma) => alunosTurma.aluno.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1 || alunosTurma.aluno.matricula.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (frequencia.length) {
    inputData = inputData.filter((alunosTurma) => {
      if (frequencia.includes('')) {
        if (alunosTurma.frequencia == undefined) {
          return alunosTurma
        }
      }
      return frequencia.includes(alunosTurma.frequencia);
    }
    )
  }

  return inputData;
}
