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
import { countries } from 'src/assets/data';
import { _turnos, _anosSerie, USER_STATUS_OPTIONS } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { ZonasContext } from '../zona/context/zona-context';
import escolaMethods from './escola-repository';

// ----------------------------------------------------------------------

export default function EscolaQuickEditForm({ currentEscola, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  

  const [errorMsg, setErrorMsg] = useState('');
  const { zonas, buscaZonas } = useContext(ZonasContext);

  useEffect(() => {
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });
  }, [])

  const NewEscolaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    endereco: Yup.string().required('Endereço é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentEscola?.nome || '',
      endereco: currentEscola?.endereco || '',
      zona: currentEscola?.zona?.id || '',
      cidade: currentEscola?.cidade?.nome || 'Manaus',
    }),
    [currentEscola]
  );

  const methods = useForm({
    resolver: yupResolver(NewEscolaSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novaEscola = {
        nome:  data.nome,
        endereco: data.endereco,
        zona_id: data.zona,
        cidade_id: "4a12c279-f19a-fae9-9c97-9b503e4bbc2c",
        aluno_escola: []
      }

      await escolaMethods.updateEscolaById(currentEscola.id, novaEscola).catch((error) => {
        throw error;
      });
      reset() 
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();
    } catch (error) {
      setErrorMsg('Tentativa de atualização da Escola falhou');
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
          <RHFTextField name="nome" label="Nome" sx={{ mb: 3 }}/>
          <RHFTextField name="endereco" label="Endereço" sx={{ mb: 3 }}/>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}

            >
              <RHFSelect name="zona" label="DDZ">
                {zonas.map((zona) => (
                  <MenuItem key={zona.id} value={zona.id}>
                    <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField name="cidade" label="Cidade" disabled={true} sx={{ mb: 3 }}/>

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

EscolaQuickEditForm.propTypes = {
  currentEscola: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
