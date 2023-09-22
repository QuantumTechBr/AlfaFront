'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useContext } from 'react';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import RegistroAprendizagemFaseTableRow from './registro-aprendizagem-fase-table-row';
import RegistroAprendizagemTableToolbar from '../registro-aprendizagem-table-toolbar';
import RegistroAprendizagemTableFiltersResult from '../registro-aprendizagem-table-filters-result';
import NovaAvaliacaoForm from 'src/sections/registro_aprendizagem/registro-aprendizagem-modal-form';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ano_letivo', label: 'Ano Letivo', width: 75 },
  { id: 'ano_escolar', label: 'Ano Escolar', width: 75 },
  { id: 'turma', label: 'Turma', width: 75 },
  { id: 'turno', label: 'Turno', width: 105 },
  { id: 'alunos', label: 'Alunos', width: 80 },
  { id: 'bimestre', label: 'Bimestre', width: 80 },
  { id: 'escola', label: 'Escola' },
  { id: '', width: 72 },
];

const defaultFilters = {
  anoLetivo: '',
  escola: [],
  turma: [],
  bimestre: [],
};

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseListView() {
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);

  const [_turmasFiltered, setTurmasFiltered] = useState([]);
  const preparado = useBoolean(false);

  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const preparacaoInicial = async () => {
    preencheTabela();
    await Promise.all([
      buscaAnosLetivos(),
      buscaEscolas(),
      buscaTurmas().then((_turmas) => setTurmasFiltered(_turmas)),
      buscaBimestres(),
    ]);
  };

  const preencheTabela = () => {
    if (!preparado.value && anosLetivos.length && turmas.length && bimestres.length) {
      let _registrosAprendizagemFase = [];

      turmas.forEach((_turma) => {
        console.log(_turma);
        bimestres.forEach((_bimestre) => {
          _registrosAprendizagemFase.push({
            id: _turma.id,
            ano_letivo: _turma.ano.ano,
            ano_escolar: _turma.ano_escolar,
            nome: _turma.nome,
            turno: _turma.turno,
            alunos: _turma.aluno_turma.length,
            bimestre: _bimestre,
            escola: _turma.escola.nome,
          });
        });
      });

      setTableData(_registrosAprendizagemFase);
      preparado.onTrue();
    }
  };

  useEffect(() => {
    console.log('useEffect FASE LIST VIEW');
    preparacaoInicial();
  }, [setTableData]); // CHAMADA UNICA AO ABRIR
  useEffect(() => {
    console.log('useEffect preencheTabela');
    preencheTabela();
  }, [anosLetivos, turmas, bimestres]); // CHAMADA SEMPRE QUE ESTES MUDAREM

 
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
    [table]
  );

  const handleEditRow = useCallback(
    (turmaInicial, bimestreInicial) => {
      router.push(paths.dashboard.registro_aprendizagem.edit_fase(turmaInicial, bimestreInicial));
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
          <Typography variant="h4">
            Avaliação de Fases do Desenvolvimento da Leitura e da Escrita
          </Typography>
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
            escolaOptions={escolas}
            turmaOptions={_turmasFiltered}
            bimestreOptions={bimestres}
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
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <RegistroAprendizagemFaseTableRow
                        key={`RegistroAprendizagemFaseTableRow_${row.id}_${row.bimestre.id}`}
                        row={row}
                        onEditRow={() => handleEditRow(row.id, row.bimestre.id)}
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
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { nome, anoLetivo, escola, turma, bimestre } = filters;
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
      escola.map((baseItem) => baseItem.nome).includes(item.escola)
    );
  }

  if (turma.length) {
    inputData = inputData.filter((item) => {
      return turma
        .map((baseItem) => {
          console.log( `${baseItem.ano_escolar}${baseItem.nome}`);
          console.log(`${item.ano_escolar}${item.nome}`);
          return `${baseItem.ano_escolar}${baseItem.nome}`;
        })
        .includes(`${item.ano_escolar}${item.nome}`);
    });
  }

  if (bimestre.length) {
    inputData = inputData.filter((item) => {
      console.log(bimestre);
      console.log(item.bimestre);
      return bimestre.includes(item.bimestre);
    });
  }

  if (nome) {
    inputData = inputData.filter(
      (item) => item.escola.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  return inputData;
}
