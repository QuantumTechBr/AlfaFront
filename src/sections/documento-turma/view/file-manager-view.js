'use client';

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
import FileManagerTable from '../file-manager-table';
import FileManagerFilters from '../file-manager-filters';
import FileManagerGridView from '../file-manager-grid-view';
import FileManagerFiltersResult from '../file-manager-filters-result';
import FileManagerNewFolderDialog from '../file-manager-new-folder-dialog';
import documentoTurmaMethods from '../documento-turma-repository';
import Alert from '@mui/material/Alert';
import LoadingBox from 'src/components/helpers/loading-box';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';

// Cash
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  type: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function FileManagerView() {
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const table = useTable({ defaultRowsPerPage: 10 });

  const settings = useSettingsContext();

  const openDateRange = useBoolean();

  const confirm = useBoolean();

  const upload = useBoolean();

  const [view, setView] = useState('list');

  const { turmas, buscaTurmas } = useContext(TurmasContext);
  
  const { escolas, buscaEscolas } = useContext(EscolasContext);

  const [ escolaSelecionada, setEscolaSelecionada ] = useState();

  const [ turmaSelecionada, setTurmaSelecionada ] = useState();

  const [documentos, setDocumentos] = useState([]);

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);
  
  const preparado = useBoolean(false);

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
    const promises = [];

    let escola1 = null;
    let turma1 = null;

    const escolasPromise = buscaEscolas().then(async (_escolas) => {
      if (_escolas.length == 0) {
        setWarningMsg('A API retornou uma lista vazia de escolas');
      } else {
        escola1 = _escolas[0];
        setEscolaSelecionada(escola1);

        await buscaTurmas().then((_turmas) => {
          if (_turmas.length == 0) {
            setWarningMsg('A API retornou uma lista vazia de turmas');
          } else {
            turma1 = _turmas.find(turma => turma.escola.id == escola1.id);
            if (turma1){
              setTurmaSelecionada(turma1)
            } else {
              setTurmaSelecionada(null)
            }
          }
        }).catch((error) => {
          setErrorMsg('Erro de comunicação com a API de turmas');
        });
      }

    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    promises.push(escolasPromise);

    Promise.all(promises).then(() => {
      if(turma1) {
        buscaDocumentos(turma1.id).then(retorno => {
          if (retorno?.length == 0) {
            setWarningMsg('A API retornou uma lista vazia de documentos');
          }
        });
      }
      preparado.onTrue()
    })
  }, []);

  const buscaDocumentos = async (turmaId) => {
    setWarningMsg('');
    setErrorMsg('');
    preparado.onFalse();
    let returnData = documentos;

    const consultaAtual = documentoTurmaMethods.getAllDocumentos(turmaId).then((response) => {
      if (response.data == '' || response.data === undefined) response.data = [];

      setDocumentos(response.data);
      returnData = response.data;
      setTableData(response.data);
      return returnData;
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de documentos');
    }).finally(() => preparado.onTrue());

    return consultaAtual;
  };

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

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

  
  const handleSelectEscola = useCallback(

    async (event) => {
        
        const escolaId = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
        // const escolas = await buscaEscolas();
        // const turmas = await buscaTurmas();
        const escolaNova = escolas.find((option) => option.id == escolaId);
        
        setEscolaSelecionada(escolaNova);
        
        const turmaEscola = turmas.find(turma => turma.escola.id == escolaId);

        if (turmaEscola){
          setTurmaSelecionada(turmaEscola)
          buscaDocumentos(turmaEscola.id);
        } else {
          setTurmaSelecionada(null);
          setDocumentos([]);
          setTableData([]);
        }
    },
    []
  );

  const handleSelectTurma = useCallback(
    async (event) => {

        const turmaId = event.target.value;
        const doturmas = await buscaTurmas();
        setTurmaSelecionada(doturmas.find((option) => option.id == turmaId));
        buscaDocumentos(turmaId);
    
      },
    []
  );


  const handleDeleteItem = useCallback(
    async (id) => {
      const retorno = await documentoTurmaMethods.deleteDocumentoById(id).catch((error) => {
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
      const retorno = await documentoTurmaMethods.deleteDocumentoById(row.id).catch((error) => {
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
    console.log(event);
    if(event?.data?.id) {
      buscaDocumentos(event.data.turma.id).then(retorno => setTableData(retorno));
    }
    
    upload.onFalse();
  }, [])

  const renderFilters = (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-end', md: 'center' }}
    >
      <FileManagerFilters
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

      {/* <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
        <ToggleButton value="list">
          <Iconify icon="solar:list-bold" />
        </ToggleButton>

        <ToggleButton value="grid">
          <Iconify icon="mingcute:dot-grid-fill" />
        </ToggleButton>
      </ToggleButtonGroup> */}
    </Stack>
  );

  const renderResults = (
    <FileManagerFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={dataFiltered.length}
    />
  );

  
  const renderValueEscola = (selected) => 
     { return escolas.find((option) => option.id == selected)?.nome; }

  const renderValueTurma = (selected) => 
    { 
      const turma = turmas.find((option) => option.id == selected);
      return  `${turma.ano_escolar}º ${turma.nome} - ${turma.ano.ano}`; 
    }

  const renderFilterEscola = (
    <Select
      value={escolaSelecionada ? escolaSelecionada.id : ''}
      // defaultValue={escolas.length ? escolas[0]?.id : ''}
      onChange={handleSelectEscola}
      input={<OutlinedInput label="Escola" />}
      renderValue={renderValueEscola}
      MenuProps={{
        PaperProps: {
          sx: { maxHeight: 240 },
        },
      }}
    >
      {escolas?.map((escola) => (
        <MenuItem key={escola.id} value={escola.id}>
          {escola.nome}
        </MenuItem>
      ))}
    </Select>
  )

  const renderFilterTurma = (
    <Select
      value={turmaSelecionada ? turmaSelecionada.id : ''}
      // defaultValue={turmas.length ? turmas[0]?.id : ''}
      onChange={handleSelectTurma}
      input={<OutlinedInput label="Turma" />}
      renderValue={renderValueTurma}
      MenuProps={{
        PaperProps: {
          sx: { maxHeight: 240 },
        },
      }}
    >
      {turmas?.filter(turma => turma.escola.id == escolaSelecionada?.id)?.map((turma) => (
        <MenuItem key={turma.id} value={turma.id}>
          {turma.ano_escolar}º {turma.nome} - {turma.ano.ano}
        </MenuItem>
      ))}
    </Select>
  )



  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Documentos de Intervenção</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={upload.onTrue}
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
            {renderFilterEscola}
            {renderFilterTurma}

            {!tableData.length && (
              <Alert severity="warning">
                Nenhum documento para mostrar
              </Alert>
            )}
            {view === 'list' ? (
              <FileManagerTable
                table={table}
                tableData={tableData}
                dataFiltered={dataFiltered}
                onDeleteRow={handleDeleteItem}
                notFound={!preparado}
                onOpenConfirm={confirm.onTrue}
              />
            ) : (
              <FileManagerGridView
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

      <FileManagerNewFolderDialog open={upload.value} onClose={handleUploadClose} turma={turmaSelecionada} />

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
