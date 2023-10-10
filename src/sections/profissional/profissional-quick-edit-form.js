import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// assets
import { countries } from 'src/assets/data';
import { _turnos, _anosSerie, USER_STATUS_OPTIONS } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import profissionalMethods from '../profissional/profissional-repository';

// ----------------------------------------------------------------------

export default function ProfissionalQuickEditForm({ currentProfissional, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  useEffect(() => {
    buscaEscolas();
    buscaAnosLetivos();
  }, [])

  const NewProfissionalSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    ano: Yup.string().required('Ano é obrigatório'),
    escola: Yup.string().required('Escola é obrigatório')
  });

  const defaultValues = useMemo(
    () => ({
      profissional: currentProfissional?.profissional || '',
      email: currentProfissional?.email.ano || '',
      funcao: currentProfissional?.funcao || '',
      escola: currentProfissional?.escola || '',
      zona: currentProfissional?.zona || ''
    }),
    [currentProfissional]
  );

  const methods = useForm({
    // resolver: yupResolver(NewProfissionalSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novoProfissional = {
        profissional:  data.profissional,
        email: data.email,
        escola: data.escola,
        funcao: data.funcao,
        zona: data.zona
      }
    
      novaProfissional.profissional = data.profissional;
      novaProfissional.email = data.email;
      novaProfissional.funcao = data.funcao;
      novaProfissional.escola = data.escola;
      novaProfissional.zona = data.zona;

      await profissionalMethods.updateProfissionalById(currentProfissional.id, novoProfissional);
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
          <RHFTextField name="nome" label="Nome do Profissional" sx={{ mb: 3 }} />
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >

            <RHFSelect name="ano_escolar" label="Ano Escolar">
              {_anosSerie.map((ano) => (
                <MenuItem key={ano} value={ano}>
                  {ano}°
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="turno" label="Turno">
              {_turnos.map((turno) => (
                <MenuItem key={turno} value={turno} sx={{ textTransform: 'capitalize' }}>
                  {turno}
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

            <RHFSelect name="escola_id" label="Escola">
              {escolas.map((escola) => (
                <MenuItem key={escola.id} value={escola.id} >
                  {escola.nome}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="status" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

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

ProfissionalQuickEditForm.propTypes = {
  currentProfissional: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
