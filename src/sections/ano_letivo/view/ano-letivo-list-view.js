'use client';

import { useEffect, useState, useCallback, useContext } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import anoLetivoMethods from '../ano-letivo-repository';
import AnoLetivoTableRow from '../ano-letivo-table-row';
import LoadingBox from 'src/components/helpers/loading-box';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ano',         label: 'Ano',           width: 150 },
  { id: 'data_inicio', label: 'Data de Início', width: 200 },
  { id: 'data_fim',    label: 'Data de Fim',    width: 200 },
  { id: '',            width: 88 },
];

// ----------------------------------------------------------------------

export default function AnoLetivoListView() {
  const { checkPermissaoModulo } = useAuthContext();
  const permissaoSuperAdmin = checkPermissaoModulo('superadmin', 'upload');

  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const [tableData, setTableData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const contextReady = useBoolean(false);
  const criarDialog = useBoolean();

  const table = useTable({ defaultRowsPerPage: 25 });
  const settings = useSettingsContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch inicial
  const preparacaoInicial = useCallback(async () => {
    await buscaAnosLetivos().catch(() => {
      setErrorMsg('Erro de comunicação com a API de anos letivos');
    });
    contextReady.onTrue();
  }, [buscaAnosLetivos, contextReady]);

  useEffect(() => {
    preparacaoInicial();
  }, [preparacaoInicial]);

  useEffect(() => {
    setTableData(anosLetivos);
  }, [anosLetivos]);

  const handleEditRow = useCallback(
    (id) => { router.push(paths.dashboard.ano_letivo.edit(id)); },
    [router]
  );

  // --- Dialog de criação ---
  const defaultCreateValues = { ano: '', data_inicio: null, data_fim: null };
  const createMethods = useForm({ defaultValues: defaultCreateValues });
  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: createReset,
    formState: { isSubmitting: isCreating },
  } = createMethods;

  const onCreateSubmit = handleCreateSubmit(async (data) => {
    try {
      const payload = {
        ano: Number(data.ano),
        status: 'ativo',      // status enviado automaticamente — não editável pelo usuário
        data_inicio: data.data_inicio
          ? format(data.data_inicio, 'yyyy-MM-dd')
          : null,
        data_fim: data.data_fim
          ? format(data.data_fim, 'yyyy-MM-dd')
          : null,
      };
      const response = await anoLetivoMethods.insertAnoLetivo(payload);
      await buscaAnosLetivos({ force: true });
      enqueueSnackbar('Ano letivo criado com sucesso!');
      criarDialog.onFalse();
      createReset(defaultCreateValues);
      router.push(paths.dashboard.ano_letivo.edit(response.data.id));
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : 'Erro ao criar ano letivo');
      console.error(error);
    }
  });

  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Anos Letivos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Anos Letivos' },
        ]}
        action={
          permissaoSuperAdmin && (
            <Button
              onClick={criarDialog.onTrue}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Novo Ano Letivo
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            {!contextReady.value ? (
              <LoadingBox texto="Carregando anos letivos" mt={4} />
            ) : (
              <Table size="medium">
                <TableHeadCustom headLabel={TABLE_HEAD} />
                <TableBody>
                  {dataInPage.map((row) => (
                    <AnoLetivoTableRow
                      key={row.id}
                      row={row}
                      onEditRow={() => handleEditRow(row.id)}
                    />
                  ))}
                  <TableNoData notFound={!tableData.length} />
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

      {/* Dialog de criação */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={criarDialog.value}
        onClose={criarDialog.onFalse}
      >
        <FormProvider methods={createMethods} onSubmit={onCreateSubmit}>
          <DialogTitle>Novo Ano Letivo</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <RHFTextField
              name="ano"
              label="Ano"
              type="number"
              fullWidth
              sx={{ mb: 3, mt: 1 }}
            />
            <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
              <Controller
                name="data_inicio"
                control={createControl}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    label="Data de Início"
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
                  />
                )}
              />
            </LocalizationProvider>
            <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
              <Controller
                name="data_fim"
                control={createControl}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    label="Data de Fim"
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={criarDialog.onFalse}>
              Cancelar
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isCreating}>
              Salvar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </Container>
  );
}
