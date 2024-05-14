import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'src/hooks/use-boolean';
import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';

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
import LoadingBox from 'src/components/helpers/loading-box';

// assets
import { _turnos, _anosSerie, USER_STATUS_OPTIONS } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import zonaMethods from './zona-repository';

// ----------------------------------------------------------------------

export default function ZonaQuickEditForm({ row, open, onClose, onSave }) {
  const [currentZona, setCurrentZona] = useState();
  const contextReady = useBoolean(false);

  const { enqueueSnackbar } = useSnackbar();

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    contextReady.onFalse();
    setErrorMsg('');
    if (open) {
      setCurrentZona(row);
      contextReady.onTrue();
    } else {
      setCurrentZona(undefined);
    }
  }, [open]);

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

      const retornoPatch = await zonaMethods
        .updateZonaById(currentZona.id, novaZona)
        .catch((error) => {
          throw error;
        });

      enqueueSnackbar('Atualizado com sucesso!');
      onSave(retornoPatch.data);
      reset();
    } catch (error) {
      setErrorMsg('Tentativa de atualização da zona falhou');
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues);
  }, [currentZona]);

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
      {!contextReady.value && <LoadingBox texto="Carregando dependências" mt={4} />}

      {contextReady.value && (
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
              <RHFTextField name="nome_responsavel" label="Nome do Responsável" />
              <RHFTextField name="fone_responsavel" label="Fone do Responsável" />
              <RHFTextField name="email_responsavel" label="E-Mail do Responsável" />
              <RHFTextField name="cidade" label="Cidade" disabled={true} />
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
      )}
    </Dialog>
  );
}

ZonaQuickEditForm.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
