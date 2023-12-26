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
import { _habilidades, _roles, _ddzs, _escolas, habilidades_options } from 'src/_mock';
import { useEffect, useState } from 'react';
import RegistroAprendizagemDiagnosticoNewEditTable from './registro-aprendizagem-diagnostico-new-edit-table';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import Alert from '@mui/material/Alert';
import Label from 'src/components/label';
import { Box } from '@mui/material';


// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditForm({ turma, periodo, handleTurma, habilidades, alunosTurma, prep }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });

  const defaultValues = {
    registros: []
  }

  const methods = useForm({
    //resolver: yupResolver(NewUserSchema),
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
      alunosTurma.forEach((alunoTurma) => {
        novosRegistros[alunoTurma.id] = {
          habilidades_registro_aprendizagem: alunoTurma.mapHabilidades,
          id_aluno_turma: alunoTurma.id,
          promo_ano_anterior: alunoTurma.promo_ano_anterior,
        }       
      })
      setValue('registros', novosRegistros); 
    }
  }, [alunosTurma, turma]);

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    console.log(data)
    const registrosAprendizagem = [];
    alunosTurma.forEach((itemList) => {
      const dataHabilidades = data.registros[itemList.id].habilidades_registro_aprendizagem;
      const habilidadesRegistroAprendizagem = [];
      for (let item in dataHabilidades) {
        if (typeof (dataHabilidades[item]) == 'string') {
          if (itemList.id_habilidades_registro_aprendizagem) {
            let encontrada = itemList.id_habilidades_registro_aprendizagem[item];
            const habilidadeRegistroAprendizagem = {
              habilidade_id: item,
              nota: dataHabilidades[item],
              id: encontrada,
            }
            habilidadesRegistroAprendizagem.push(habilidadeRegistroAprendizagem);
          } else {
            const habilidadeRegistroAprendizagem = {
              habilidade_id: item,
              nota: dataHabilidades[item],
            }
            habilidadesRegistroAprendizagem.push(habilidadeRegistroAprendizagem);
          }
        }
      }
      if (itemList.id_registro) {
        const registroAprendizagem = {
          nome: `Avaliação de Diagnóstico - ${periodo} - Turma ${turma.ano_escolar}º ${turma.nome} - ${itemList.aluno.nome}`,
          tipo: 'Diagnóstico',
          periodo: periodo,
          aluno_turma_id: itemList.id,
          promo_ano_anterior: data.registros[itemList.id].promo_ano_anterior == undefined ? '' : data.registros[itemList.id].promo_ano_anterior,
          habilidades_registro_aprendizagem: habilidadesRegistroAprendizagem,
          avaliacao_id: itemList.id_registro,
        }
        registrosAprendizagem.push(registroAprendizagem);
      } else {
        const registroAprendizagem = {
          nome: `Avaliação de Diagnóstico - ${periodo} - Turma ${turma.ano_escolar}º ${turma.nome} - ${itemList.aluno.nome}`,
          tipo: 'Diagnóstico',
          periodo: periodo,
          aluno_turma_id: itemList.id,
          promo_ano_anterior: data.registros[itemList.id].promo_ano_anterior == undefined ? '' : data.registros[itemList.id].promo_ano_anterior,
          habilidades_registro_aprendizagem: habilidadesRegistroAprendizagem,
        }
        registrosAprendizagem.push(registroAprendizagem);
      }
    });
    try {
      await registroAprendizagemMethods.insertRegistroAprendizagemDiagnostico(registrosAprendizagem).catch((error) => {
        throw error;
      });
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
      <RegistroAprendizagemDiagnosticoNewEditTable turma={turma} alunosTurma={alunosTurma} habilidades={habilidades} handleTurma={handleTurma} prep={prep}/>
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mr: 3}}> 
        {habilidades_options.map((hab) => (
          hab === '' ? ('') :
          (<Label
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
      </Stack>
      <Stack alignItems="flex-end" sx={{ mt: 3, mr: 3 }}>
        <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
          Salvar
        </LoadingButton>
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