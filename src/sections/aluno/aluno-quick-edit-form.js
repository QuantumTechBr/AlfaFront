import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
//import DatePicker from 'src/theme/overrides/components/date-picker';
import alunoMethods from './aluno-repository';



// _mock
import { _anos, _escolas, _anosSerie, _turnos } from 'src/_mock';
// assets

// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import { Controller } from 'react-hook-form';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
// ----------------------------------------------------------------------

export default function TurmaQuickEditForm({ currentAluno, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  let alunoNascimento = new Date(currentAluno.data_nascimento);
  alunoNascimento.setDate(alunoNascimento.getDate()+1)

  const NewTurmaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    matricula: Yup.string().required('Matricula é obrigatória'),
    data_nascimento: Yup.string().required('Data de Nascimento é obrigatório'),
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
    resolver: yupResolver(NewTurmaSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      let nascimento = new Date(data.data_nascimento)
      data.data_nascimento = nascimento.getFullYear() + "-" + (nascimento.getMonth()+1) + "-" + nascimento.getDate()
      await alunoMethods.updateAlunoById(currentAluno.id, data);
      reset() 
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });


  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Edição Rápida</DialogTitle>

        <DialogContent>
        <br></br>
          <Box
            rowGap={3}
            columnGap={2}
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
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Atualizar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

TurmaQuickEditForm.propTypes = {
  currentAluno: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
