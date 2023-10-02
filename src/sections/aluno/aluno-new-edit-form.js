import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useEffect } from 'react';
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import alunoMethods from './aluno-repository';


// ----------------------------------------------------------------------

export default function AlunoNewEditForm({ currentAluno }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  let alunoNascimento = new Date('01-01-2000');
  if (currentAluno) {
    alunoNascimento = new Date(currentAluno.data_nascimento)
    alunoNascimento.setDate(alunoNascimento.getDate()+1)
  }


  const NewAlunoSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    matricula: Yup.string().required('Matricula é obrigatório'),
    data_nascimento: Yup.date().required('Data de Nascimento é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentAluno?.nome || '',
      matricula: currentAluno?.matricula || '',
      data_nascimento: alunoNascimento,
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
      let nascimento = new Date(data.data_nascimento)
      data.data_nascimento = nascimento.getFullYear() + "-" + (nascimento.getMonth()+1) + "-" + nascimento.getDate()
      if (currentAluno) {
        await alunoMethods.updateAlunoById(currentAluno.id, data);
        
      } else {
        await alunoMethods.insertAluno(data);
      }
      reset();
      enqueueSnackbar(currentAluno ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.aluno.list);
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
  }, [currentAluno]);

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
  
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="data_nascimento"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker value={value} onChange={onChange} />
                )}
              />
            </LocalizationProvider>

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
}
