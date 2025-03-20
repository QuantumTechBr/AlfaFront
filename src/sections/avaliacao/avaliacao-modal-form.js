import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useCallback, useMemo, useState, useContext, } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'src/hooks/use-boolean';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';

import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import RHFAutocomplete from '../../components/hook-form/rhf-autocomplete';
import FormControl from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// _mock
import { _tiposAvaliacao, _periodos } from 'src/_mock';

// components
import FormProvider, { RHFSelect } from 'src/components/hook-form';

import { IconButton } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';

import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';
import { first } from 'lodash';

// ----------------------------------------------------------------------

export default function NovaAvaliacaoForm({ open, onClose, initialTipo }) {
  const router = useRouter();
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);
  const contextReady = useBoolean(false);
  const [escolasFiltered, setEscolasFiltered] = useState([]);

  const defaultValues = {
    escola: '',
    turma: '',
    bimestre: '',
    periodo: '',
  };

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaEscolas(),
      buscaTurmas(),
      buscaBimestres(),
    ]).finally(() => {
      contextReady.onTrue();
    });
  }, [buscaEscolas, buscaTurmas, buscaBimestres]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    const escolasAC = [];
    escolas.map((escola) => {
      const ea = {
        label: escola.nome,
        id: escola.id,
      }
      escolasAC.push(ea)
    })
    setEscolasFiltered(escolasAC);
  }, [escolas]);

  useEffect(() => {
    if (initialTipo) setValue('tipo', initialTipo);
    if (escolas.length && escolas.length == 1) setValue('escola',
      {
        label: escolas[0].nome,
        id: escolas[0].id,
      });
  }, [contextReady.value]);

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
        if (values.escola != '') setValue('escola', '');
        if (values.turma != '') setValue('turma', '');
        if (values.bimestre != '') setValue('bimestre', '');
        if (values.periodo != '') setValue('periodo', '');
      }

      if (type == 'change' && name == 'escola') setValue('turma', '');
    });

    return () => subscription.unsubscribe();
  }, [setValue, watch]);

  const values = watch();

  const { tipo, escola, turma, periodo, bimestre } = values;

  const isTipoFase = tipo == 'Acompanhamento de Fase';
  const isTipoDiagnostico = tipo == 'Acompanhamento Diagnóstico';

  const podeAvancar = (isTipoFase && escola && turma && bimestre) || (isTipoDiagnostico && escola && turma && periodo);

  const selectEscola = () => {
    return (
      <RHFAutocomplete
        disablePortal
        id="escola"
        name="escola"
        label="Escola"
        options={escolasFiltered}

      />
    );
  };
  const selectTurma = () => {
    return (
      <RHFSelect name="turma" label="Turma">
        {turmas.filter((_turma) => _turma.escola_id == escola.id).map((_turma) => (
          <MenuItem key={_turma.id} value={_turma.id}>
            {_turma.ano_escolar}º {_turma.nome} ({_turma.turno})
          </MenuItem>
        ))}
      </RHFSelect>
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isTipoFase) {
        router.push(paths.dashboard.avaliacao.edit_fase(turma, bimestre));
      } else if (isTipoDiagnostico) {
        const dadosDiagnostico = {
          turma: turma,
          periodo: periodo,
        };
        sessionStorage.setItem('dadosDiagnosticoTurma', dadosDiagnostico.turma);
        sessionStorage.setItem('dadosDiagnosticoPeriodo', dadosDiagnostico.periodo);
        router.push(paths.dashboard.avaliacao.new_diagnostico);
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
        <DialogTitle>Registro de Acompanhamento</DialogTitle>

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
            {isTipoFase && selectEscola()}

            {isTipoFase && escola && selectTurma()}

            {isTipoFase && turma && (
              <RHFSelect name="bimestre" label="Bimestre">
                {bimestres.map((_bimestre) => (
                  <MenuItem key={_bimestre.id} value={_bimestre.id}>
                    {`${_bimestre.ordinal}º Bimestre`}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}

            {/* DIAGNOSTICO */}

            {isTipoDiagnostico && selectEscola()}

            {isTipoDiagnostico && escola && selectTurma()}

            {isTipoDiagnostico && escola && turma && (
              <RHFSelect name="periodo" label="Perfil">
                {_periodos.map((_periodo) => (
                  <MenuItem key={_periodo} value={_periodo}>
                    {_periodo}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}
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
  initialTipo: PropTypes.string,
};
