import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form';
import { _habilidades, habilidades_options } from 'src/_mock';
import { useEffect, useState } from 'react';
import RegistroAprendizagemDiagnosticoNewEditTable from './registro-aprendizagem-diagnostico-new-edit-table';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import Alert from '@mui/material/Alert';
import Label from 'src/components/label';
import { Box } from '@mui/material';
import { RegistroAprendizagemContext } from 'src/sections/registro_aprendizagem/context/registro-aprendizagem-context';
import { useContext } from 'react';
import { useAuthContext } from 'src/auth/hooks';


// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditForm({ turma, periodo, handleTurma, habilidades, alunosTurma, prep }) {
  const { checkPermissaoModulo } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const router = useRouter();
  const { limparMapCache } = useContext(RegistroAprendizagemContext);
  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });
  const permissaoCadastrar = checkPermissaoModulo("registro_aprendizagem", "cadastrar");
  const defaultValues = {
    registros: []
  }

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    register,
    getValues,
    reset,
    resetField,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (alunosTurma.length) {
      const novosRegistros = [];
      let r_vazio = Array(20).fill("");
      let csv_dat = [[
        "Nome",
        "Frequência",
        "R1",
        "R2",
        "R3",
        "R4",
        "R5",
        "R6",
        "R7",
        "R8",
        "R9",
        "R10",
        "R11",
        "R12",
        "R13",
        "R14",
        "R15",
        "R16",
        "R17",
        "R18",
        "R19",
        "R20",
        "Média LP",
        "Média MAT",
        "Média Final",
      ]];
      alunosTurma.forEach((alunoTurma) => {
        let nova_linha_csv = [];
        alunoTurma.aluno.nome ? nova_linha_csv.push(alunoTurma.aluno.nome) : nova_linha_csv.push('');
        alunoTurma.frequencia ? nova_linha_csv.push(alunoTurma.frequencia) : nova_linha_csv.push('');
        alunoTurma.r ? 
        alunoTurma.r.map((r) => nova_linha_csv.push(r.toString())) : r_vazio.map((r) => nova_linha_csv.push(r));
        alunoTurma.media_lingua_portuguesa ? nova_linha_csv.push(alunoTurma.media_lingua_portuguesa.toString()) : nova_linha_csv.push('');
        alunoTurma.media_matematica ? nova_linha_csv.push(alunoTurma.media_matematica.toString()) : nova_linha_csv.push('');
        alunoTurma.media_final ? nova_linha_csv.push(alunoTurma.media_final.toString()) : nova_linha_csv.push('');
        csv_dat.push(nova_linha_csv)
        novosRegistros[alunoTurma.id] = {
          habilidades_registro_aprendizagem: alunoTurma.mapHabilidades,
          id_aluno_turma: alunoTurma.id,
          promo_ano_anterior: alunoTurma.promo_ano_anterior,
          frequencia: alunoTurma.frequencia,
          r: alunoTurma.r,
        }
      })
      setValue('csvFileName', `${turma.ano.ano} - ${turma.escola.nome} - ${turma.ano_escolar}º ${turma.nome} - ${periodo}.csv`)
      setValue('csvData', csv_dat);
      setValue('registros', novosRegistros);
    }
  }, [alunosTurma, setValue, turma]);

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    const registrosAprendizagem = [];
    alunosTurma.forEach((itemList) => {
      let frequencia = data.registros[itemList.id].frequencia
      let freqBool = false;
      if (frequencia != undefined && frequencia != '') {
        freqBool = true;
      }
      let habilidades_registro_aprendizagem = [];
      let mediaLP = 0;
      let mediaMAT = 0;
      let mediaFINAL = 0;
      let ptMedBool = true;
      let matMedBool = true;
      let pt = false;
      let mat = false;
      const dataR = data.registros[itemList.id].r;
      for (let index = 0; index < 20; index++) {
        if (index < 10) {
          if (dataR != undefined) {
            if (data.registros[itemList.id].r[index] !== "") {
              pt = true;
            } else {
              ptMedBool = false;
            }
            mediaLP += data.registros[itemList.id].r[index] == "" || data.registros[itemList.id].r[index] == 'NR' ? 0 : data.registros[itemList.id].r[index];
            mediaFINAL += data.registros[itemList.id].r[index] == "" || data.registros[itemList.id].r[index] == 'NR' ? 0 : data.registros[itemList.id].r[index];
            const habRegAp = {
              nota: data.registros[itemList.id].r[index],
              numero_resposta: index + 1,
            }
            habilidades_registro_aprendizagem.push(habRegAp);
          }
        } else {
          if (dataR != undefined) {
            if (data.registros[itemList.id].r[index] !== "") {
              mat = true;
            } else {
              matMedBool = false;
            }
            mediaMAT += data.registros[itemList.id].r[index] == "" || data.registros[itemList.id].r[index] == 'NR' ? 0 : data.registros[itemList.id].r[index];
            mediaFINAL += data.registros[itemList.id].r[index] == "" || data.registros[itemList.id].r[index] == 'NR' ? 0 : data.registros[itemList.id].r[index];
            const habRegAp = {
              nota: data.registros[itemList.id].r[index],
              numero_resposta: index + 1,
            }
            habilidades_registro_aprendizagem.push(habRegAp);
          }
        }
      }


      if (turma?.ano_escolar == '1') {
        mediaLP = (mediaLP * 10) / 11;
        mediaMAT = (mediaMAT * 10) / 11;
        mediaFINAL = (mediaFINAL * 10) / 22;
      } else if (turma?.ano_escolar == '2') {
        mediaLP = (mediaLP * 10) / 12; // MULTIPLICAMOS A MÉDIA POR 100 PARA PODERMOS PEGAR A PRIMEIRA CASA APÓS A VÍRUGLA QUANDO O NUMERO VIRAR INTEIRO
        mediaMAT = (mediaMAT * 10) / 12; // MULTIPLICAMOS A MÉDIA POR 100 PARA PODERMOS PEGAR A PRIMEIRA CASA APÓS A VÍRUGLA QUANDO O NUMERO VIRAR INTEIRO
        mediaFINAL = (mediaFINAL * 10) / 24; // MULTIPLICAMOS A MÉDIA POR 100 PARA PODERMOS PEGAR A PRIMEIRA CASA APÓS A VÍRUGLA QUANDO O NUMERO VIRAR INTEIRO
      } else if (turma?.ano_escolar == '3') {
        mediaLP = (mediaLP * 10) / 13; // MULTIPLICAMOS A MÉDIA POR 100 PARA PODERMOS PEGAR A PRIMEIRA CASA APÓS A VÍRUGLA QUANDO O NUMERO VIRAR INTEIRO
        mediaMAT = (mediaMAT * 10) / 13; // MULTIPLICAMOS A MÉDIA POR 100 PARA PODERMOS PEGAR A PRIMEIRA CASA APÓS A VÍRUGLA QUANDO O NUMERO VIRAR INTEIRO
        mediaFINAL = (mediaFINAL * 10) / 26; // MULTIPLICAMOS A MÉDIA POR 100 PARA PODERMOS PEGAR A PRIMEIRA CASA APÓS A VÍRUGLA QUANDO O NUMERO VIRAR INTEIRO
      }

      if (freqBool || pt || mat) {
        if (itemList.id_registro) {
          const registroAprendizagem = {
            nome: `Acompanhamento de Diagnóstico - ${periodo} - Turma ${turma.ano_escolar}º ${turma.nome} - ${itemList.aluno.nome}`,
            tipo: 'Diagnóstico',
            periodo: periodo,
            aluno_turma_id: itemList.id,
            frequencia: data.registros[itemList.id].frequencia == undefined ? '' : data.registros[itemList.id].frequencia,
            media_lingua_portuguesa: ptMedBool ? mediaLP.toFixed(1) : null,
            media_matematica: matMedBool ? mediaMAT.toFixed(1) : null,
            media_final: ptMedBool && matMedBool ? mediaFINAL.toFixed(1) : null,
            // media_lingua_portuguesa: Math.trunc(mediaLP) / 10, // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
            // media_matematica: Math.trunc(mediaMAT) / 10, // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
            // media_final: Math.trunc(mediaFINAL) / 10, // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
            habilidades_registro_aprendizagem: habilidades_registro_aprendizagem,
            avaliacao_id: itemList.id_registro,
          }
          registrosAprendizagem.push(registroAprendizagem);
        } else {
          const registroAprendizagem = {
            nome: `Acompanhamento de Diagnóstico - ${periodo} - Turma ${turma.ano_escolar}º ${turma.nome} - ${itemList.aluno.nome}`,
            tipo: 'Diagnóstico',
            periodo: periodo,
            aluno_turma_id: itemList.id,
            frequencia: data.registros[itemList.id].frequencia == undefined ? '' : data.registros[itemList.id].frequencia,
            media_lingua_portuguesa: ptMedBool ? mediaLP.toFixed(1) : null,
            media_matematica: matMedBool ? mediaMAT.toFixed(1) : null,
            media_final: ptMedBool && matMedBool ? mediaFINAL.toFixed(1) : null,
            // media_lingua_portuguesa: Math.trunc(mediaLP) / 10, // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
            // media_matematica: Math.trunc(mediaMAT) / 10, // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
            // media_final: Math.trunc(mediaFINAL) / 10, // DIVIDIMOS POR 10 PARA CRIAR 1 CASA APÓS A VÍRGULA
            habilidades_registro_aprendizagem: habilidades_registro_aprendizagem,
          }
          registrosAprendizagem.push(registroAprendizagem);
        }
      }
    });
    try {
      await registroAprendizagemMethods.insertRegistroAprendizagemDiagnostico(registrosAprendizagem).catch((error) => {
        throw error;
      });
      limparMapCache();
      reset();
      enqueueSnackbar('Atualizado com sucesso!');
      router.push(paths.dashboard.registro_aprendizagem.root_diagnostico);
    } catch (error) {
      setErrorMsg('Erro ao Salvar o Registro de Aprendizagem Diagnóstica')
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <RegistroAprendizagemDiagnosticoNewEditTable turma={turma} periodo={periodo} alunosTurma={alunosTurma} habilidades={habilidades} handleTurma={handleTurma} prep={prep} />
      {/* <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mr: 3}}> 
        {habilidades_options.map((hab,index) => (
          hab === '' ? ('') :
          (<Label
            key={index}
            variant="soft"
            color={(hab === 'D' && 'success') ||
              (hab === 'DP' && 'warning') ||
              (hab === 'ND' && 'error') ||
              'default'}
            sx={{ mt: 3}}  
          >
            {(hab === 'D' && `${hab} = Domina`) ||
            (hab === 'DP' && `${hab} = Domina Parcialmente`) ||
            (hab === 'ND' && `${hab} = Não Domina`)}
          </Label>)
        ))}
      </Stack> */}
      <Stack alignItems="flex-end" sx={{ mt: 3, mr: 3 }}>
        {permissaoCadastrar &&
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            Salvar
          </LoadingButton>
        }
      </Stack>
    </FormProvider>
  );
}

RegistroAprendizagemDiagnosticoNewEditForm.propTypes = {
  turma: PropTypes.object,
  periodo: PropTypes.string,
  handleTurma: PropTypes.func,
  habilidades: PropTypes.array,
  alunosTurma: PropTypes.array,
  prep: PropTypes.object,
};