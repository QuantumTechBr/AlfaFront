import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useCallback, useMemo, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
    console.log('useEffect MODAL');
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
    //resolver: yupResolver(NewUserSchema),
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
      // console.log(name, type);
      // console.table(values);

      if (type == 'change' && name == 'tipo') {
        if (values.turma != '') setValue('turma', '');
        if (values.bimestre != '') setValue('bimestre', '');
        if (values.periodo != '') setValue('periodo', '');
      }

      // if (type == 'change' && name == 'turma') {
      //   if (values.bimestre != '') setValue('bimestre', '');
      // }
    });

    return () => subscription.unsubscribe();
  }, [setValue, watch]);

  const values = watch();

  const { tipo, turma, periodo, bimestre } = values;

  const podeAvancar =
    (tipo == 'Avaliação de Fase' && turma && bimestre) ||
    (tipo == 'Avaliação de Diagnóstico' && turma && periodo);

  const selectTurma = () => {
    return (
      <RHFSelect name="turma" label="Turma">
        {turmas.map((turma) => (
          <MenuItem key={turma.id} value={turma.id}>
            {turma.ano_escolar}º {turma.nome}
          </MenuItem>
        ))}
      </RHFSelect>
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (tipo == 'Avaliação de Fase') {
        router.push(paths.dashboard.registro_aprendizagem.edit_fase(turma, bimestre));
      } else if (tipo == 'Avaliação de Diagnóstico') {
        const dadosDiagnostico = {
          turma: turma,
          periodo: periodo,
        };
        sessionStorage.setItem('dadosDiagnosticoTurma', dadosDiagnostico.turma);
        sessionStorage.setItem('dadosDiagnosticoPeriodo', dadosDiagnostico.periodo);
        router.push(paths.dashboard.registro_aprendizagem.new_diagnostico);
      } else {
        console.info('DATA', data);
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
      onClose={false}
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
                {bimestres.map((bimestre) => (
                  <MenuItem key={bimestre.id} value={bimestre.id}>
                    {`${bimestre.ordinal}º Bimestre`}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}

            {/* DIAGNOSTICO */}
            {tipo == 'Avaliação de Diagnóstico' && (
              <RHFSelect name="periodo" label="Período">
                {_periodos.map((periodo) => (
                  <MenuItem key={periodo} value={periodo}>
                    {periodo}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}

            {tipo == 'Avaliação de Diagnóstico' && periodo && selectTurma()}
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