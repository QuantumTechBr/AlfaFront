import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useCallback, useMemo, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Iconify from 'src/components/iconify/iconify';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';

// _mock
import { _tiposAvaliacao, _periodos, habilidades_1ano, habilidades_2ano, habilidades_3ano, fases_options, anos_options } from 'src/_mock';

// components
import FormProvider, { RHFMultiSelect, RHFSelect } from 'src/components/hook-form';

import { IconButton } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';

import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function NovoPlanoIntervencaoForm({ open, onClose }) {
  const filtros = {
    ano: '',
    fase: '',
    habilidades: [],
  };
  const router = useRouter();
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);
  const [filters, setFilters] = useState(filtros);
  const [hab, setHab] = useState([])

  useEffect(() => {
    buscaTurmas();
    buscaBimestres();
  }, [buscaTurmas, buscaBimestres]);

  const defaultValues = useMemo(
    () => ({
      ano: '',
      fase: '',
      habilidades: [],
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
    getValues,
    watch,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (type == 'change' && name == 'ano') {
        setFilters(filtros)
      }
    });

    return () => subscription.unsubscribe();
  }, [setFilters, watch]);

  const values = watch();

  const { ano, fase, habilidades } = values;

  const selecionado = useBoolean();

  const podeBuscar =
    (fase || habilidades);

  const podeAvancar =
    (selecionado)


  const handleFilters = useCallback(
    async (nome, value) => {
      // table.onResetPage();
      if (nome == 'habilidades') {
        const novosFiltros = {
          ...filters,
          [nome]: filters.habilidades.push(value),
        }
      }
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
      setFilters(novosFiltros);
    },
    []
  );

  const handleFilterHabilidade = useCallback(
    (event) => {
      handleFilters(
        'habilidades',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const renderValueHabilidade = (selected) => {
    //console.log(selected)
    return selected.map((habilidade) => {
      return hab.find((habi) => {
        if (habi == habilidade) {
          return habi
        }
      }).slice(0,3)
    }).join(', ');
  };

  useEffect(() => {
    //console.log(values)
    if (ano == '1º') {
      setHab(habilidades_1ano);
    }
    if (ano == '2º') {
      setHab(habilidades_2ano);
    }
    if (ano == '3º') {
      setHab(habilidades_3ano);
    }
  }, [ano]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // if (tipo == 'Avaliação de Fase') {
      //   router.push(paths.dashboard.registro_aprendizagem.edit_fase(turma, bimestre));
      // } else if (tipo == 'Avaliação Diagnóstica') {
      //   const dadosDiagnostico = {
      //     turma: turma,
      //     periodo: periodo,
      //   };
      //   sessionStorage.setItem('dadosDiagnosticoTurma', dadosDiagnostico.turma);
      //   sessionStorage.setItem('dadosDiagnosticoPeriodo', dadosDiagnostico.periodo);
      //   router.push(paths.dashboard.registro_aprendizagem.new_diagnostico);
      // } else {
      //   throw 'Tipo não implementado';
      // }
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
          <Box rowGap={3} 
          columnGap={2} 
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
          >

          <RHFSelect name="ano" label="Ano" sx={{
            flexShrink: 0,
            width: { xs: 1, md: 300 },
          }}>
              {anos_options.map((ano) => (
                <MenuItem key={ano} value={ano}>
                  {ano}
                </MenuItem>
              ))}
            </RHFSelect>

            <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 300 },
          }}
        >
            
            <InputLabel>Habilidades</InputLabel>

            <Select
              multiple
              value={filters.habilidades}
              onChange={handleFilterHabilidade}
              input={<OutlinedInput label="Habilidades" />}
              renderValue={renderValueHabilidade}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {hab?.map((habi) => (
                <MenuItem key={habi} value={habi}>
                  <Checkbox disableRipple size="small" checked={filters.habilidades.includes(habi)} />
                  {habi}
                </MenuItem>
              ))}
            </Select>
            </FormControl>


            {/* FASE */}
            {/* {tipo == 'Avaliação de Fase' && selectTurma()} */}

            {/* {tipo == 'Avaliação de Fase' && turma && (
              <RHFSelect name="bimestre" label="Bimestre">
                {bimestres.map((bimestre) => (
                  <MenuItem key={bimestre.id} value={bimestre.id}>
                    {`${bimestre.ordinal}º Bimestre`}
                  </MenuItem>
                ))}
              </RHFSelect>
            )} */}

            {/* DIAGNOSTICO */}
            {/* {tipo == 'Avaliação Diagnóstica' && (
              <RHFSelect name="periodo" label="Período">
                {_periodos.map((periodo) => (
                  <MenuItem key={periodo} value={periodo}>
                    {periodo}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}

            {tipo == 'Avaliação Diagnóstica' && periodo && selectTurma()} */}
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            disabled={!podeAvancar}
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            sx={{ mr: 3}} 
          >
            Novo Plano a Partir de...
          </LoadingButton>

          <Button
              component={RouterLink}
              href={paths.dashboard.plano_intervencao.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Novo Plano
            </Button>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}

NovoPlanoIntervencaoForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
