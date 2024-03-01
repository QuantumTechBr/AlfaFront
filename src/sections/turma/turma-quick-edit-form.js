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
import { countries } from 'src/assets/data';
import { _turnos, _anosSerie, USER_STATUS_OPTIONS } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import turmaMethods from '../turma/turma-repository';
import { TurmasContext } from 'src/sections/turma/context/turma-context';

// ----------------------------------------------------------------------

export default function TurmaQuickEditForm({ id, open, onClose }) {
  const [currentTurma, setCurrentTurma] = useState();
  const contextReady = useBoolean(false);

  const { enqueueSnackbar } = useSnackbar();
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    contextReady.onFalse();
    setErrorMsg('');
    if (open) {
      Promise.all([
        buscaEscolas().catch((error) => {
          setErrorMsg('Erro de comunicação com a API de escolas');
        }),
        buscaAnosLetivos().catch((error) => {
          setErrorMsg('Erro de comunicação com a API de Anos Letivos');
        }),
        turmaMethods.getTurmaById(id).then((response) => {
          setCurrentTurma(response.data);
        })
      ]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [buscaEscolas, buscaAnosLetivos, open]);

  const NewTurmaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    ano: Yup.string().required('Ano é obrigatório'),
    escola: Yup.string().required('Escola é obrigatório')
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
      status: (currentTurma?.status == 'true' ? 'true' : 'false')  || ''
    }),
    [currentTurma]
  );

  const methods = useForm({
    // resolver: yupResolver(NewTurmaSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novaTurma = {
        nome:  data.nome,
        turno: data.turno,
        ano_letivo: data.ano_letivo
      }
    
      novaTurma.escola_id = data.escola_id;
      novaTurma.ano_id = data.ano_id;
      novaTurma.status = data.status;
      novaTurma.ano_escolar = data.ano_escolar;

      await turmaMethods.updateTurmaById(currentTurma.id, novaTurma).then(buscaTurmas({force: true})).catch((error) => {
        throw error;
      });
      reset() 
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();
      console.info('DATA', data);
    } catch (error) {
      setErrorMsg('Tentativa de atualização da turma falhou');
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues);
  }, [currentTurma]);


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
      {!contextReady.value && <LoadingBox />}

      {contextReady.value && (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle>Edição Rápida</DialogTitle>
          <DialogContent>
            {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <br></br>
            <RHFTextField name="nome" label="Nome da Turma" sx={{ mb: 3 }} />
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

              {currentTurma ? 
                (<RHFTextField name="escola" disabled={true} value={currentTurma.escola?.nome} sx={{ mb: 3 }}/>)
                :
                (<RHFSelect name="escola_id" label="Escola" >
                  {escolas.map((escola) => (
                    <MenuItem key={escola.id} value={escola.id} >
                      {escola.nome}
                    </MenuItem>
                  ))}
                </RHFSelect>)
                }

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

TurmaQuickEditForm.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool,
};
