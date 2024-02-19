'use client';
import PropTypes from 'prop-types';
import { useEffect, useState, useCallback, useContext } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// utils
import { fTimestamp } from 'src/utils/format-time';
// _mock
import { _allFiles, FILE_TYPE_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import { fileFormat } from 'src/components/file-thumbnail';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { useTable, getComparator } from 'src/components/table';
//
import PlanoIntervencaoFileManagerTable from '../documento_plano_intervencao/plano-intervencao-file-manager-table';
import PlanoIntervencaoFileManagerFilters from '../documento_plano_intervencao/plano-intervencao-file-manager-filters';
import PlanoIntervencaoFileManagerGridView from '../documento_plano_intervencao/plano-intervencao-file-manager-grid-view';
import PlanoIntervencaoFileManagerFiltersResult from '../documento_plano_intervencao/plano-intervencao-file-manager-filters-result';
import PlanoIntervencaoFileManagerNewFolderDialog from '../documento_plano_intervencao/plano-intervencao-file-manager-new-folder-dialog';
import Alert from '@mui/material/Alert';
import LoadingBox from 'src/components/helpers/loading-box';


import documentoIntervencaoMethods from '../documento_plano_intervencao/documento-intervencao-repository';


// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  type: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function PlanoIntervencaoFileManagerView({ planoId }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const table = useTable({ defaultRowsPerPage: 10 });

  const settings = useSettingsContext();

  const openDateRange = useBoolean();

  const confirm = useBoolean();

  const upload = useBoolean();

  const [view, setView] = useState('list');

  const [documentos, setDocumentos] = useState([]);

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);
  
  const preparado = useBoolean(false);

  const notFound = (!tableData.length) || !tableData.length;

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset =
    !!filters.name || !!filters.type.length || (!!filters.startDate && !!filters.endDate);


  useEffect(() => {
    buscaDocumentos();
    preparado.onTrue()
  }, []);

  const buscaDocumentos = useCallback(async () => {
    setWarningMsg('');
    setErrorMsg('');
    preparado.onFalse();
    let returnData = documentos;

    const consultaAtual = documentoIntervencaoMethods.getAllDocumentos(planoId).then((response) => {
      if (response.data == '' || response.data === undefined) response.data = [];

      setDocumentos(response.data);
      returnData = response.data;
      setTableData(response.data);
      return returnData;
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de documentos');
    }).finally(() => preparado.onTrue());

    return consultaAtual;
  }, [preparado, documentos, planoId]);

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      const retorno = await documentoIntervencaoMethods.deleteDocumentoById(id).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de documentos no momento exclusão do documento');
      });
      if (retorno.status == 204) {

        const remainingRows = tableData.filter((row) => row.id !== id);
        setTableData(remainingRows);
        
        table.onUpdatePageDeleteRow(dataInPage.length);
      } else {
        console.log("Response status: ", retorno.status);
        console.log("Erro: ", retorno.data);
        throw new Error("Erro ao deletar arquivo: " + row.arquivo);
      }
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteItems = useCallback(() => {
    const remainingRows = tableData.filter((row) => !table.selected.includes(row.id));
    const deleteRows = tableData.filter((row) => table.selected.includes(row.id));

    deleteRows.forEach(async row => {
      const retorno = await documentoIntervencaoMethods.deleteDocumentoById(row.id).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de documentos no momento exclusão do documento');
      });
      if (retorno.status != 204) {
        console.log("Response status: ", retorno.status);
        console.log("Erro: ", retorno.data);
        throw new Error("Erro ao deletar arquivo: " + row.arquivo);
      }
    });
    setTableData(remainingRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleUploadClose = useCallback((event) => {
    if(event) {
      buscaDocumentos().then(retorno => setTableData(retorno));
    }
    upload.onFalse();
  }, [buscaDocumentos])

  const renderFilters = (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-end', md: 'center' }}
    >
      <PlanoIntervencaoFileManagerFilters
        openDateRange={openDateRange.value}
        onCloseDateRange={openDateRange.onFalse}
        onOpenDateRange={openDateRange.onTrue}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        dateError={dateError}
        typeOptions={FILE_TYPE_OPTIONS}

      />
    </Stack>
  );

  const renderResults = (
    <PlanoIntervencaoFileManagerFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={dataFiltered.length}
    />
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Anexos</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={upload.onTrue}
            sx={{mt:3}}
          >
            Enviar 
          </Button>
        </Stack>

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

        <Stack
            spacing={2.5}
            sx={{
              my: { xs: 3, md: 5 },
            }}
          >
            {renderFilters}

            {canReset && renderResults}
        </Stack>

        {!preparado.value ? (
                  <LoadingBox />
                ) : (

          <>
            {view === 'list' ? (
              <PlanoIntervencaoFileManagerTable
                table={table}
                tableData={tableData}
                dataFiltered={dataFiltered}
                onDeleteRow={handleDeleteItem}
                notFound={notFound}
                onOpenConfirm={confirm.onTrue}
              />
            ) : (
              <PlanoIntervencaoFileManagerGridView
                table={table}
                data={tableData}
                dataFiltered={dataFiltered}
                onDeleteItem={handleDeleteItem}
                onOpenConfirm={confirm.onTrue}
              />
            )}
          </>
        )}
      </Container>

      <PlanoIntervencaoFileManagerNewFolderDialog open={upload.value} onClose={handleUploadClose} planoId={planoId} />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Tem certeza que deseja deletar permanentemente <strong> {table.selected.length} </strong> itens?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteItems();
              confirm.onFalse();
            }}
          >
            Deletar
          </Button>
        }
      />
    </>
  );
}
PlanoIntervencaoFileManagerView.propTypes = {
  id: PropTypes.string,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, type, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (file) => {
        if(file.nomeArquivo) {
          return file.nomeArquivo.toLowerCase().indexOf(name.toLowerCase()) !== -1
        } else {
          return file.arquivo.toLowerCase().indexOf(name.toLowerCase()) !== -1
        }
      }
    );
  }

  if (type.length) {
    inputData = inputData.filter((file) => type.includes(fileFormat(file.type)));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (file) =>
          fTimestamp(file.createdAt) >= fTimestamp(startDate) &&
          fTimestamp(file.createdAt) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
