import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
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
import { _anos, _escolas, _anosSerie, _turnos } from 'src/_mock';

// ----------------------------------------------------------------------

export default function TurmaNewEditForm({ currentTurma }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewTurmaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    ano: Yup.string().required('Ano é obrigatório'),
    escola: Yup.string().required('Escola é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentTurma?.nome || '',
      ano: currentTurma?.ano || '',
      escola: currentTurma?.escola || '',
    }),
    [currentTurma]
  );

  const methods = useForm({
    resolver: yupResolver(NewTurmaSchema),
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
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFSelect name="ano_serie" label="Ano">
              {_anosSerie.map((ano) => (
                <MenuItem key={ano} value={ano}>
                  {ano}°
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField name="nome" label="Nome da Turma" />

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFSelect name="turno" label="Turno">
              {_turnos.map((escola) => (
                <MenuItem key={escola} value={escola}>
                  {escola}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="ano_escolar" label="Ano Escolar">
              {_anos.map((ano) => (
                <MenuItem key={ano} value={ano}>
                  {ano}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="escola" label="Escola">
              {_escolas.map((escola) => (
                <MenuItem key={escola} value={escola}>
                  {escola}
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
