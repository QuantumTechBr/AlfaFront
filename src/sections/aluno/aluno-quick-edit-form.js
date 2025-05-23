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

export default function AlunoQuickEditForm({ row, open, onClose, onSave }) {
  const [currentAluno, setCurrentAluno] = useState();
  const contextReady = useBoolean(false);

  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);

  const NewTurmaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    matricula: Yup.string().required('Matrícula é obrigatória'),
    data_nascimento: Yup.string().required('Data de Nascimento é obrigatório'),
  });

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
        let escola_id = escolas.filter((escola) => escola.nome == row?.escola_nome)[0]?.id
        // console.log(escolas.filter((escola) => escola.nome == row?.escola_nome))
        let turma_escola = turmas.filter(turma => turma.escola_id == escola_id);
        setCurrentAluno({
          ...row,
          data_nascimento: parseISO(row.data_nascimento),
          escola: escola_id,
          turma: turma_escola.filter((turma) => turma.nome == row?.turma_nome && turma.ano_escolar == row?.turma_ano_escolar && turma.turno == row?.turma_turno)[0]?.id,
        });
      });
    }
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas, open]);

  
  const defaultValues = useMemo(
    () => ({
      nome: currentAluno?.nome || '',
      matricula: currentAluno?.matricula || '',
      data_nascimento: currentAluno?.data_nascimento || null,
      escola: currentAluno?.escola ? currentAluno.escola : '',
      turma: currentAluno?.turma ? currentAluno.turma : '',
    }),
    [currentAluno]
  );
  
  const methods = useForm({
    resolver: yupResolver(NewTurmaSchema),
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
  
  const onSubmit = handleSubmit(async (data) => {
    try {
      const anoLetivoAtual = anosLetivos.find((ano) => {
        if (ano.status === 'NÃO FINALIZADO') {
          return ano.id;
        }
      });
      const nascimento = new Date(data.data_nascimento);
      const toSend = {
        nome: data.nome,
        matricula: data.matricula.toString(),
        data_nascimento:
        nascimento.getFullYear() + '-' + (nascimento.getMonth() + 1) + '-' + nascimento.getDate(),
      };
      
      const retornoPatch = await alunoMethods
      .updateAlunoById(currentAluno.id, toSend)
      .then(buscaTurmas({ force: true }))
      .catch((error) => {
        throw error;
      });
      
      enqueueSnackbar('Atualizado com sucesso!');
      onSave(retornoPatch.data);
      reset();
    } catch (error) {
      setErrorMsg('Tentativa de atualização do estudante falhou');
      console.error(error);
    }
  });
  
  useEffect(() => {
    if (currentAluno) {
      reset(defaultValues);
    }
  }, [currentAluno]);

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
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="nome" label="Nome do Estudante" />

              <RHFTextField type="number" name="matricula" label="Matrícula" />

              <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
                <Controller
                  name="data_nascimento"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker value={value} onChange={onChange} label="Data de Nascimento" />
                  )}
                />
              </LocalizationProvider>
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

AlunoQuickEditForm.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool,
};
