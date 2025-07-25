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
  TablePaginationCustom,
} from 'src/components/table';
//

import ZonaTableRow from '../zona-table-row';
//
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import LoadingBox from 'src/components/helpers/loading-box';
import zonaMethods from '../zona-repository';
import ZonaQuickEditForm from '../zona-quick-edit-form';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 300, notsortable: true },
  { id: 'cidade', label: 'Cidade', width: 200, notsortable: true },
  { id: 'nome_responsavel', label: 'Responsável', width: 200, notsortable: true },
  { id: 'email_responsavel', label: 'E-Mail Responsável', width: 300, notsortable: true },
  { id: 'fone_responsavel', label: 'Fone Responsável', width: 200, notsortable: true },
  { id: '', width: 88, notsortable: true },
];

// ----------------------------------------------------------------------

export default function ZonaListView() {
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg] = useState('');
  const preparado = useBoolean(false);
  const { buscaZonas } = useContext(ZonasContext);
  const [tableData, setTableData] = useState([]);

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaZonas({ force: true })
      .then((_zonas) => {
        setTableData(_zonas);
      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de zonas');
        console.log(error);
      })
      .finally(() => {
        preparado.onTrue();
      })
      ])
  }, [buscaZonas, preparado]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  const table = useTable({defaultRowsPerPage: 10});

  const settings = useSettingsContext();

  const router = useRouter();

  const quickEdit = useBoolean();
  const [rowToEdit, setRowToEdit] = useState();

  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = tableData.length == 0;

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      zonaMethods
        .deleteZonaById(id)
        .then((retorno) => {
          preparado.onFalse()
          setTableData([]);
          setTimeout(preparacaoInicial, 1000);
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de zonas no momento da exclusão da zona');
        });

      table.onUpdatePageDeleteRow(dataInPage.length);

      // CONTEXT - ATUALIZA GERAL DO SISTEMA
      // buscaZonas({ force: true });
    },
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.zona.edit(id));
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

      // CONTEXT - ATUALIZA GERAL DO SISTEMA
      buscaZonas({ force: true });
    },
    [tableData]
  );

  const saveAndClose = (retorno = null) => {
    handleSaveRow({ ...rowToEdit, ...retorno });
    quickEdit.onFalse();
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="DDZs"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'DDZs', href: paths.dashboard.zona.root },
            { name: 'Listar' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.zona.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: '#00A5AD',
              }}
            >
              Adicionar
            </Button>
          }
          youtubeLink="https://www.youtube.com/embed/h7_iVqBN6dM?si=NgoMolmmWPmBlyOW&cc_load_policy=1"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              {!preparado.value ? (
                <LoadingBox texto="Buscando DDZs" />
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
                      <ZonaTableRow
                        key={row.id}
                        row={row}
                        quickEdit={() => {
                          quickEdit.onTrue();
                          setRowToEdit(row);
                        }}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
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
            count={tableData.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </Container>

      <ZonaQuickEditForm
        row={rowToEdit}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onSave={saveAndClose}
      />
    </>
  );
}
