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

export default function AlunoEscolaTurmaAnoEditModal({ row, open, onClose, onSave }) {
  const [currentAluno, setCurrentAluno] = useState();
  const contextReady = useBoolean(false);
  const [escolasFiltered, setEscolasFiltered] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const [escolasAssessor, setEscolasAssessor] = useState(escolas);


  useEffect(() => {
    contextReady.onFalse();
    setErrorMsg('');
    if (open) {
      Promise.all([
        buscaEscolas()
          .then((_escolas) => setEscolasAssessor(_escolas))
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
            ano_letivo: row.ano_letivo.id,
            escola: {label: row.escola.nome, id: row.escola.id},
            turma: row.turma?.id,
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

  useEffect(() => {
    if (currentAluno) {
      reset(defaultValues);
    }
  }, [currentAluno]);

  useEffect(() => {
    if (contextReady.value) {
      if (user?.funcao_usuario[0]?.funcao?.nome == 'DIRETOR') {
        setValue('escola', user.funcao_usuario[0].escola.id);
      } else if (user?.funcao_usuario[0]?.funcao?.nome == 'ASSESSOR DDZ') {
        setEscolasAssessor(
          escolas.filter((escola) => escola.zona.id == user.funcao_usuario[0].zona.id)
        );
      }
    }
  }, [contextReady.value, escolas, setValue, user.funcao_usuario]);

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
                {turmas
                  .filter((te) => te.escola_id == getValues('escola')?.id)
                  .filter((te) => te.ano_id == getValues('ano_letivo'))
                  .map((turma) => (
                    <MenuItem key={turma.id} value={turma.id}>
                      {turma.ano_escolar}º {turma.nome} ({turma.turno})
                    </MenuItem>
                  ))}
              </RHFSelect>

              <RHFSelect
                sx={{}}
                id={`ano_letivo` + `${currentAluno?.id}`}
                disabled={user?.funcao_usuario[0]?.funcao?.nome == 'DIRETOR' ? true : false}
                name="ano_letivo"
                label="Ano Letivo"
              >
                {anosLetivos.map((ano) => (
                  <MenuItem key={ano.id} value={ano.id}>
                    {ano.ano}
                  </MenuItem>
                ))}
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
            onClick={()=>{
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
};
