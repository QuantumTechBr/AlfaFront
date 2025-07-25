'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useContext } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import ImportHelperButton from 'src/components/helpers/import-helper-button';
//
import TurmaTableRow from '../turma-table-row';
import TurmaTableToolbar from '../turma-table-toolbar';
import TurmaTableFiltersResult from '../turma-table-filters-result';
//
import { AuthContext } from 'src/auth/context/alfa';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import turmaMethods from 'src/sections/turma/turma-repository';
import LoadingBox from 'src/components/helpers/loading-box';
import { useAuthContext } from 'src/auth/hooks';
import TurmaQuickEditForm from '../turma-quick-edit-form';
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Todos' }, ...USER_STATUS_OPTIONS];

const defaultFilters = {
  ano: '',
  nome: '',
  ddz: [],
  escola: [],
  status: 'all',
};

// ----------------------------------------------------------------------

// TODO quando limpa os filtros não está atualizando o contador de ativos e inativos
export default function TurmaListView() {
  const { checkPermissaoModulo } = useAuthContext();
  const { buscaTurmas, buscaTurmasPaginado } = useContext(TurmasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const [countTurmas, setCountTurmas] = useState(0);
  const [countAtivos, setCountAtivos] = useState(0);
  const [countInativos, setCountInativos] = useState(0);
  const [countAll, setCountAll] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);

  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();

  const contextReady = useBoolean(false);

  const permissaoCadastrar = checkPermissaoModulo('turma', 'cadastrar');
  const permissaoSuperAdmin = checkPermissaoModulo('superadmin', 'upload');

  const table = useTable({defaultRowsPerPage: 25});

  const settings = useSettingsContext();

  const router = useRouter();

  const quickEdit = useBoolean();
  const [rowToEdit, setRowToEdit] = useState();

  
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

  const TABLE_HEAD = [
    ...(escolas.length > 1 ? [{ id: 'escola', label: 'Escola', width: 300 }] : []),
    { id: 'ano_serie', label: 'Ano', width: 300 },
    { id: 'nome', label: 'Turma', width: 200 },
    { id: 'turno', label: 'Turno', width: 200 },
    { id: 'ano_escolar', label: 'Ano Letivo', width: 300 },
    { id: 'alunos', label: 'Estudantes', width: 200 },
    { id: 'status', label: 'Status', width: 200 },
    { id: '', width: 88 },
  ];

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const uploadTurmas = async () => {
    try {
      const formData = new FormData();
      formData.append('arquivo', uploadedFile);

      closeUploadModal();

      setWarningMsg('Enviando arquivo. Por favor, aguarde... ' +
        'O processo de importação pode demorar alguns minutos e até mesmo horas dependendo do número de registros a serem validados. ' +
        'Você pode acompanhar o status do processo pela página Importações. Por favor, evite iniciar vários processos de importação simultaneamente. ' +
        'Isso pode gerar lentidão no sistema e até mesmo inconsistência de dados.'
      );

      const response = await turmaMethods.importFileTurmas(formData);

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


  const buscarTurmas = useCallback(
    async (pagina = 0, linhasPorPagina = 25, oldTurmaList = [], filtros = filters) => {
      contextReady.onFalse();
      setWarningMsg('');
      setErrorMsg('');
      const offset = pagina * linhasPorPagina;
      const limit = linhasPorPagina;
      let escola = [];
      if (filtros.escola.length > 0) {
        filtros.escola.map((esc) => {
          escola.push(esc.id)
        })
      }
      let { ano, nome, ddz, status } = filtros;
      let statusFilter = '';


      switch (status) {
        case 'false':
          statusFilter = 'False';
          break;
        case 'true':
          statusFilter = 'True';
      }


      await buscaTurmasPaginado({
        args: { offset, limit, ano, nome, ddzs: ddz, escolas: escola, status: statusFilter },
      })
        .then(async (resultado) => {
          if (resultado.count == 0) {
            setWarningMsg('A API retornou uma lista vazia de turmas');
            setTableData([]);
          } else {
            const listaTurmas = resultado.results;
            listaTurmas.map((turma) => {
              turma.status = turma.status.toString();
            });
            setTableData([...oldTurmaList, ...listaTurmas]);
          }
          setCountTurmas(resultado.count);
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de turmas');
          console.log(error);
        });
      contextReady.onTrue();
      let _countAll = 0;

      await buscaTurmasPaginado({
        args: { offset, limit, ano, nome, ddzs: ddz, escolas: escola, status: 'True' },
        // clear
      }).then(async (resultado) => {
        setCountAtivos(resultado.count);
        _countAll += resultado.count;
      });

      await buscaTurmasPaginado({
        args: { offset, limit, ano, nome, ddzs: ddz, escolas: escola, status: 'False' },
      }).then(async (resultado) => {
        setCountInativos(resultado.count);
        _countAll += resultado.count;
      });

      setCountAll(_countAll);
    },
    [contextReady, filters]
  );

  // const contarTurmas = useCallback(
  //   async (filtros = filters, clear=false) => {
  //     const offset = 0;
  //     const limit = 1;
  //     const escola = [];
  //     if (filtros.escola.length > 0) {
  //       filtros.escola.map((esc) => {
  //         escola.push(esc.id)
  //       })
  //     }
  //     const { nome, ddz, status } = filtros;

  //     let _countAll = 0;

  //     await buscaTurmasPaginado({
  //       args: { offset, limit, nome, ddzs: ddz, escolas: escola, status: 'True' },
  //       clear
  //     }).then(async (resultado) => {
  //       setCountAtivos(resultado.count);
  //       _countAll += resultado.count;
  //     });

  //     await buscaTurmasPaginado({
  //       args: { offset, limit, nome, ddzs: ddz, escolas: escola, status: 'False' },
  //     }).then(async (resultado) => {
  //       setCountInativos(resultado.count);
  //       _countAll += resultado.count;
  //     });

  //     setCountAll(_countAll);
  //   },
  //   [filters]
  // );

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaZonas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
      buscaEscolas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
      buscaAnosLetivos().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
    ]);
    contextReady.onTrue();
  }, [buscaAnosLetivos, buscaEscolas, buscarTurmas, contextReady, table.page, table.rowsPerPage]);

  const onChangePage = async (event, newPage) => {
    if (tableData.length < (newPage + 1) * table.rowsPerPage) {
      buscarTurmas(newPage, table.rowsPerPage, tableData);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback(
    (event) => {
      table.setPage(0);
      table.setRowsPerPage(parseInt(event.target.value, 10));
      setTableData([]);
      buscarTurmas(0, event.target.value);
    },
    [buscarTurmas, table]
  );

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    if (anosLetivos.length > 0) {
      anosLetivos.map((ano)=>{
        if (ano.ano == anoAtual) {
          const novosFiltros = filters;
          novosFiltros.ano = ano.id;
          setFilters(novosFiltros);
        }
      })
    }
  }, [anosLetivos]);

  useEffect( () => {
    buscarTurmas(table.page, table.rowsPerPage).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de turmas');
      console.log(error);
    });
    // contarTurmas();
 }, [escolas]);



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

  const handleDeleteRow = useCallback (
    async (id) => {
      const row = tableData.filter((row) => row.id == id);
      const deleteRow = tableData.filter((row) => row.id !== id);
      turmaMethods
        .deleteTurmaById(id)
        .then((retorno) => {
          // setTableData(deleteRow);
          // contarTurmas(filters, true);
          buscarTurmas();
          buscaTurmas({ force: true });
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de turmas no momento da exclusão da turma');
        });

      table.onUpdatePageDeleteRow(dataInPage.length);
      
    },
    [dataInPage.length, table, tableData, buscarTurmas]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.turma.edit(id));
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
    // CONTEXT - ATUALIZA GERAL DO SISTEMA
    buscaTurmas({ force: true });
  };

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
      const filtrosNovos = { ...filters };
      filtrosNovos.status = newValue;
      buscarTurmas(table.page, table.rowsPerPage, [], filtrosNovos);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Turmas"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Turmas', href: paths.dashboard.turma.root },
            { name: 'Listar' },
          ]}
          action={
            permissaoCadastrar && (
              <Button
                component={RouterLink}
                href={paths.dashboard.turma.new}
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
          youtubeLink="https://www.youtube.com/embed/CbvIlF82Ogc?si=vCt_nMPhbfpKiJu4&cc_load_policy=1"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
         {permissaoSuperAdmin && (
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              onClick={() => setOpenUploadModal(true)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: '#EE6C4D',
                marginBottom: "1em"
              }}
            >
              Importar Turmas
            </Button>
            <ImportHelperButton 
            ordemImportacao='escola -> turma'
            nomeTela='TURMAS'
            linkDownload={'/modelos-de-importacao/modelo-importacao-turma.csv'}
            />
          </Box>

        )}


        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'true' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'false' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && countAll}
                    {tab.value === 'true' && countAtivos}
                    {tab.value === 'false' && countInativos}
                  </Label>
                }
              />
            ))}
          </Tabs>

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
            <TurmaTableToolbar
              filters={filters}
              onFilters={handleFilters}
              ddzOptions={zonas}
              escolaOptions={escolas}
              anoOptions={anosLetivos}
              setErrorMsg={setErrorMsg}
              setWarningMsg={setWarningMsg}
              enterAction={buscarTurmas}
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
                // contarTurmas();
                buscarTurmas(table.page, table.rowsPerPage, [], filters);
              }}
            >
              Aplicar filtros
            </Button>
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              {!contextReady.value ? (
                <LoadingBox texto="Buscando turmas" />
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
                      <TurmaTableRow
                        key={row.id}
                        row={row}
                        showEscola={escolas.length > 1}
                        quickEdit={() => {
                          quickEdit.onTrue();
                          setRowToEdit(row);
                        }}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
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
            count={countTurmas}
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
            <Button variant="contained" onClick={uploadTurmas}>Upload</Button>
          </Box>
        </Modal>
      </Container>

      {checkPermissaoModulo('turma', 'editar') && (
        <TurmaQuickEditForm
          row={rowToEdit}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onSave={saveAndClose}
        />
      )}
    </>
  );
}
