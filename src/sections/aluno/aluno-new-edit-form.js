import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';


// ----------------------------------------------------------------------

export default function AlunoNewEditForm({ currentAluno }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewAlunoSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório !'),
    matricula: Yup.string().required('Matricula é obrigatório !'),
    data_nascimento: Yup.string().required('Data de Nascimento é obrigatório !'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentAluno?.nome || '',
      matricula: currentAluno?.matricula || '',
      data_nascimento: currentAluno?.data_nascimento || '',
    }),
    [currentAluno]
  );

  const methods = useForm({
    resolver: yupResolver(NewAlunoSchema),
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
      enqueueSnackbar(currentAluno ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.aluno.list);
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
              columnGap={4}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
            
            <RHFTextField name="nome" label="Nome do Aluno" />

            <RHFTextField name="matricula" label="Matricula" />
  
            <DatePicker name="data_nascimento" label="Data de Nascimento" />

            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentAluno ? 'Criar Aluno' : 'Atualizar Aluno'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

AlunoNewEditForm.propTypes = {
  currentAluno: PropTypes.object,
};
