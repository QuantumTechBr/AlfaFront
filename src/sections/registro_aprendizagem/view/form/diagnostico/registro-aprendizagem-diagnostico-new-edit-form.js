import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
import { countries } from 'src/assets/data';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { _habilidades, _roles, USER_STATUS_OPTIONS, _ddzs, _escolas } from 'src/_mock';
//import userMethods from './user-repository';
import { useEffect, useState, useContext } from 'react';
import { TurmasContext } from '../../../../turma/context/turma-context';
import alunoMethods from '../../../../aluno/aluno-repository';
import habilidadeMethods from '../../../../habilidade/habilidade-repository';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import RegistroAprendizagemDiagnosticoNewEditTable from './registro-aprendizagem-diagnostico-new-edit-table';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';


// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditForm({ turma, periodo, handleTurma, habilidades, alunosTurma }) {
  const router = useRouter();

  const [alunosTurmaEdit, setAlunosTurmaEdit] = useState([]);
  // const [montarTabela, setMontarTabela] = useState(false);

 // const [defaultValues, setDefaultValues] = useState([]);

  // useEffect(() => {
  //   registroAprendizagemMethods.getRegistroAprendizagemDiagnosticoByTurmaId(turma.id).then(registros => {
  //     setAlunosTurmaEdit(registros.data.filter((registro) => registro.periodo == periodo));
  //   })
    // setMontarTabela(false);
    // setDefaultValues([]);
  // }, [turma, periodo]); 

  // useEffect(() => {
  //   reset()
  // }, [alunosTurma, turma, periodo]);


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

  // const defineDefaultValues = (alunosTurma) => {
  //   console.log('fora')
  //   if (alunosTurma.length) {
  //     console.log('dentro')
  //     //console.log(alunosTurmaEdit);
  //     //console.log('1. new edit form - alunosTurma:', alunosTurma);
  //     const novosRegistros = [];
  //     alunosTurma.forEach((alunoTurma) => {
  //       novosRegistros[alunoTurma.id] = {
  //         habilidades_registro_aprendizagem: alunoTurma.mapHabilidades,
  //         id_aluno_turma: alunoTurma.id,
  //         promo_ano_anterior: alunoTurma.promo_ano_anterior,
  //       }
  //       //console.log('novosRegistros', novosRegistros);
  //       //setDefaultValues(novosRegistros);
  //       //setValue('registros', novosRegistros); 
  //       })
  //       console.log('novosRegistros', novosRegistros);
  //       setValue('registros', novosRegistros);
  //     return novosRegistros;
  //   }
  // }


  useEffect(() => {
    console.log('1. new edit form - alunosTurma:', alunosTurma);
    if (alunosTurma.length) {
      //console.log(alunosTurmaEdit);
      //console.log('1. new edit form - alunosTurma:', alunosTurma);
      const novosRegistros = [];
      alunosTurma.forEach((alunoTurma) => {
        novosRegistros[alunoTurma.id] = {
          habilidades_registro_aprendizagem: alunoTurma.mapHabilidades,
          id_aluno_turma: alunoTurma.id,
          promo_ano_anterior: alunoTurma.promo_ano_anterior,
        }
        //setDefaultValues(novosRegistros);
        
      })
      console.log('novosRegistros', novosRegistros);
      setValue('registros', novosRegistros); 
    }
      
        // console.log('novosRegistros');
        // console.table(novosRegistros);
        // setDefaultValues(novosRegistros);
        // setValue('registros', novosRegistros);
        // console.log('2. new edit form - defaultValues:', defaultValues)
        // setMontarTabela(true);
      


    
  }, [alunosTurma, turma]);



  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    // console.log('defaultValues');
    // console.log(defaultValues);
    console.log('Data');
    console.log(data);
    console.log('alunosTurmaSubmit', alunosTurma);

    const registrosAprendizagem = [];
    alunosTurma.forEach((itemList) => {
      // console.log(data.registros[itemList.id].habilidades_registro_aprendizagem)
      const dataHabilidades = data.registros[itemList.id].habilidades_registro_aprendizagem;
      const habilidadesRegistroAprendizagem = [];
      // data.registros[itemList.id].habilidades_registro_aprendizagem.forEach((value, key) => {
      //   console.log(value);
      //   console.log(key);
      // })
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
          promo_ano_anterior: data.registros[itemList.id].promo_ano_anterior,
          habilidades_registro_aprendizagem: habilidadesRegistroAprendizagem,
          id: itemList.id_registro,
        }
        registrosAprendizagem.push(registroAprendizagem);
      } else {
        const registroAprendizagem = {
          nome: `Avaliação de Diagnóstico - ${periodo} - Turma ${turma.ano_escolar}º ${turma.nome} - ${itemList.aluno.nome}`,
          tipo: 'Diagnóstico',
          periodo: periodo,
          aluno_turma_id: itemList.id,
          promo_ano_anterior: data.registros[itemList.id].promo_ano_anterior,
          habilidades_registro_aprendizagem: habilidadesRegistroAprendizagem,
        }
        registrosAprendizagem.push(registroAprendizagem);
      }
    });
    console.log("json submit", registrosAprendizagem);
    try {
      await registroAprendizagemMethods.insertRegistroAprendizagemDiagnostico(registrosAprendizagem);
      reset();
      enqueueSnackbar('Atualizado com sucesso!');
      //enqueueSnackbar('Criado com sucesso!');
      router.push(paths.dashboard.registro_aprendizagem.root_diagnostico);
      //console.info('DATA', data);
    } catch (error) {
        console.log('Erro ao Salvar');
        console.error(error);
    }
  });

  /* const handleDrop = useCallback(
     (acceptedFiles) => {
       const file = acceptedFiles[0];
 
       const newFile = Object.assign(file, {
         preview: URL.createObjectURL(file),
       });
 
       if (file) {
         setValue('avatarUrl', newFile, { shouldValidate: true });
       }
     },
     [setValue]
   );*/

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <RegistroAprendizagemDiagnosticoNewEditTable turma={turma} alunosTurma={alunosTurma} habilidades={habilidades} handleTurma={handleTurma} />
      <Stack alignItems="flex-end" sx={{ mt: 3 }}>
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
};