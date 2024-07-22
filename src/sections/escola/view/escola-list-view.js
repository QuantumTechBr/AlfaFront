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
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
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
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const [_escolaList, setEscolaList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const preparado = useBoolean(false);

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();

  const quickEdit = useBoolean();
  const [rowToEdit, setRowToEdit] = useState();

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaEscolas({ force: true })
        .then((_escolas) => {
          setTableData(_escolas);
        })
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
          youtubeLink="https://www.youtube.com/embed/2tfCF7lzilw?si=WYiCrwjrMm_RbZbr"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

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
