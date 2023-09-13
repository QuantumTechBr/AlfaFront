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
import RegistroAprendizagemDiagnosticoNewEditTable from '../../lists/diagnostico/registro-aprendizagem-diagnostico-new-edit-table';


// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditForm({ turma, periodo, handleTurma }) {
  const router = useRouter();
  const [alunos, setAlunos] = useState([]);
  const [habilidades, setHabilidades] = useState([]);

  const currentUser = [];
  useEffect(() => {
    habilidadeMethods.getAllHabilidades().then(habilidades =>{
      let habilidade_turma = habilidades.data.filter((habilidade) => String(habilidade.ano_escolar) == String(turma.ano_escolar));
      setHabilidades(habilidade_turma);
    })
  }, [turma]);

  //console.log(turma);
  

  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });
  
  const defaultValues = useMemo(
    () => ({
      turma: turma?.id || '',
      promo_ano_anterior: turma?.email || '',
    }),
    [turma]
  );

  const methods = useForm({
    //resolver: yupResolver(NewUserSchema),
    defaultValues,
  });


  const {
    register,
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    console.log('oi');
    console.log(data);
    // try {
    //   var novoUsuario = {}
    //   if (data.senha) {
    //     novoUsuario = {
    //       nome:  data.nome,
    //       email: data.email,
    //       senha: data.senha, 
    //       login: data.email,
    //       status: data.status,
    //     }
    //   } else {
    //     novoUsuario = {
    //       nome:  data.nome,
    //       email: data.email,
    //       login: data.email,
    //       status: data.status,
    //     }
    //   }
    //   if (currentUser) {
    //     await userMethods.updateUserById(currentUser.id, novoUsuario);
        
    //   } else {
    //     novoUsuario.permissao_usuario = [{
    //       id: '91bbd3c9-61fa-4987-b31e-2a41f623e002',
    //       created_at: '2023-08-23 15:06:10',
    //       updated_at: null,
    //       deleted_at: null,
    //       nome: 'SUPERADMIN',
    //       permissao_modulo: [],
    //     }];
    //     await userMethods.insertUser(novoUsuario);
    //   }
    //   reset();
    //   enqueueSnackbar(currentUser ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
    //   router.push(paths.dashboard.user.list);
    //   console.info('DATA', data);
    // } catch (error) {
    //   console.error(error);
    // }
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
      <RegistroAprendizagemDiagnosticoNewEditTable turma={ turma } habilidades={habilidades} handleTurma={handleTurma}/>
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
};
