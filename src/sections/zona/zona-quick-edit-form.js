import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState } from 'react';
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
import { _turnos, _anosSerie, USER_STATUS_OPTIONS } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import zonaMethods from './zona-repository';

// ----------------------------------------------------------------------

export default function ZonaQuickEditForm({ currentZona, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const [errorMsg, setErrorMsg] = useState('');

  const NewZonaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    nome_responsavel: Yup.string().required('Nome do responsável é obrigatório'),
    fone_responsavel: Yup.string().required('Fone do responsável é obrigatório'),
    email_responsavel: Yup.string().required('E-Mail do responsável é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentZona?.nome || '',
      nome_responsavel: currentZona?.nome_responsavel || '',
      fone_responsavel: currentZona?.fone_responsavel || '',
      email_responsavel: currentZona?.email_responsavel || '',
      cidade: currentZona?.cidade?.nome || 'Manaus',
    }),
    [currentZona]
  );

  const methods = useForm({
    resolver: yupResolver(NewZonaSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novaZona = {
        nome: data.nome,
        nome_responsavel: data.nome_responsavel,
        fone_responsavel: data.fone_responsavel,
        email_responsavel: data.email_responsavel,
        cidade_id: '4a12c279-f19a-fae9-9c97-9b503e4bbc2c',
      };

      await zonaMethods.updateZonaById(currentZona.id, novaZona).catch((error) => {
        throw error;
      });
      reset();
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();
      console.info('DATA', data);
    } catch (error) {
      setErrorMsg('Tentativa de atualização da zona falhou');
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
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          <br></br>
          <RHFTextField name="nome" label="Nome" sx={{ mb: 3 }} />

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="nome_responsavel" label="Nome do Responsável" sx={{ mb: 3 }} />
            <RHFTextField name="fone_responsavel" label="Fone do Responsável" sx={{ mb: 3 }} />
            <RHFTextField name="email_responsavel" label="E-Mail do Responsável" sx={{ mb: 3 }} />
            <RHFTextField name="cidade" label="Cidade" disabled={true} sx={{ mb: 3 }} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Atualizar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ZonaQuickEditForm.propTypes = {
  currentZona: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
