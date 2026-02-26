'use client';

import PropTypes from 'prop-types';
import { useMemo, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import anoLetivoMethods from './ano-letivo-repository';

// ----------------------------------------------------------------------

// Converte string 'YYYY-MM-DD' em objeto Date (sem problema de timezone)
const parseDateStr = (str) => {
  if (!str) return null;
  return parseISO(str); // date-fns parseISO é seguro para YYYY-MM-DD
};

// Converte Date em string 'YYYY-MM-DD' para a API
const formatDateForApi = (date) => {
  if (!date) return null;
  return format(date, 'yyyy-MM-dd');
};

const ORDINAL_LABEL = { 1: '1º Bimestre', 2: '2º Bimestre', 3: '3º Bimestre', 4: '4º Bimestre' };

// ----------------------------------------------------------------------

export default function AnoLetivoNewEditForm({ currentAnoLetivo, currentBimestres, afterSave }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');

  // Estado local dos bimestres (gerenciado independente do RHF)
  const [bimestresState, setBimestresState] = useState([]);

  // Sincronizar bimestresState quando currentBimestres muda (após fetch)
  useEffect(() => {
    if (currentBimestres?.length) {
      setBimestresState(
        currentBimestres.map((b) => ({
          id: b.id,
          ordinal: b.ordinal,
          data_inicio: parseDateStr(b.data_inicio),
          data_fim: parseDateStr(b.data_fim),
        }))
      );
    }
  }, [currentBimestres]);

  // Atualizar campo de bimestre no estado local
  const handleBimestreChange = (bimestreId, field, value) => {
    setBimestresState((prev) =>
      prev.map((b) => (b.id === bimestreId ? { ...b, [field]: value } : b))
    );
  };

  // RHF para campos do ano letivo
  const defaultValues = useMemo(
    () => ({
      ano: currentAnoLetivo?.ano || '',
      data_inicio: parseDateStr(currentAnoLetivo?.data_inicio),
      data_fim: parseDateStr(currentAnoLetivo?.data_fim),
    }),
    [currentAnoLetivo]
  );

  const methods = useForm({ defaultValues });
  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [currentAnoLetivo, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ano: Number(data.ano),
        data_inicio: formatDateForApi(data.data_inicio),
        data_fim: formatDateForApi(data.data_fim),
        // status NÃO incluído no payload de atualização
        bimestres: bimestresState.map((b) => ({
          id: b.id,
          data_inicio: formatDateForApi(b.data_inicio),
          data_fim: formatDateForApi(b.data_fim),
          // status de bimestre NÃO incluído no payload
        })),
      };

      await anoLetivoMethods.updateAnoLetivoById(currentAnoLetivo.id, payload);

      enqueueSnackbar('Atualizado com sucesso!');
      if (afterSave) afterSave();
      router.push(paths.dashboard.ano_letivo.list);
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : 'Tentativa de atualização do ano letivo falhou');
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      <Grid container spacing={3}>
        {/* Campos do Ano Letivo */}
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Dados do Ano Letivo</Typography>
            <Stack spacing={3}>
              <RHFTextField name="ano" label="Ano" type="number" />

              <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
                <Controller
                  name="data_inicio"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      value={value}
                      onChange={onChange}
                      label="Data de Início"
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  )}
                />
              </LocalizationProvider>

              <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
                <Controller
                  name="data_fim"
                  control={control}
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
            </Stack>
          </Card>
        </Grid>

        {/* Tabela de Bimestres */}
        {bimestresState.length > 0 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Bimestres</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bimestre</TableCell>
                      <TableCell>Data de Início</TableCell>
                      <TableCell>Data de Fim</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bimestresState.map((bimestre) => (
                      <TableRow key={bimestre.id}>
                        <TableCell sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                          {ORDINAL_LABEL[bimestre.ordinal] || `${bimestre.ordinal}º Bimestre`}
                        </TableCell>
                        <TableCell>
                          <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
                            <DatePicker
                              value={bimestre.data_inicio}
                              onChange={(newValue) =>
                                handleBimestreChange(bimestre.id, 'data_inicio', newValue)
                              }
                              label=""
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: { size: 'small', sx: { minWidth: 160 } },
                              }}
                            />
                          </LocalizationProvider>
                        </TableCell>
                        <TableCell>
                          <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
                            <DatePicker
                              value={bimestre.data_fim}
                              onChange={(newValue) =>
                                handleBimestreChange(bimestre.id, 'data_fim', newValue)
                              }
                              label=""
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: { size: 'small', sx: { minWidth: 160 } },
                              }}
                            />
                          </LocalizationProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        )}

        {/* Botão Salvar */}
        <Grid xs={12}>
          <Stack alignItems="flex-end">
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!currentAnoLetivo}
            >
              Salvar
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

AnoLetivoNewEditForm.propTypes = {
  currentAnoLetivo: PropTypes.object,
  currentBimestres: PropTypes.array,
  afterSave: PropTypes.func,
};
