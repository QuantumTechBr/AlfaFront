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

import ImportacaoTableRow from '../importacao-table-row';
//
import LoadingBox from 'src/components/helpers/loading-box';
import importacaoMethods from '../importacao-repository';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'descricao', label: 'Descrição', width: 300, notsortable: true },
  { id: 'status', label: 'Status', width: 200, notsortable: true },
  { id: 'created_at', label: 'Data de Criação', width: 200, notsortable: true },
  { id: 'updated_at', label: 'Data da Última Atualização', width: 300, notsortable: true },
];

// ----------------------------------------------------------------------

export default function ZonaListView() {
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg] = useState('');
  const preparado = useBoolean(false);
  // const { buscaZonas } = useContext(ZonasContext);
  const [tableData, setTableData] = useState([]);

  const preparacaoInicial = async () => {
    await importacaoMethods.getAllImportacoes().then((resultado) => {
      setTableData(resultado.data);
      console.log(resultado)
      preparado.onTrue();
    })
  };

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = tableData.length == 0;

 
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Importações"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Importações', href: paths.dashboard.zona.list },
            { name: 'Listar' },
          ]}
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
                <LoadingBox texto="Buscando Importações" />
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
                      <ImportacaoTableRow
                        key={row.id}
                        row={row}
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

    </>
  );
}
