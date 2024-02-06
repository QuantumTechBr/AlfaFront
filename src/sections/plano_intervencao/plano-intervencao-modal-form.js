import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import * as Yup from 'yup';
import { useEffect, useCallback, useMemo, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Iconify from 'src/components/iconify/iconify';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import { useSettingsContext } from 'src/components/settings';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
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
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material';
import Tooltip from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import LoadingBox from 'src/components/helpers/loading-box';
import Table from '@mui/material/Table';
// _mock
import { 
  anos_options, 
  fases_options,
  aplicacao_options, 
} from 'src/_mock';

// components
import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { IconButton } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';

import { useBoolean } from 'src/hooks/use-boolean';
import planoIntervencaoMethods from './plano-intervencao-repository';
import Alert from '@mui/material/Alert';
import habilidadeMethods from '../habilidade/habilidade-repository';
import PlanoIntervencaoModalTableRow from './plano-intervencao-modal-table-row';

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: '', width: 88 },
  { id: 'nome', label: 'Variáveis a melhorar', width: 200 },
  { id: 'acao', label: 'Ação', width: 300 },
  { id: 'responsavel', label: 'Responsável pela ação', width: 300 },
  { id: 'data_inicio', label: 'Inicio previsto', width: 80 },
  { id: 'data_termino', label: 'Término previsto', width: 80 },
  { id: 'ano_escolar', label: 'Ano Escolar', width: 80 },
  { id: 'aplicacao', label: 'Aplicação', width: 80 },
  { id: 'status', label: 'Status', width: 80 },
  { id: 'farol', label: 'Farol', width: 50 },
];

const filtros = {
  ano: '',
  fase: '',
  habilidades: [],
};

export default function NovoPlanoIntervencaoForm({ open, onClose }) {
  const [filters, setFilters] = useState(filtros);
  const router = useRouter();
  const [hab, setHab] = useState([])
  const preparado = useBoolean(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [allHab, setAllHab] = useState([]);
  const [habilidades_1ano, setHabilidades_1ano] = useState([]);
  const [habilidades_2ano, setHabilidades_2ano] = useState([]);
  const [habilidades_3ano, setHabilidades_3ano] = useState([]);

  useEffect(() => {
    habilidadeMethods.getAllHabilidades().then((retorno) => {
      let hab1ano = [];
      let hab2ano = [];
      let hab3ano = [];
      retorno.data.map((habilidade) => {
        if (habilidade.ano_escolar == 1) {
          hab1ano.push(habilidade);
          return
        }
        if (habilidade.ano_escolar == 2) {
          hab2ano.push(habilidade);
          return
        }
        if (habilidade.ano_escolar == 3) {
          hab3ano.push(habilidade);
          return
        }
      })
      setAllHab(retorno.data);
      setHabilidades_1ano(hab1ano);
      setHabilidades_2ano(hab2ano);
      setHabilidades_3ano(hab3ano);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de habilidades');
    });
  }, []);

  
  const table = useTable();

  const settings = useSettingsContext();

  const [tableData, setTableData] = useState([]);

  const [filtroTable, setFiltroTable] = useState({});

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filtroTable,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(filtroTable, filtroTable);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const defaultValues = useMemo(
    () => ({
      ano: '',
      fase: '',
      habilidades: [],
    }),
    []
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const { ano, fase, habilidades } = values;

  const selecionado = useBoolean(false);

  const podeBuscar = (dohabilidades, dofase) => {
    if (dofase != '' || dohabilidades.length > 0) {
      return true
    }
    return false
  }


  const handleFilters = useCallback(
    async (nome, value) => {
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
      setFilters(novosFiltros);
    },
    [filters]
  );

  const handleFilterHabilidade = useCallback(
    (event) => {
      handleFilters(
        'habilidades',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const renderValueHabilidade = (selected) => 
    selected.map((habId) => {
      return (hab.find((option) => option.id == habId)?.nome);
    }).join(', ');

  useEffect(() => {
    if (ano == '1') {
      setHab(habilidades_1ano);
    }
    if (ano == '2') {
      setHab(habilidades_2ano);
    }
    if (ano == '3') {
      setHab(habilidades_3ano);
    }
    setFilters(filtros);
  }, [ano]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      planoIntervencaoMethods.getAllPlanosIntervencao({
        fase: fase,
        habilidades: filters.habilidades,
      }).then(planos => {
        setTableData(planos.data);
        preparado.onTrue();
        if (planos.data.length == 0) {
          setErrorMsg('Nenhum Plano encontrado');
        }
      }
      ).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de habilidades');
    });
    } catch (error) {
      console.error(error);
    }
  });

  const onSelectRowCustom = useCallback(
    (inputValue) => {
      if (table.selected.includes(inputValue)) {
        table.setSelected([])
      } else {
        table.setSelected(inputValue);
      }
    },
    [table.selected]
  );

  const renderizaTabela = () => {
    return (
        <Box>
          <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960, mt: 3 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <PlanoIntervencaoModalTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => onSelectRowCustom(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table> 
            </Scrollbar>
            <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Box>
    )
  }

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 1500 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Registro de Avaliação</DialogTitle>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent>
          <br></br>
          <Box rowGap={3} 
          columnGap={2} 
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(4, 1fr)',
          }}
          >

          <RHFSelect name="ano" label="Ano" sx={{
            flexShrink: 0,
            sx: { maxWidth: 120 },
          }}>
              {anos_options.map((doAno) => (
                <MenuItem key={doAno} value={doAno}>
                  {doAno}º
                </MenuItem>
              ))}
            </RHFSelect>

          <FormControl
            sx={{
              flexShrink: 0,
            }}
          >
            
            <InputLabel>Habilidades</InputLabel>

            <Select
              multiple
              name="habilidades_plano_intervencao"
              value={filters.habilidades}
              onChange={handleFilterHabilidade}
              input={<OutlinedInput label="Habilidades" />}
              renderValue={renderValueHabilidade}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {hab?.map((habi) => (
                <MenuItem key={habi.id} value={habi.id}>
                  <Checkbox disableRipple size="small" checked={filters.habilidades.includes(habi.id)} />
                  {`${habi.nome} - ${habi.descricao}`}
                </MenuItem>
              ))}
            </Select>
            </FormControl>

            <RHFSelect name="fase" label="Fase">
                {fases_options.map((doFase) => (
                  <MenuItem key={doFase} value={doFase} sx={{ height: '34px' }}>
                    {doFase}
                  </MenuItem>
                ))}
              </RHFSelect>

            <LoadingButton
              disabled={!podeBuscar(filters.habilidades, fase)}
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting} 
            >
              Buscar Plano
            </LoadingButton>

            
          </Box>
        {(errorMsg == 'Nenhum Plano encontrado' && tableData.length > 0) ? '' : (!!errorMsg && <Alert severity="error"  sx={{ mt: 3 }}>{errorMsg}</Alert>)}
        {tableData.length > 0 ? renderizaTabela() : ''}
          
        </DialogContent>
        <DialogActions>
          <Button
              disabled={table.selected.length > 0 ? false : true}
              component={RouterLink}
              href={paths.dashboard.plano_intervencao.new_from(table.selected)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Novo Plano a Partir de...
            </Button>

          <Button
              component={RouterLink}
              href={paths.dashboard.plano_intervencao.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Novo Plano
            </Button>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}

NovoPlanoIntervencaoForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

function applyFilter({ inputData, comparator, filters }) {

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);


  return inputData;
}
