import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
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

// ----------------------------------------------------------------------

export default function AlunoQuickEditForm({ currentAluno, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const [escolasAssessor, setEscolasAssessor] = useState(escolas);

  // console.log(currentAluno)
  const alunoNascimento = parseISO(currentAluno.data_nascimento);

  const NewTurmaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    matricula: Yup.string().required('Matrícula é obrigatória'),
    data_nascimento: Yup.string().required('Data de Nascimento é obrigatório'),
  });


  const defaultValues = useMemo(
    () => ({
      nome: currentAluno?.nome || '',
      matricula: currentAluno?.matricula || '',
      data_nascimento: alunoNascimento,
      escola: currentAluno?.alunoEscolas?.length ? currentAluno.alunoEscolas[0].escola : '',
      turma: currentAluno?.alunos_turmas?.length ? currentAluno.alunos_turmas[0].turma : '',
    }),
    [currentAluno, alunoNascimento]
  );

  const methods = useForm({
    resolver: yupResolver(NewTurmaSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
    control,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const anoLetivoAtual = anosLetivos.find((ano) => {
        if (ano.status === "NÃO FINALIZADO") {
          return ano.id;
        }
      })
      let aluno_escolas = []
      let aluno_turmas = []
      if (data.escola != '') {
        aluno_escolas = [
          {
            escola_id: data.escola,
            ano_id: anoLetivoAtual.id
          }
        ]
      } 
      if (data.turma) {
        aluno_turmas = [
          {
            turma_id: data.turma
          }
        ]
      }
      const nascimento = new Date(data.data_nascimento)
      const toSend = {
        nome: data.nome,
        matricula: data.matricula,
        data_nascimento: nascimento.getFullYear() + "-" + (nascimento.getMonth()+1) + "-" + nascimento.getDate(),
        alunoEscolas: aluno_escolas,
        alunos_turmas: aluno_turmas
      }
      await alunoMethods.updateAlunoById(currentAluno.id, toSend).then(buscaTurmas({force: true})).catch((error) => {
        throw error;
      });
      reset() 
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();
      console.info('DATA', data);
    } catch (error) {
      setErrorMsg('Tentativa de atualização do estudante falhou');
      console.error(error);
    }
  });

  useEffect(()  => {
    buscaEscolas().then((_escolas) => setEscolasAssessor(_escolas)).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaTurmas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de turmas');
    });
    buscaAnosLetivos().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de anos letivos');
    });
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas]);

  useEffect(()  => {
    if (user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR") {
      setValue('escola', user.funcao_usuario[0].escola.id)  
    } else if (user?.funcao_usuario[0]?.funcao?.nome == "ASSESSOR DDZ") {
      setEscolasAssessor(escolas.filter((escola) => escola.zona.id == user.funcao_usuario[0].zona.id))
    } 
  }, [escolas, setValue, user.funcao_usuario]);

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

            <RHFTextField name="matricula" label="Matrícula" />

            <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
              <Controller
                name="data_nascimento"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker value={value} onChange={onChange} label='Data de Nascimento' />
                )}
              />
            </LocalizationProvider>

            <RHFSelect sx={{
              }} id={`escola_`+`${currentAluno?.id}`} disabled={user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR" ? true : false} name="escola" label="Escola">
                {escolasAssessor.map((escola) => (
                  <MenuItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </MenuItem>
                ))}
            </RHFSelect>

            <RHFSelect sx={{
              display: getValues('escola') ? "inherit" : "none"
              }} id={`turma_`+`${currentAluno?.id}`} disabled={getValues('escola') == '' ? true : false} name="turma" label="Turma">
                {turmas.filter((te) => (
                  te?.escola_id == getValues('escola')
                ))
                .map((turma) => (
                  <MenuItem key={turma.id} value={turma.id}>
                    {turma.ano_escolar}º {turma.nome}
                  </MenuItem>
                ))}
            </RHFSelect>  

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

AlunoQuickEditForm.propTypes = {
  currentAluno: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
