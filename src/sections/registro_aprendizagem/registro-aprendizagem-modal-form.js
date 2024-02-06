import PropTypes from 'prop-types';
import { useEffect, useCallback, useMemo, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// _mock
import { _tiposAvaliacao, _periodos } from 'src/_mock';

// components
import FormProvider, { RHFMultiSelect, RHFSelect } from 'src/components/hook-form';

import { IconButton } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';

import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';

// ----------------------------------------------------------------------

export default function NovaAvaliacaoForm({ open, onClose }) {
  const router = useRouter();
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);

  useEffect(() => {
    buscaTurmas();
    buscaBimestres();
  }, [buscaTurmas, buscaBimestres]);

  const defaultValues = useMemo(
    () => ({
      turma: '',
      bimestre: '',
      periodo: '',
    }),
    []
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (type == 'change' && name == 'tipo') {
        if (values.turma != '') setValue('turma', '');
        if (values.bimestre != '') setValue('bimestre', '');
        if (values.periodo != '') setValue('periodo', '');
      }
    });

    return () => subscription.unsubscribe();
  }, [setValue, watch]);

  const values = watch();

  const { tipo, turma, periodo, bimestre } = values;

  const podeAvancar =
    (tipo == 'Avaliação de Fase' && turma && bimestre) ||
    (tipo == 'Avaliação Diagnóstica' && turma && periodo);

  const selectTurma = () => {
    return (
      <RHFSelect name="turma" label="Turma">
        {turmas.map((doturma) => (
          <MenuItem key={doturma.id} value={doturma.id}>
            {doturma.ano_escolar}º {doturma.nome}
          </MenuItem>
        ))}
      </RHFSelect>
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (tipo == 'Avaliação de Fase') {
        router.push(paths.dashboard.registro_aprendizagem.edit_fase(turma, bimestre));
      } else if (tipo == 'Avaliação Diagnóstica') {
        const dadosDiagnostico = {
          turma: turma,
          periodo: periodo,
        };
        sessionStorage.setItem('dadosDiagnosticoTurma', dadosDiagnostico.turma);
        sessionStorage.setItem('dadosDiagnosticoPeriodo', dadosDiagnostico.periodo);
        router.push(paths.dashboard.registro_aprendizagem.new_diagnostico);
      } else {
        throw 'Tipo não implementado';
      }
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
        <DialogTitle>Registro de Avaliação</DialogTitle>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent>
          <br></br>
          <Box rowGap={3} display="grid">
            <RHFSelect name="tipo" label="Tipo">
              {_tiposAvaliacao.map((tipo_avaliacao) => (
                <MenuItem key={tipo_avaliacao} value={tipo_avaliacao}>
                  {tipo_avaliacao}
                </MenuItem>
              ))}
            </RHFSelect>

            {/* FASE */}
            {tipo == 'Avaliação de Fase' && selectTurma()}

            {tipo == 'Avaliação de Fase' && turma && (
              <RHFSelect name="bimestre" label="Bimestre">
                {bimestres.map((dobimestre) => (
                  <MenuItem key={dobimestre.id} value={dobimestre.id}>
                    {`${dobimestre.ordinal}º Bimestre`}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}

            {/* DIAGNOSTICO */}
            {tipo == 'Avaliação Diagnóstica' && (
              <RHFSelect name="periodo" label="Período">
                {_periodos.map((doperiodo) => (
                  <MenuItem key={doperiodo} value={doperiodo}>
                    {doperiodo}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}

            {tipo == 'Avaliação Diagnóstica' && periodo && selectTurma()}
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            disabled={!podeAvancar}
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting}
          >
            Avançar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

NovaAvaliacaoForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
