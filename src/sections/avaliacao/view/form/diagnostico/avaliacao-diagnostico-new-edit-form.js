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
import AvaliacaoDiagnosticoNewEditTable from './avaliacao-diagnostico-new-edit-table';
import avaliacaoMethods from 'src/sections/avaliacao/avaliacao-repository';
import { AvaliacaoContext } from 'src/sections/avaliacao/context/avaliacao-context';
import Alert from '@mui/material/Alert';
import Label from 'src/components/label';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { el, pt } from 'date-fns/locale';
import { capitalize } from 'lodash';


// ----------------------------------------------------------------------

export default function AvaliacaoDiagnosticoNewEditForm({ turma, periodo, handleTurma, habilidades, alunosTurma, versaoAvaliacao, prep }) {
  const { checkPermissaoModulo } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const router = useRouter();
  const { limparMapCache } = useContext(AvaliacaoContext);
  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });
  const permissaoCadastrar = checkPermissaoModulo("avaliacao", "cadastrar");
  const defaultValues = {
    registros: []
  }

  const methods = useForm({
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
    if (prep && alunosTurma.length) {
      const novosRegistros = [];
      const csv_header = ["Nome","Frequência"];
      let questoes;
      if (versaoAvaliacao) {
        questoes = versaoAvaliacao.questoes;
        if (questoes) {
          questoes = questoes.sort((a, b) => a.numero_questao - b.numero_questao);
          for (const questao of questoes) {
            csv_header.push(questao.titulo ?? 'R'+questao.numero_questao.toString());
          }
        }
      }
      csv_header.push("Média LP");
      csv_header.push("Média MAT");
      csv_header.push("Média Final");
      let csv_dat = [csv_header];
      alunosTurma.forEach((alunoTurma) => {
        let nova_linha_csv = [];
        alunoTurma.aluno.nome ? nova_linha_csv.push(alunoTurma.aluno.nome) : nova_linha_csv.push('');
        alunoTurma.frequencia ? nova_linha_csv.push(capitalize(alunoTurma.frequencia)) : nova_linha_csv.push('');
        if (alunoTurma.r) {
          for (const questao of questoes) {
            const alternativaId = alunoTurma.r[questao.numero_questao];
            if (alternativaId) {
              const alternativa = questao.alternativas.find((alternativa) => alternativa.id == alternativaId);
              if (alternativa) {
                nova_linha_csv.push(alternativa.resposta.toString());
                continue;
              }
            }
            nova_linha_csv.push('');
          }
        }
        alunoTurma.media_lingua_portuguesa ? nova_linha_csv.push(alunoTurma.media_lingua_portuguesa.toString()) : nova_linha_csv.push('');
        alunoTurma.media_matematica ? nova_linha_csv.push(alunoTurma.media_matematica.toString()) : nova_linha_csv.push('');
        alunoTurma.media_final ? nova_linha_csv.push(alunoTurma.media_final.toString()) : nova_linha_csv.push('');
        csv_dat.push(nova_linha_csv)
        novosRegistros[alunoTurma.id] = {
          habilidades_registro_aprendizagem: alunoTurma.mapHabilidades,
          id_aluno_turma: alunoTurma.id,
          promo_ano_anterior: alunoTurma.promo_ano_anterior,
          frequencia: alunoTurma.frequencia ? capitalize(alunoTurma.frequencia) : '',
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
    const avaliacoes = [];
    let somaPesosPt = 0;
    let somaPesosMat = 0;
    let somaPesosFinal = 0;
    for (const questao of versaoAvaliacao.questoes) {
      somaPesosPt = questao.disciplina.nome == 'Língua Portuguesa' ? somaPesosPt + questao.peso : somaPesosPt;
      somaPesosMat = questao.disciplina.nome == 'Matemática' ? somaPesosMat + questao.peso : somaPesosMat;
      somaPesosFinal = somaPesosFinal + questao.peso;
    }
    alunosTurma.forEach((alunoTurma) => {
      if (!data.registros[alunoTurma.id]) {
        return;
      }
      let frequencia = data.registros[alunoTurma.id].frequencia
      let freqBool = false;
      if (frequencia != undefined && frequencia != '') {
        freqBool = true;
      }
      let respostas_aluno = [];
      let pt = false;
      let mat = false;
      let mediaLP = 0;
      let mediaMAT = 0;
      let mediaFINAL = 0;
      let ptMedBool = true;
      let matMedBool = true;
      const dataR = data.registros[alunoTurma.id].r;
      if (dataR != undefined) {
        for (const questao of versaoAvaliacao.questoes) {
          let alternativaId = dataR[questao.numero_questao];
          if (alternativaId) {
            let alternativa = questao.alternativas.find((alternativa) => alternativa.id == alternativaId);
            if (questao.disciplina.nome == 'Língua Portuguesa') {
              pt = true;
              mediaLP += alternativa.valor_resposta;
            } else if (questao.disciplina.nome == 'Matemática') {
              mat = true;
              mediaMAT += alternativa.valor_resposta;
            }
            mediaFINAL += alternativa.valor_resposta;
            respostas_aluno.push({
              questao_id: questao.id,
              alternativa_id: alternativaId,
            });
          } else if (questao.disciplina.nome == 'Língua Portuguesa') {
            ptMedBool = false;
          } else if (questao.disciplina.nome == 'Matemática') {
            matMedBool = false;
          }
        }
      }

      if (ptMedBool) {
        mediaLP = mediaLP *10 / somaPesosPt;
      }
      if (matMedBool) { 
        mediaMAT = mediaMAT *10/ somaPesosMat;
      }
      if (ptMedBool && matMedBool) {
        mediaFINAL = mediaFINAL *10/ somaPesosFinal;
      }

      if (freqBool || pt || mat) {
        const avaliacaoAluno = {
          versao_avaliacao_id: versaoAvaliacao.id,
          periodo: periodo,
          aluno_turma_id: alunoTurma.id,
          frequencia: data.registros[alunoTurma.id].frequencia == undefined ? '' : data.registros[alunoTurma.id].frequencia,
          media_lingua_portuguesa: ptMedBool ? mediaLP.toFixed(1) : null,
          media_matematica: matMedBool ? mediaMAT.toFixed(1) : null,
          media_final: ptMedBool && matMedBool ? mediaFINAL.toFixed(1) : null,
          respostaaluno_set: respostas_aluno,
        }
        avaliacoes.push(avaliacaoAluno);
      }
    });
    try {
      await avaliacaoMethods.insertAvaliacaoDiagnostico(avaliacoes).catch((error) => {
        throw error;
      });
      limparMapCache();
      reset();
      enqueueSnackbar('Atualizado com sucesso!');
      router.push(paths.dashboard.avaliacao.root_diagnostico);
    } catch (error) {
      setErrorMsg('Erro ao salvar Avaliação Diagnóstica')
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <AvaliacaoDiagnosticoNewEditTable turma={turma} periodo={periodo} alunosTurma={alunosTurma} habilidades={habilidades} handleTurma={handleTurma} versaoAvaliacao={versaoAvaliacao} prep={prep} />
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

AvaliacaoDiagnosticoNewEditForm.propTypes = {
  turma: PropTypes.object,
  periodo: PropTypes.string,
  handleTurma: PropTypes.func,
  habilidades: PropTypes.array,
  alunosTurma: PropTypes.array,
  prep: PropTypes.object,
};