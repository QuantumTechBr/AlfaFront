'use client';

import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

//
import AlunoTableRow from '../aluno-table-row';
import AlunoTableToolbar from '../aluno-table-toolbar';

import alunoMethods from '../aluno-repository';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';

import LoadingBox from 'src/components/helpers/loading-box';
import { useAuthContext } from 'src/auth/hooks';
import AlunoQuickEditForm from '../aluno-quick-edit-form';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Estudante', notsortable: true },
  { id: 'matricula', label: 'Matrícula', width: 200, notsortable: true },
  { id: 'escola', label: 'Escola', width: 200, notsortable: true },
  { id: 'ano', label: 'Ano-Turma', width: 200, notsortable: true },
  { id: 'turno', label: 'Turno', width: 200, notsortable: true },
  { id: 'fase', label: 'Fase', width: 200, notsortable: true },
  { id: 'data_nascimento', label: 'Data de Nascimento', width: 100, notsortable: true },
  { id: '', width: 88 },
];

const defaultFilters = {
  nome: '',
  matricula: '',
  escola: [],
  turma: [],
  fase: [],
};

// ----------------------------------------------------------------------

export default function AlunoListView() {
  const { checkPermissaoModulo } = useAuthContext();

  const fases = Object.values(RegistroAprendizagemFasesCRUD);

  const [countAlunos, setCountAlunos] = useState(0);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const contextReady = useBoolean(false);

  const permissaoCadastrar = checkPermissaoModulo('aluno', 'cadastrar');

  const table = useTable();

  const router = useRouter();

  const quickEdit = useBoolean();
  const [rowToEdit, setRowToEdit] = useState();
  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const closeUploadModal = () => {
    setOpenUploadModal(false);
  }

  const handleFileUpload = (event) => {
    setUploadedFile(event.target.files[0]);
  }

  const modalStyle = {
    position: 'absolute',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  const buscaAlunos = useCallback(
    async (pagina = 0, linhasPorPagina = 25, oldAlunoList = [], filtros = filters) => {
      contextReady.onFalse();
      setWarningMsg('');
      setErrorMsg('');
      const offset = pagina * linhasPorPagina;
      const limit = linhasPorPagina;
      const { nome, matricula, escola, turma, fase } = filtros;

      await alunoMethods
        .getAllAlunos({ offset, limit, nome, turmas: turma, escolas: escola, matricula, fase })
        .then(async (alunos) => {
          if (alunos.data.count == 0) {
            setWarningMsg('A API retornou uma lista vazia de estudantes');
            setTableData([]);
            contextReady.onTrue();
          } else {
            const listaAlunos = alunos.data.results;
            listaAlunos.map((aluno) => {
              aluno.necessidades_especiais = aluno.necessidades_especiais
                ? JSON.parse(aluno.necessidades_especiais)
                : '';
            });
            setTableData([...oldAlunoList, ...listaAlunos]);
          }
          setCountAlunos(alunos.data.count);
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de estudantes');
          console.log(error);
        });
      contextReady.onTrue();
    },
    [contextReady, filters]
  );

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
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
  }, [buscaEscolas, buscaTurmas, buscaAlunos, contextReady, table.page, table.rowsPerPage]);

  const onChangePage = async (event, newPage) => {
    if (tableData.length < (newPage + 1) * table.rowsPerPage) {
      buscaAlunos(newPage, table.rowsPerPage, tableData);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback(
    (event) => {
      table.setPage(0);
      table.setRowsPerPage(parseInt(event.target.value, 10));
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

  const notFound = tableData.length == 0;

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
          // setTableData(deleteRow);
          buscaTurmas({ force: true });
          contextReady.onFalse();
          // buscando.onFalse(),
          // tabelaPreparada.onFalse(),
          setTableData([]);
          setTimeout(preparacaoInicial, 1000);
        })
        .catch((error) => {
          setErrorMsg(
            'Erro de comunicação com a API de estudantes no momento da exclusão do estudante'
          );
          console.log(error);
        });
      
      // table.onUpdatePageDeleteRow(dataInPage.length);
      // setCountAlunos(countAlunos - 1)
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

  const saveAndClose = (retorno = null) => {
    handleSaveRow({ ...rowToEdit, ...retorno });
    quickEdit.onFalse();
  };

  const uploadAlunos = async () => {
    try {
      const formData = new FormData();
      formData.append('arquivo', uploadedFile);

      const response = await alunoMethods.importFileAlunos(formData);

      if (response.ok) {
        // File uploaded successfully
        console.log('File uploaded successfully');
      } else {
        // Error uploading file
        console.error('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

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
          youtubeLink="https://www.youtube.com/embed/pegGQtw2af4?si=7Dw3taXWlksbw6sa"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {/* {permissaoCadastrar && (
            <Button
              onClick={() => setOpenUploadModal(true)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: '#EE6C4D',
              }}
            >
              Import
            </Button>
          )} */}

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
              turmaOptions={
                filters.escola.length > 0
                  ? turmas.filter((_turma) => filters.escola.includes(_turma.escola_id))
                  : null
              }
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
                table.setPage(0);
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
                  />

                  <TableBody>
                    {dataInPage.map((row) => (
                      <AlunoTableRow
                        key={row.id}
                        row={row}
                        quickEdit={() => {
                          quickEdit.onTrue();
                          setRowToEdit(row);
                        }}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))}

                    <TableEmptyRows
                      height={49}
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
        <Modal open={openUploadModal} onClose={closeUploadModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6">Upload File</Typography>
            <input type="file" 
              onChange={handleFileUpload} 
            />
            <Button variant="contained" onClick={uploadAlunos}>Upload</Button>
          </Box>
        </Modal>
      </Container>

      {checkPermissaoModulo('aluno', 'editar') && (
        <AlunoQuickEditForm
          row={rowToEdit}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onSave={saveAndClose}
        />
      )}
    </>
  );
}
