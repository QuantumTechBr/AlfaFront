import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useContext, useEffect } from 'react';
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
import { _anosSerie, _turnos } from 'src/_mock';

import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';

// ----------------------------------------------------------------------

export default function TurmaNewEditForm({ currentTurma }) {
  const router = useRouter();

  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    buscaEscolas();
    buscaAnosLetivos();
  }, [])

  const NewTurmaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    ano: Yup.string().required('Ano é obrigatório'),
    escola: Yup.string().required('Escola é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentTurma?.nome || '',
      ano: currentTurma?.ano || '',
      anoId: currentTurma?.ano?.id || '',
      ano_escolar: currentTurma?.ano_escolar || '',
      escola: currentTurma?.escola || '',
      escolaId: currentTurma?.escola?.id || '',
      turno: currentTurma?.turno || '',
      status: currentTurma?.status || ''
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(currentTurma ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.turma.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatarUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
          <RHFTextField name="nome" label="Nome da Turma" sx={{ mb: 3 }}/>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}

            >

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

              <RHFSelect name="anoId" label="Ano Letivo">
                {anosLetivos.map((ano) => (
                  <MenuItem key={ano.id} value={ano.id}>
                    {ano.ano}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="escolaId" label="Escola">
                {escolas.map((escola) => (
                  <MenuItem key={escola.id} value={escola.id} >
                    {escola.nome}
                  </MenuItem>
                ))}
              </RHFSelect>
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
  );
}

TurmaNewEditForm.propTypes = {
  currentTurma: PropTypes.object,
};