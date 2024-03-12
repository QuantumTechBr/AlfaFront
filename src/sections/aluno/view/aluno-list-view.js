'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
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

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// _mock
import { RegistroAprendizagemFasesCRUD } from 'src/_mock';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
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
import AlunoTableRow from '../aluno-table-row';
import AlunoTableToolbar from '../aluno-table-toolbar';

import alunoMethods from '../aluno-repository';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import LoadingBox from 'src/components/helpers/loading-box';
import { useAuthContext } from 'src/auth/hooks';
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Todos' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'nome', label: 'Estudante', width: 300 },
  { id: 'matricula', label: 'Matrícula', width: 200 },
  { id: 'ano', label: 'Ano', width: 200, notsortable: true },
  { id: 'turma', label: 'Turma', width: 200, notsortable: true },
  { id: 'turno', label: 'Turno', width: 200, notsortable: true },
  { id: 'escola', label: 'Escola', width: 200, notsortable: true },
  { id: 'fase', label: 'Fase', width: 200, notsortable: true },
  { id: 'data_nascimento', label: 'Data de Nascimento', width: 100, notsortable: true },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export default function AlunoListView() {
  const { checkPermissaoModulo } = useAuthContext();
  // let turmaFiltro = sessionStorage.getItem('filtroTurmaId') ? [sessionStorage.getItem('filtroTurmaId')] : [];

  const defaultFilters = {
    nome: '',
    matricula: '',
    escola: [],
    turma: [],
    fase: [],
  };

  const fases = Object.values(RegistroAprendizagemFasesCRUD);

  const [alunoList, setAlunoList] = useState([]);
  const [countAlunos, setCountAlunos] = useState(0);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const contextReady = useBoolean(false);

  const permissaoCadastrar = checkPermissaoModulo('aluno', 'cadastrar');

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const buscaAlunos = useCallback(
    async (pagina = 0, linhasPorPagina = 25, oldAlunoList = [], filtros = filters) => {
      setWarningMsg('');
      setErrorMsg('');
      contextReady.onFalse();
      const offset = pagina * linhasPorPagina;
      const limit = linhasPorPagina;
      const { nome, matricula, escola, turma, fase } = filtros;

      await alunoMethods
        .getAllAlunos({ offset, limit, nome, turmas: turma, escolas: escola, matricula, fase })
        .then(async (alunos) => {
          if (alunos.data.count == 0) {
            setWarningMsg('A API retornou uma lista vazia de estudantes');
            contextReady.onTrue();
          } else {
            const listaAlunos = alunos.data.results;
            listaAlunos.map((aluno) => {
              aluno.necessidades_especiais = aluno.necessidades_especiais
                ? JSON.parse(aluno.necessidades_especiais)
                : '';
            });
            setAlunoList([...oldAlunoList, ...listaAlunos]);
            setTableData([...oldAlunoList, ...listaAlunos]);
            contextReady.onTrue();
          }
          setCountAlunos(alunos.data.count);
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de estudantes');
          console.log(error);
          contextReady.onTrue();
        });
    },
    [contextReady, filters]
  );

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
      buscaAlunos(table.page, table.rowsPerPage).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de estudantes');
        console.log(error);
      }),
    ]);
    contextReady.onTrue();
  }, [
    buscaAnosLetivos,
    buscaEscolas,
    buscaTurmas,
    buscaAlunos,
    contextReady,
    table.page,
    table.rowsPerPage,
  ]);

  const onChangePage = async (event, newPage) => {
    if (alunoList.length < (newPage + 1) * table.rowsPerPage) {
      buscaAlunos(newPage, table.rowsPerPage, alunoList);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback(
    (event) => {
      table.setPage(0);
      table.setRowsPerPage(parseInt(event.target.value, 10));
      setAlunoList([]);
      setTableData([]);
      buscaAlunos(0, event.target.value);
    },
    [buscaAlunos, table]
  );

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !tableData.length;

  const handleFilters = useCallback(
    async (nome, value) => {
      table.onResetPage();
      const novosFiltros = {
        ...filters,
        [nome]: value,
      };
      setFilters(novosFiltros);
    },
    [table, filters]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      alunoMethods
        .deleteAlunoById(id)
        .then((retorno) => {
          setTableData(deleteRow);
          buscaTurmas({ force: true });
        })
        .catch((error) => {
          setErrorMsg(
            'Erro de comunicação com a API de estudantes no momento da exclusão do estudante'
          );
          console.log(error);
        });

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData, buscaTurmas]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.aluno.edit(id));
    },
    [router]
  );

  const handleSaveRow = useCallback(
    (novosDados) => {
      const _tableData = tableData.map((item) => {
        if (item.id === novosDados.id) {
          return { ...item, ...novosDados };
        }
        return item;
      });
      setTableData(_tableData);
    },
    [tableData]
  );

  return (
    <>
      <Container maxWidth="xxl">
        <CustomBreadcrumbs
          heading="Listar"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Estudantes', href: paths.dashboard.aluno.root },
            { name: 'Listar' },
          ]}
          action={
            permissaoCadastrar && (
              <Button
                component={RouterLink}
                href={paths.dashboard.aluno.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{
                  bgcolor: '#00A5AD',
                }}
              >
                Adicionar
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

        <Card>
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
            <AlunoTableToolbar
              filters={filters}
              onFilters={handleFilters}
              escolaOptions={escolas}
              turmaOptions={turmas}
              faseOptions={fases}
            />
            <Button
              variant="contained"
              sx={{
                width: {
                  xs: '100%',
                  md: '15%',
                },
              }}
              onClick={() => {
                contextReady.onFalse();
                setTableData([]);
                setAlunoList([]);
                buscaAlunos(table.page, table.rowsPerPage, [], filters);
              }}
            >
              Aplicar filtros
            </Button>
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              {!contextReady.value ? (
                <LoadingBox texto="Buscando estudantes" />
              ) : (
                <Table size="small" sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
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
                        <AlunoTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onSaveRow={(novosDados) => handleSaveRow(novosDados)}
                        />
                      ))}

                    <TableEmptyRows
                      height={52}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              )}
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={countAlunos}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { nome, matricula, escola, turma, fase } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (aluno) => aluno.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (matricula) {
    inputData = inputData.filter(
      (aluno) => aluno.matricula.toLowerCase().indexOf(matricula.toLowerCase()) !== -1
    );
  }

  if (escola.length) {
    inputData = inputData.filter((aluno) => escola.includes(aluno.escola.id));
  }

  if (turma?.length) {
    inputData = inputData.filter((aluno) => turma.includes(aluno.turma.id));
  }

  if (fase.length) {
    inputData = inputData.filter((aluno) => fase.includes(aluno.fase.toLowerCase()));
  }

  return inputData;
}
