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
import { ConfirmDialog } from 'src/components/custom-dialog';
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
import AlunoTableFiltersResult from '../aluno-table-filters-result';
import alunoMethods from '../aluno-repository';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import LoadingBox from 'src/components/helpers/loading-box';
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

  // let turmaFiltro = sessionStorage.getItem('filtroTurmaId') ? [sessionStorage.getItem('filtroTurmaId')] : [];


  const defaultFilters = {
    nome: '',
    matricula: '',
    escola: [],
    turma: [],
    fase: []
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

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const buscaAlunos = useCallback(async (pagina=0, linhasPorPagina=25, oldAlunoList=[], filtros=filters) => {
    setWarningMsg('');
    setErrorMsg('');
    contextReady.onFalse();
    const offset = (pagina)*linhasPorPagina;
    const limit = linhasPorPagina;
    const {nome, matricula, escola, turma, fase} = filtros;
    
    await alunoMethods.getAllAlunos({offset, limit, nome, turmas: turma, escolas: escola, matricula, fase}).then(async alunos => {
      if (alunos.data.count == 0) {
        setWarningMsg('A API retornou uma lista vazia de estudantes');
        contextReady.onTrue();
      } else {
        const listaAlunos = alunos.data.results;
        setAlunoList([...oldAlunoList, ...listaAlunos]);
        setTableData([...oldAlunoList, ...listaAlunos]);
        contextReady.onTrue();
      }
      setCountAlunos(alunos.data.count);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de estudantes');
      console.log(error);
      contextReady.onTrue();
    });
  }, [contextReady, filters]);

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
      })
    ]);
    contextReady.onTrue();
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas, buscaAlunos, contextReady, table.page, table.rowsPerPage]);

  const onChangePage = async (event, newPage) => {
    if (alunoList.length < (newPage+1)*table.rowsPerPage) {
      buscaAlunos(newPage, table.rowsPerPage, alunoList);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback((event) => {
    table.setPage(0);
    table.setRowsPerPage(parseInt(event.target.value, 10));
    setAlunoList([]);
    setTableData([]);
    buscaAlunos(0, event.target.value);
  }, [buscaAlunos, table]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleFilters = useCallback(
    async (nome, value) => {
      table.onResetPage();
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
      setFilters(novosFiltros);
      setTableData([]);
      setAlunoList([]);
      buscaAlunos(table.page, table.rowsPerPage, [], novosFiltros);
    },
    [table, filters, buscaAlunos]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      alunoMethods.deleteAlunoById(id).then(retorno => {
        setTableData(deleteRow);
        buscaTurmas({force: true});
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de estudantes no momento da exclusão do estudante');
        console.log(error);
      });

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData, buscaTurmas]
  );

  const handleDeleteRows = useCallback(() => {
    const remainingRows = [];
    const promises = [];
    tableData.map((row) => {
      if(table.selected.includes(row.id)) {
        const newPromise = alunoMethods.deleteAlunoById(row.id).catch((error) => {
          remainingRows.push(row);
          setErrorMsg('Erro de comunicação com a API de estudantes no momento da exclusão do estudante');
          console.log(error);
          throw error;
        });
        promises.push(newPromise)
      } else {
        remainingRows.push(row);
      }
    });
    Promise.all(promises).then(
      retorno => {
        buscaTurmas({force: true});
        setTableData(remainingRows);
      }
    )

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: tableData.length,
    });
  }, [dataInPage.length, table, tableData, buscaTurmas]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.aluno.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      nome: '',
      matricula: '',
      escola: [],
      turma: [],
      fase: []
    };
    setTableData([]);
    setAlunoList([]);
    setFilters(resetFilters);
    buscaAlunos(table.page, table.rowsPerPage);

  }, [buscaAlunos, table.page, table.rowsPerPage]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Listar"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Estudantes', href: paths.dashboard.aluno.root },
            { name: 'Listar' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.aluno.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Adicionar
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

        <Card>

          <AlunoTableToolbar
            filters={filters}
            onFilters={handleFilters}
            escolaOptions={escolas}
            turmaOptions={turmas}
            faseOptions={fases}
          />

          {canReset && (
            <AlunoTableFiltersResult
              filters={filters}
              escolaOptions={escolas}
              turmaOptions={turmas}
              faseOptions={fases}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={countAlunos}
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
            {!contextReady.value ? (
                <LoadingBox />) : (
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
            count={countAlunos}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Tem certeza que deseja excluir <strong> {table.selected.length} </strong> estudantes?
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
