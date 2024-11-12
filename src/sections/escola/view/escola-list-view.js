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
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Scrollbar from 'src/components/scrollbar';
import ImportHelperButton from 'src/components/helpers/import-helper-button';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
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
import EscolaTableRow from '../escola-table-row';
import EscolaTableToolbar from '../escola-table-toolbar';

//
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import LoadingBox from 'src/components/helpers/loading-box';
import escolaMethods from '../escola-repository';
import { EscolasContext } from '../context/escola-context';
import Iconify from 'src/components/iconify';
import EscolaQuickEditForm from '../escola-quick-edit-form';
import { useAuthContext } from 'src/auth/hooks';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', notsortable: true },
  { id: 'endereco', label: 'Endereço', width: 200, notsortable: true },
  { id: 'zona', label: 'DDZ', width: 100, notsortable: true },
  { id: 'cidade', label: 'Cidade', width: 100, notsortable: true },
  { id: '', width: 88, notsortable: true },
];

const defaultFilters = {
  nome: '',
  ddz: [],
};

// ----------------------------------------------------------------------

export default function EscolaListView() {
  const { checkPermissaoModulo } = useAuthContext();
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const [_escolaList, setEscolaList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const preparado = useBoolean(false);

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();

  const quickEdit = useBoolean();
  const [rowToEdit, setRowToEdit] = useState();

  const permissaoSuperAdmin = checkPermissaoModulo('superadmin', 'upload');

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

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaEscolas({ force: true })
        .catch((error) => {
          console.log(error);
          setErrorMsg('Erro de comunicação com a API de escolas');
        }),
      buscaZonas().catch((error) => {
        console.log(error);
        setErrorMsg('Erro de comunicação com a API de zonas');
      }),
    ]);
    preparado.onTrue();
  }, [buscaEscolas, buscaZonas, preparado]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    setTableData(escolas);
  }, [escolas]); 

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const notFound = dataFiltered.length == 0;

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

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
      escolaMethods
        .deleteEscolaById(id)
        .then((retorno) => {
          preparado.onFalse()
          setTableData([]);
          setTimeout(preparacaoInicial, 1000);
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de escolas no momento da exclusão da escola');
        });

      table.onUpdatePageDeleteRow(dataInPage.length);
      
      // CONTEXT - ATUALIZA GERAL DO SISTEMA
      buscaEscolas({ force: true });
    },
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.escola.edit(id));
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
    buscaEscolas({force: true});
  };

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const uploadEscolas = async () => {
    try {
      const formData = new FormData();
      formData.append('arquivo', uploadedFile);

      closeUploadModal();

      setWarningMsg('Enviando arquivo. Por favor, aguarde... ' +
        'O processo de importação pode demorar alguns minutos e até mesmo horas dependendo do número de registros a serem validados. ' +
        'Você pode acompanhar o status do processo pelo painel do Django Admin. Por favor, evite iniciar vários processos de importação simultaneamente. ' +
        'Isso pode gerar lentidão no sistema e até mesmo inconsistência de dados.'
      );

      const response = await escolaMethods.importFileEscolas(formData);

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
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Escolas"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Escolas', href: paths.dashboard.escola.root },
            { name: 'Listar' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.escola.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: '#00A5AD',
              }}
            >
              Adicionar
            </Button>
            
          }
          
          
          youtubeLink="https://www.youtube.com/embed/PRtd9syb-8k?si=IB5qYTX-wHmM2ZQ5&cc_load_policy=1"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

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
              Importar Escolas
            </Button>
            <ImportHelperButton 
            ordemImportacao='escola'
            nomeTela='ESCOLAS'
            linkDownload={'/modelos-de-importacao/modelo-importacao-escola.csv'}
            />
          </Box>

        )}

        <Card>
          <EscolaTableToolbar filters={filters} onFilters={handleFilters} ddzOptions={zonas} />

          

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              {!preparado.value ? (
                <LoadingBox texto="Buscando escolas" />
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
                      <EscolaTableRow
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
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>

        <Modal open={openUploadModal} onClose={closeUploadModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6">Upload Arquivo (xlsx ou csv)</Typography>
            <input type="file" 
              onChange={handleFileUpload} 
            />
            <Button variant="contained" onClick={uploadEscolas}>Upload</Button>
          </Box>
        </Modal>
      </Container>

      <EscolaQuickEditForm
          row={rowToEdit}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onSave={saveAndClose}
        />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { nome, ddz } = filters; 
  console.log(inputData);

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (escola) => escola.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (ddz.length) {
    inputData = inputData.filter((escola) => ddz.includes(escola.zona.id));
  }

  return inputData;
}
