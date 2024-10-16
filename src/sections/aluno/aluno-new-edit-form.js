import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFMultiSelect
} from 'src/components/hook-form';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import alunoMethods from './aluno-repository';
import parseISO from 'date-fns/parseISO';
import ptBR from 'date-fns/locale/pt-BR';
import Alert from '@mui/material/Alert';
import { EscolasContext } from '../escola/context/escola-context';
import { TurmasContext } from '../turma/context/turma-context';
import { AuthContext } from 'src/auth/context/alfa';
import { useBoolean } from 'src/hooks/use-boolean';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';

// _mock
import { necessidades_especiais } from 'src/_mock';

// ----------------------------------------------------------------------

export default function AlunoNewEditForm({ currentAluno }) {
  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { enqueueSnackbar } = useSnackbar();
  const [escolasAssessor, setEscolasAssessor] = useState(escolas);


  const necessidades_options = necessidades_especiais.map(ne => {
    return {value: ne, label: ne}
  })

  const alunoNascimento = useMemo(() => {
    if (currentAluno) {
      return parseISO(currentAluno.data_nascimento);
    }
    return null;
  }, [currentAluno]);

  const NewAlunoSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    matricula: Yup.string().required('Matrícula é obrigatório'),
    data_nascimento: Yup.date().required('Data de Nascimento é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentAluno?.nome || '',
      matricula: currentAluno?.matricula || '',
      data_nascimento: alunoNascimento,
      escola: currentAluno?.alunoEscolas?.length ? currentAluno.alunoEscolas[0].escola : '',
      turma: currentAluno?.alunos_turmas?.length ? currentAluno.alunos_turmas[0].turma : '',
      necessidades_especiais: currentAluno?.necessidades_especiais ? JSON.parse(currentAluno.necessidades_especiais): [],
      laudo: currentAluno?.laudo_necessidade ? currentAluno?.laudo_necessidade : 'false'
    }),
    [currentAluno, alunoNascimento]
  );

  const methods = useForm({
    resolver: yupResolver(NewAlunoSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

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
      const necessidades_especiais_data = JSON.stringify(data.necessidades_especiais);
      const toSend = {
        nome: data.nome,
        matricula: data.matricula.toString(),
        data_nascimento: nascimento.getFullYear() + "-" + (nascimento.getMonth()+1) + "-" + nascimento.getDate(),
        alunoEscolas: aluno_escolas,
        alunos_turmas: aluno_turmas,
        necessidades_especiais: necessidades_especiais_data,
        laudo_necessidade: data.necessidades_especiais == [] ? 'false' : data.laudo
      }
      if (currentAluno) {
        await alunoMethods.updateAlunoById(currentAluno.id, toSend).then(buscaTurmas({force: true})).catch((error) => {
          throw error;
        });
        
      } else {
        await alunoMethods.insertAluno(toSend).then(buscaTurmas({force: true})).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentAluno ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.aluno.list);
    } catch (error) {
      currentAluno ? setErrorMsg('Tentativa de atualização do estudante falhou') : setErrorMsg('Tentativa de criação do estudante falhou');
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
  }, [currentAluno, defaultValues, reset]);

  useEffect(()  => {
    buscaEscolas().then(_escolas => {
      setEscolasAssessor(_escolas)
    }).catch((error) => {
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
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={4}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
            
            <RHFTextField name="nome" label="Nome do Estudante" />

            <RHFTextField type='number' name="matricula" label="Matrícula" />

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
                {turmas.filter((te) => te.escola_id == getValues('escola'))
                .map((turma) => (
                  <MenuItem key={turma.id} value={turma.id}>
                    {turma.ano_escolar}º {turma.nome} ({turma.turno})
                  </MenuItem>
                ))}
            </RHFSelect>  

            <RHFMultiSelect 
              name="necessidades_especiais" 
              label="Necessidades Especiais" 
              options={necessidades_options}
            >
              {necessidades_especiais.map((_ne) => (
                <MenuItem key={_ne} value={_ne} sx={{ height: '34px' }}>
                  {_ne}
                </MenuItem>
              ))}
            </RHFMultiSelect>

            <RHFSelect sx={{
              display: getValues('necessidades_especiais') == '' ? "none" : "inherit"
              }} id="laudo" disabled={getValues('necessidades_especiais') == '' ? true : false} name="laudo" label="Possui laudo médico?">
                <MenuItem key='laudo_sim' value='true'>
                  SIM
                </MenuItem>
                <MenuItem key='laudo_nao' value='false' selected>
                  NÃO
                </MenuItem>
            </RHFSelect>  

            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentAluno ? 'Criar Estudante' : 'Atualizar Estudante'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

AlunoNewEditForm.propTypes = {
  currentAluno: PropTypes.object,
}
