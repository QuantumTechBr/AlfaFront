'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useMemo } from 'react';
import '../style.css';
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
import AvaliacaoDiagnosticoNewEditTableRow from './avaliacao-diagnostico-new-edit-table-row';
import AvaliacaoDiagnosticoNewEditTableToolbar from './avaliacao-diagnostico-new-edit-table-toolbar';
import InfoIcon from '@mui/icons-material/Info';
import { Box } from '@mui/material';
import AvaliacaoDiagnosticoNewEditTableFiltersResult from './avaliacao-diagnostico-new-edit-table-filters-result';
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
import avaliacaoMethods from 'src/sections/avaliacao/avaliacao-repository';
import { TipoVersaoAvaliacao } from 'src/sections/avaliacao/enums';
import { t } from 'i18next';

// ----------------------------------------------------------------------
export default function AvaliacaoDiagnosticoNewEditTable({ turma, periodo, alunosTurma, habilidades, versaoAvaliacao, handleTurma, prep }) {
  const defaultFilters = useMemo(() => {
    return {
      nome: '',
      frequencia: [],
    };
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
  const [errorMsg, setErrorMsg] = useState('');

  const values = watch();
  const labelHabilidade = (hab, i) => {
    // <br></br>;
    return (
      <Box>
        {`R${i}`}
        {hab?.descricao && (
          <Tooltip
            title={
              <React.Fragment>
                <Typography color="inherit">{hab?.nome + ' - ' + hab?.descricao}</Typography>
              </React.Fragment>
            }
          >
            <InfoIcon
              sx={{
                fontSize: 'large',
              }}
            />
          </Tooltip>
        )}
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
    if (!prep.value) return;
    let descritivoLP = 'Nível escrita - LP';
    let descritivoMAT = 'Nível Resolução de problemas - MAT';
    const cabecalho = [
      { id: 'matricula', label: 'Matrícula', width: 150 },
      { id: 'nome', label: 'Nome', width: 150 },
      { id: 'frequencia', label: 'Frequência', width: 200 },
    ];
    if (versaoAvaliacao?.questoes) {
      const questoes = versaoAvaliacao.questoes;
      let numUltimaQuestoesPt = 0;
      let numUltimaQuestoesMat = 0;
      for (const questao of questoes) {
        cabecalho.push({
          id: `R${questao.numero_questao}`,
          label: labelHabilidade(questao.habilidade, questao.numero_questao),
          // label: `R${questao.numero_questao}`,
          width: 50,
        });
        if (questao.disciplina.nome == 'Língua Portuguesa') {
          numUltimaQuestoesPt =
            questao.numero_questao > numUltimaQuestoesPt
              ? questao.numero_questao
              : numUltimaQuestoesPt;
        } else if (questao.disciplina.nome == 'Matemática') {
          numUltimaQuestoesMat =
            questao.numero_questao > numUltimaQuestoesMat
              ? questao.numero_questao
              : numUltimaQuestoesMat;
        }
      }
      if (numUltimaQuestoesPt > 0) {
        descritivoLP += ` (resultado do item ${numUltimaQuestoesPt})`;
      }
      if (numUltimaQuestoesMat > 0) {
        descritivoMAT += ` (resultado do item ${numUltimaQuestoesMat})`;
      }
    }
    cabecalho.push({ id: 'nvLP', label: 'FASE ALFABÉTICA', width: 50 });
    cabecalho.push({ id: 'nvMAT', label: 'LETRAMENTO MATEMÁTICO', width: 50 });
    setTableHead(cabecalho);
    setTableData(alunosTurma == undefined ? [] : alunosTurma);
  }, [habilidades, alunosTurma, versaoAvaliacao]);

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
    <Card>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <AvaliacaoDiagnosticoNewEditTableToolbar
        filters={filters}
        onFilters={handleFilters}
        anoLetivoOptions={anosLetivos}
        escolaOptions={escolas}
        freqOptions={frequencia_options}
        turma={turma}
        handleTurma={handleTurma}
        nomeArquivo={csvFileName}
        dataArquivo={csvData}
        />


          {canReset && (
            <AvaliacaoDiagnosticoNewEditTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              freqOptions={frequencia_options}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar
              sx={{
                '& .simplebar-scrollbar': {
                  backgroundColor: '#D3D3D3',
                  borderRadius: 10,
                },
                maxHeight: 800,
              }}
            >
              {!preparado.value ? (
                <LoadingBox />
              ) : (
                <>
                  {!versaoAvaliacao ? (
                    <Container sx={{ py: 2 }}>
                      <Typography variant="h5" gutterBottom>
                        Não foi possível carregar a versão da avaliação para esta turma. Verifique com o suporte se a versão de avaliação foi criada corretamente.
                      </Typography>
                    </Container>
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
                          <AvaliacaoDiagnosticoNewEditTableRow
                            key={row.id}
                            row={row}
                            habilidades={habilidades}
                            periodo={periodo}
                            turma={turma}
                            versaoAvaliacao={versaoAvaliacao}
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
                </>
              )}
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            rowsPerPageOptions={[5, 15, 25]}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}

          />
      
    </Card>
  );
}

AvaliacaoDiagnosticoNewEditTable.propTypes = {
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
