import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// _mock
import { _habilidades, _disciplinas, _periodos, _bimestres, _roles, USER_STATUS_OPTIONS, _ddzs, _tiposAvaliacao } from 'src/_mock';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFMultiSelect, RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { useBoolean } from 'src/hooks/use-boolean';
import { IconButton } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';
import turmaMethods from '../turma/turma-repository';
import disciplinaMethods from '../disciplina/disciplina-repository';
import habilidadeMethods from '../habilidade/habilidade-repository';
import ReactHookForm from '../_examples/extra/form-validation-view/react-hook-form';


// ----------------------------------------------------------------------

export default function NovaAvaliacaoForm({ open, onClose }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [turmaList, setTurmaList] = useState([]);
  const [habilidadeList, setHabilidadeList] = useState([]);
  useEffect(() => {
    turmaMethods.getAllTurmas().then(turmas => {
      setTurmaList(turmas.data);
    });
    //  habilidadeMethods.getAllHabilidades().then(habilidades => {
    //    setHabilidadeList(habilidades.data);
    //    console.log(habilidades);
    //   let opcoesHabilidade = [];
    //   for (var i = 0; i < habilidades.data.length; i++) {
    //     opcoesHabilidade[i] = {
    //       id: habilidades.data[i].id,
    //       nome: habilidades.data[i].nome,
    //     };
    //   };
    //})
  }, []);

  //console.log(disciplinaList);
  const [tipoAvaliacao, setTipoAvaliacao] = useState('');
  const [turma, setTurma] = useState('');
  const [bimestre, setBimestre] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [habilidades, setHabilidades] = useState([]);
  const [nomeAvaliacao, setNomeAvaliacao] = useState('');
  const [periodo, setPeriodo] = useState('');

  const tipoFase = useBoolean(false);
  const tipoComponente = useBoolean(false);
  const tipoDiagnostico = useBoolean(false);
  const turmaDefinida = useBoolean(false);
  const bimestreDefinido = useBoolean(false);
  const disciplinaDefinida = useBoolean(false);
  const habilidadeDefinida = useBoolean(false);
  const botaoAvancar = useBoolean(false);
  const nomeAvaliacaoDefinida = useBoolean(false);
  const periodoDefinido = useBoolean(false);

  const defaultValues = useMemo(
    () => ({
      turma: '',
      bimestre: '',
      habilidades: [],
      disciplina: '',
      periodo: '',
      nomeAvaliacao: '',
      teste: [],
    }),
    []
  );

  const methods = useForm({
    //resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const handleTipoAvaliacao = useCallback ((event) => {
    if (event.target.value == 'Avaliação de Fase') {
        tipoComponente.onFalse();
        tipoDiagnostico.onFalse();
        setTurma('');
        turmaDefinida.onFalse();
        setBimestre('');
        bimestreDefinido.onFalse();
        setDisciplina('');
        disciplinaDefinida.onFalse();
        setValue('habilidades', []);
        setHabilidades([]);
        habilidadeDefinida.onFalse;
        setNomeAvaliacao('');
        nomeAvaliacaoDefinida.onFalse();
        setPeriodo('');
        periodoDefinido.onFalse();
        botaoAvancar.onFalse();
        setTipoAvaliacao(event.target.value);
        tipoFase.onTrue();
    } else if (event.target.value == 'Avaliação de Componente Curricular') {
        tipoDiagnostico.onFalse();
        tipoFase.onFalse();
        setTurma('');
        turmaDefinida.onFalse();
        setBimestre('');
        bimestreDefinido.onFalse();
        setDisciplina('');
        disciplinaDefinida.onFalse();
        setValue('habilidades', []);
        setHabilidades([]);
        habilidadeDefinida.onFalse;
        setNomeAvaliacao('');
        nomeAvaliacaoDefinida.onFalse();
        setPeriodo('');
        periodoDefinido.onFalse();
        botaoAvancar.onFalse();
        setTipoAvaliacao(event.target.value);
        tipoComponente.onTrue();
    } else {
        tipoFase.onFalse();
        tipoComponente.onFalse();
        setTurma('');
        turmaDefinida.onFalse();
        setBimestre('');
        bimestreDefinido.onFalse();
        setDisciplina('');
        disciplinaDefinida.onFalse();
        setValue('habilidades', []);
        setHabilidades([]);
        habilidadeDefinida.onFalse;
        setNomeAvaliacao('');
        nomeAvaliacaoDefinida.onFalse();
        setPeriodo('');
        periodoDefinido.onFalse();
        botaoAvancar.onFalse();
        setTipoAvaliacao(event.target.value);
        tipoDiagnostico.onTrue();
    }
  }, [tipoComponente, tipoDiagnostico, tipoFase, turmaDefinida, botaoAvancar, disciplinaDefinida, habilidadeDefinida, nomeAvaliacaoDefinida, periodoDefinido]);

  const handleTurma = useCallback ((event) => {
    setBimestre('');
    bimestreDefinido.onFalse();
    setDisciplina('');
    disciplinaDefinida.onFalse();
    botaoAvancar.onFalse();
    setTurma(event.target.value);
    turmaDefinida.onTrue();
    if (tipoDiagnostico.value && periodoDefinido.value) {
      botaoAvancar.onTrue()
    }
  }, [turmaDefinida, bimestreDefinido, botaoAvancar, disciplinaDefinida]);

  const handleBimestre = useCallback ((event) => {
    setBimestre(event.target.value);
    bimestreDefinido.onTrue();
    if (tipoFase.value && turmaDefinida.value) {
      botaoAvancar.onTrue()
    }
  }, [bimestreDefinido, botaoAvancar]);

  const handleDisciplina = useCallback ((event) => {
    setDisciplina(event.target.value);
    disciplinaDefinida.onTrue();
    setValue('habilidades', event.target.value);
    setHabilidades([]);
    habilidadeDefinida.onFalse();
    setNomeAvaliacao('');
    nomeAvaliacaoDefinida.onFalse();
    botaoAvancar.onFalse();
  }, [disciplinaDefinida, habilidadeDefinida, botaoAvancar, nomeAvaliacaoDefinida]);

  const handleHabilidade = useCallback((event) => {
    setValue('habilidades', event.target.value);
    setHabilidades(event.target.value);
    habilidadeDefinida.onTrue();
    setNomeAvaliacao('');
    nomeAvaliacaoDefinida.onFalse();
    botaoAvancar.onFalse();
  }, [setValue, habilidadeDefinida, botaoAvancar, disciplinaDefinida, nomeAvaliacaoDefinida]);

  const handleNomeAvaliacao = useCallback((event) => {
    setNomeAvaliacao(event.target.value);
    nomeAvaliacaoDefinida.onTrue();
    if (tipoComponente.value && turmaDefinida.value && disciplinaDefinida.value && habilidadeDefinida.value) {
      botaoAvancar.onTrue()
    }
  }, [nomeAvaliacaoDefinida, botaoAvancar]);

  const handlePeriodo = useCallback((event) => {
    setPeriodo(event.target.value);
    periodoDefinido.onTrue();
    setTurma('');
    turmaDefinida.onFalse();
    botaoAvancar.onFalse();
  }, [turmaDefinida, periodoDefinido, botaoAvancar]);

  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
    escola: Yup.string(),
  });

  const currentUser = [];
  // console.log(habilidades);
  

  const selectTurma = () => {
    return (
      <RHFSelect name="turma" label="Turma" onChange={handleTurma} value={turma} > 
        {turmaList.map((turma) => (
          <MenuItem key={turma.id} value={turma.id}>
            {`${turma.ano_escolar}º ${turma.nome}`}
          </MenuItem>
        ))}  
      </RHFSelect>
    )
  }

  const onSubmit = handleSubmit(async (data) => {
    console.warn('form data');
    console.table(data);
    console.log('tipoFase', tipoFase.value);
    console.log('tipoComponente', tipoComponente.value);
    console.log('tipoDiagnostico', tipoDiagnostico.value);
    console.log('periodo', periodo);
    console.log('turma', turma);
    console.log('bimestre', bimestre);
    console.log('periodo', periodo);
    console.log('disciplina', disciplina);
    console.log('habilidades', habilidades);
    
    if(tipoFase.value){
      router.push(paths.dashboard.registro_aprendizagem.edit_fase(turma, bimestre));
    }
    // if (tipoFase.value) {
    //   console.log(data);
    // } else if (tipoComponente.value) {
    //   console.log(data);
    // } else {
    //   console.log(data);
    // }
    try {
      //await userMethods.updateUserById(currentUser.id, novoUsuario);   
      //reset() 
      //onClose();
      //enqueueSnackbar('Atualizado com sucesso!');
      //window.location.reload();

      // console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={false}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Registro de Avaliação</DialogTitle>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent>
          <br></br>
          <Box
            rowGap={3}
            display="grid"
          >

            <RHFSelect name="tipo" label="Tipo" onChange={handleTipoAvaliacao} value={tipoAvaliacao} multiple>
              {_tiposAvaliacao.map((tipo_avaliacao) => (
                <MenuItem key={tipo_avaliacao} value={tipo_avaliacao} >
                  {tipo_avaliacao}
                </MenuItem>
              ))}
            </RHFSelect>

            { tipoFase.value && ( selectTurma() ) }

            { tipoComponente.value && ( selectTurma() ) }

            { tipoDiagnostico.value && (<RHFSelect name="periodo" label="Período" onChange={handlePeriodo} value={periodo}> 
              {_periodos.map((periodo) => (
                <MenuItem key={periodo} value={periodo}>
                  {periodo}
                </MenuItem>
              ))}
              </RHFSelect>
            )}

            { (tipoFase.value && turmaDefinida.value) && (
              <RHFSelect name="bimestre" label="Bimestre" onChange={handleBimestre} value={bimestre}> 
              {_bimestres.map((bimestre) => (
                <MenuItem key={bimestre} value={bimestre}>
                  {`${bimestre}º Bimestre`}
                </MenuItem>
              ))}
              </RHFSelect>
            ) }

            { (tipoComponente.value && turmaDefinida.value) && (
              <RHFSelect name="disciplina" label="Disciplina" onChange={handleDisciplina} value={disciplina}> 
              {_disciplinas.map((disciplina) => (
                <MenuItem key={disciplina} value={disciplina}>
                  {disciplina}
                </MenuItem>
              ))}
              </RHFSelect>
            )}

            { (tipoComponente.value && turmaDefinida.value && disciplinaDefinida.value) && (
            <RHFMultiSelect
              chip
              checkbox
              name="habilidades"
              label="Habilidades"
              options={_habilidades}
              value={habilidades}
              onChange={handleHabilidade}
            /> 
            ) }

            { (tipoComponente.value && turmaDefinida.value && disciplinaDefinida.value && habilidadeDefinida.value) && (
               <RHFTextField name="nomeAvaliacao" label="Digite o nome da avaliação" onChange={handleNomeAvaliacao} value={nomeAvaliacao}/>
            ) }

          { (tipoDiagnostico.value && periodoDefinido.value) && (selectTurma()) }

          </Box>
        </DialogContent>
        <DialogActions>
        {botaoAvancar.value && (
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Avançar
            </LoadingButton>   
        )}
        </DialogActions>

      </FormProvider>
    </Dialog>
  );
}

NovaAvaliacaoForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
