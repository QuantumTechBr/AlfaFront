import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'src/hooks/use-boolean';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import alunoMethods from './aluno-repository';
import RHFAutocomplete from '../../components/hook-form/rhf-autocomplete';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { Controller } from 'react-hook-form';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import parseISO from 'date-fns/parseISO';
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState, useContext } from 'react';
import { EscolasContext } from '../escola/context/escola-context';
import { TurmasContext } from '../turma/context/turma-context';
import { AuthContext } from 'src/auth/context/alfa';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';

import LoadingBox from 'src/components/helpers/loading-box';
import _ from 'lodash';

// ----------------------------------------------------------------------

export default function AlunoEscolaTurmaAnoEditModal({ row, open, onClose, onSave, mapEscolaInicial }) {
  const [currentAluno, setCurrentAluno] = useState();
  const contextReady = useBoolean(false);
  const [escolasFiltered, setEscolasFiltered] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const [anosLetivosOptions, setAnosLetivosOptions] = useState([]);

  function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  useEffect(() => {
    if (mapEscolaInicial?.length > 0) {
      const anoOpt = [];
      mapEscolaInicial.map((ei)=>anoOpt.push(ei.ano_id));
      if (row) {
        removeItemOnce(anoOpt, row.ano_letivo.id)
      }
      setAnosLetivosOptions(anoOpt);
    }
  }, [open]);



  useEffect(() => {
    contextReady.onFalse();
    setErrorMsg('');
    if (open) {
      Promise.all([
        buscaEscolas()
          .catch((error) => {
            setErrorMsg('Erro de comunicação com a API de escolas');
          }),
        buscaTurmas().catch((error) => {
          setErrorMsg('Erro de comunicação com a API de turmas');
        }),
        buscaAnosLetivos().catch((error) => {
          setErrorMsg('Erro de comunicação com a API de anos letivos');
        }),
      ]).then(() => {
        contextReady.onTrue();
        if (row) {
          setCurrentAluno({
            ...row,
            id: row.id,
            id_aluno_escola: row.id_aluno_escola,
            turma: row.turma?.id,
            ano_letivo: row.ano_letivo.id,
            escola: row.escola?.nome ? { label: row.escola.nome, id: row.escola.id } : '',
          });

        }
      });
    }
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas, open]);

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


  const defaultValues = useMemo(
    () => ({
      id: currentAluno?.id || '',
      id_aluno_escola: currentAluno?.id_aluno_escola || '',
      ano_letivo: currentAluno?.ano_letivo || '',
      escola: currentAluno?.escola ? currentAluno.escola : '',
      turma: currentAluno?.turma ? currentAluno.turma : '',
    }),
    [currentAluno]
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
    control,
  } = methods;

  const values = watch();

  let { ano_letivo } = values;

  useEffect(() => {
    if (currentAluno) {
      reset(defaultValues);
    }
  }, [currentAluno]);

  useEffect(() => {
    if (contextReady.value) {
      if (user?.funcao_usuario?.length == 1 && user?.funcao_usuario[0]?.funcao?.nome == 'DIRETOR') {
        setValue('escola', user.funcao_usuario[0].escola.id);
      } 
    }
  }, [contextReady.value, escolas, setValue, user?.funcao_usuario]);

  const turmasEscolaAno = () => {
    return turmas.filter((te) => te.escola_id == getValues('escola')?.id && te.ano_id == getValues('ano_letivo'));
  }

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={() => {
        setValue('escola', '');
        setValue('turma', '');
        setValue('ano_letivo', '');
        onClose();
      }}
      PaperProps={{
        sx: { maxWidth: 1080, minHeight: 600 },
      }}
    >
      {!contextReady.value && <LoadingBox texto="Carregando dependências" mt={4} />}

      {contextReady.value && (
        <FormProvider methods={methods}>
          <DialogTitle>Escola / Turma / Ano</DialogTitle>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

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

              <RHFSelect
                sx={{}}
                id={`ano_letivo` + `${currentAluno?.id}`}
                name="ano_letivo"
                label="Ano Letivo"
              >
              {anosLetivos 
                .filter((ano) => !anosLetivosOptions.includes(ano.id))
                .map((ano) => (
                  <MenuItem key={ano.id} value={ano.id}>
                    {ano.ano}
                  </MenuItem>
                ))}
                {anosLetivos.filter((ano) => !anosLetivosOptions.includes(ano.id)).length === 0 && (
                  <MenuItem disabled>
                    Nenhum ano letivo disponível. Aluno só pode estar em uma escola por ano letivo.
                  </MenuItem>
                )}
              </RHFSelect>

              <RHFAutocomplete
                disablePortal
                id="escola"
                name="escola"
                label="Escola"
                options={escolasFiltered}

              />

              <RHFSelect
                sx={{
                  display: getValues('escola') ? 'inherit' : 'none',
                }}
                id={`turma_` + `${currentAluno?.id}`}
                disabled={getValues('escola') == '' ? true : false}
                name="turma"
                label="Turma"
              >
                {!!turmasEscolaAno() ? turmasEscolaAno()
                  .map((turma) => (
                    <MenuItem key={turma.id} value={turma.id}>
                      {turma.ano_escolar}º {turma.nome} ({turma.turno})
                    </MenuItem>
                  )) : (
                    <MenuItem disabled>
                      Nenhuma turma disponível para a escola selecionada no ano letivo atual.
                    </MenuItem>
                  )}
              </RHFSelect>


            </Box>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={() => {
              setValue('escola', '');
              setValue('turma', '');
              setValue('ano_letivo', '');
              onClose();
            }}>
              Cancelar
            </Button>

            <LoadingButton variant="contained" loading={isSubmitting}
              onClick={() => {
                if (!getValues('escola') || getValues('escola') == '' || !getValues('ano_letivo') || getValues('ano_letivo') == '') {
                  setErrorMsg('Escola e ano letivo são obrigatórios!');
                  return;
                }
                let _turma = turmas.filter(turma => turma.id == getValues('turma'));
                let _escola = escolas.filter(escola => escola.id == getValues('escola').id);
                let _ano = anosLetivos.filter(ano => ano.id == getValues('ano_letivo'));
                setValue('escola', '');
                setValue('turma', '');
                setValue('ano_letivo', '');
                onSave({
                  id: row ? getValues('id') : 'novo',
                  id_aluno_escola: row ? getValues('id_aluno_escola') : 'novo',
                  turma: _turma[0],
                  escola: _escola[0],
                  ano_letivo: _ano[0],
                })
              }}
            >
              Atualizar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      )}
    </Dialog>
  );
}

AlunoEscolaTurmaAnoEditModal.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool,
  mapEscolaInicial: PropTypes.array,
};
