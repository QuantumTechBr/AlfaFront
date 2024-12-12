import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useContext, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
import { countries } from 'src/assets/data';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';
// _mock
import { _anosSerie, _turnos, USER_STATUS_OPTIONS } from 'src/_mock';

import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import turmaMethods from '../turma/turma-repository';
import Alert from '@mui/material/Alert';
import AlunoTurmaForm from './aluno-turma-form';
import ProfessorTurmaForm from './professor-turma-form';
import TextField from '@mui/material/TextField';
import { FormControl, Paper } from '@mui/material';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
// ----------------------------------------------------------------------

export default function TurmaNewEditForm({ currentTurma }) {
  const router = useRouter();
  const modalAlunoTurma = useBoolean();
  const modalProfessorTurma = useBoolean();

  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  const [errorMsg, setErrorMsg] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const preparacaoInicial = useCallback(async () => {
    //
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaAnosLetivos().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de Anos Letivos');
    });
  }, []);

  useEffect(() => {
    preparacaoInicial();
  }, []);

  const NewTurmaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    ano: Yup.string().required('Ano é obrigatório'),
    escola: Yup.string().required('Escola é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentTurma?.nome || '',
      ano: currentTurma?.ano || '',
      ano_id: currentTurma?.ano?.id || '',
      ano_escolar: currentTurma?.ano_escolar || '',
      escola: currentTurma?.escola || '',
      escola_id: currentTurma?.escola?.id || '',
      turno: currentTurma?.turno?.toLowerCase() || '',
      status: (currentTurma?.status) || '',
      codigo_turma: currentTurma?.codigo_turma || '',
    }),
    [currentTurma]
  );

  const methods = useForm({
    // resolver: yupResolver(NewTurmaSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novaTurma = {
        nome: data.nome,
        turno: data.turno,
        ano_letivo: data.ano_letivo,
      };

      novaTurma.escola_id = data.escola_id;
      novaTurma.ano_id = data.ano_id;
      novaTurma.status = data.status;
      novaTurma.ano_escolar = data.ano_escolar;
      novaTurma.codigo_turma = data.codigo_turma;

      if (currentTurma?.id) {
        await turmaMethods.updateTurmaById(currentTurma.id, novaTurma).then(buscaTurmas({force: true})).catch((error) => {
          throw error;
        });
      } else {
        await turmaMethods.insertTurma(novaTurma).then(buscaTurmas({force: true})).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentTurma ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.turma.list);
      console.info('DATA', data);
    } catch (error) {
      currentTurma
        ? setErrorMsg('Tentativa de atualização da turma falhou')
        : setErrorMsg('Tentativa de criação da turma falhou');
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues);
    if (currentTurma) {
      console.log(currentTurma);
    }
  }, [currentTurma, defaultValues, reset]);

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="nome" label="Nome da Turma" />
                <RHFSelect name="ano_escolar" label="Ano">
                  {_anosSerie.map((ano) => (
                    <MenuItem key={ano} value={ano}>
                      {ano}°
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFSelect name="turno" label="Turno">
                  {_turnos.map((turno) => (
                    <MenuItem key={turno} value={turno}>
                      <Box sx={{ textTransform: 'capitalize' }}>{turno}</Box>
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFSelect name="ano_id" label="Ano Letivo">
                  {anosLetivos.map((ano) => (
                    <MenuItem key={ano.id} value={ano.id}>
                      {ano.ano}
                    </MenuItem>
                  ))}
                </RHFSelect>
                {currentTurma?.id && (
                  <RHFTextField name="codigo_turma" label="Código da Turma" />
                )}
                {!currentTurma && (
                  <RHFSelect name="escola_id" label="Escola">
                    {escolas.map((escola) => (
                      <MenuItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}

                <RHFSelect name="status" label="Status">
                  {USER_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </RHFSelect>

                {currentTurma?.id && (
                  <Button
                    variant="contained"
                    onClick={modalAlunoTurma.onTrue}
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    sx={{
                      bgcolor: '#00A5AD',
                    }}
                  >
                    Definir Estudantes da Turma
                  </Button>
                )}
                {currentTurma?.id && (
                  <Button
                    variant="contained"
                    onClick={modalProfessorTurma.onTrue}
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    sx={{
                      bgcolor: '#00A5AD',
                    }}
                  >
                    Definir Professor da Turma
                  </Button>
                )}
              </Box>

              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentTurma ? 'Criar Turma' : 'Atualizar Turma'}
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
      <AlunoTurmaForm
        turma={currentTurma}
        open={modalAlunoTurma.value}
        onClose={modalAlunoTurma.onFalse}
      />
      <ProfessorTurmaForm
        turma={currentTurma}
        open={modalProfessorTurma.value}
        onClose={modalProfessorTurma.onFalse}
      />
    </>
  );
}

TurmaNewEditForm.propTypes = {
  currentTurma: PropTypes.object,
};