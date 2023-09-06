import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useState } from 'react';
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
// _mock
import { _roles, USER_STATUS_OPTIONS, _ddzs, _escolas, _tiposAvaliacao } from 'src/_mock';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { useBoolean } from 'src/hooks/use-boolean';


// ----------------------------------------------------------------------

export default function NovaAvaliacaoForm({ currentUser, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

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

  const handleTipoAvaliacao = useCallback ((event) => {
    console.log(event);
    if (event.target.value == 'Avaliação de Fase') {
        tipoComponente.onFalse();
        tipoDiagnostico.onFalse();
        setTurma('');
        turmaDefinida.onFalse();
        setBimestre('');
        bimestreDefinido.onFalse();
        setDisciplina('');
        disciplinaDefinida.onFalse();
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
    setHabilidades([]);
    habilidadeDefinida.onFalse();
    setNomeAvaliacao('');
    nomeAvaliacaoDefinida.onFalse();
    botaoAvancar.onFalse();
  }, [disciplinaDefinida, habilidadeDefinida, botaoAvancar, nomeAvaliacaoDefinida]);

  const handleHabilidade = useCallback((event) => {
    setHabilidades(event.target.value);
    habilidadeDefinida.onTrue();
    setNomeAvaliacao('');
    nomeAvaliacaoDefinida.onFalse();
    botaoAvancar.onFalse();
  }, [habilidadeDefinida, botaoAvancar, disciplinaDefinida, nomeAvaliacaoDefinida]);

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

  const defaultValues = useMemo(
    () => ({
      nome: currentUser?.nome || '',
      email: currentUser?.email || '',
      senha: currentUser?.senha || '',
      funcao: currentUser?.funcao || '',
      funcao_usuario: currentUser?.funcao_usuario || '',
      status: (currentUser?.status ? "true" : "false") || '',
      ddz: currentUser?.ddz || '',
      escola: currentUser?.escola || '',
    }),
    [currentUser]
  );

  const selectTurma = () => {
    return (
      <RHFSelect name="turma" label="Turma" onChange={handleTurma} value={turma} > 
        {USER_STATUS_OPTIONS.map((turma) => (
          <MenuItem key={turma.value} value={turma.value}>
           {turma.label}
          </MenuItem>
        ))}  
      </RHFSelect>
    )
  }

  const methods = useForm({
    //resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      var novoUsuario = {}
      if (data.senha) {
        novoUsuario = {
          nome:  data.nome,
          email: data.email,
          senha: data.senha, 
          login: data.nome,
          status: data.status,
        }
      } else {
        novoUsuario = {
          nome:  data.nome,
          email: data.email,
          login: data.nome,
          status: data.status,
        }
      }
      await userMethods.updateUserById(currentUser.id, novoUsuario);   
      reset() 
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();

      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

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
        <DialogTitle>Registro de Avaliação</DialogTitle>

        <DialogContent>
          <br></br>
          <Box
            rowGap={3}
            display="grid"
          >

            <RHFSelect name="tipo" label="Tipo" onChange={handleTipoAvaliacao} value={tipoAvaliacao}>
              {_tiposAvaliacao.map((tipo_avaliacao) => (
                <MenuItem key={tipo_avaliacao} value={tipo_avaliacao} >
                  {tipo_avaliacao}
                </MenuItem>
              ))}
            </RHFSelect>

            { tipoFase.value && ( selectTurma() ) }

            { tipoComponente.value && ( selectTurma() ) }

            { tipoDiagnostico.value && (<RHFSelect name="periodo" label="Período" onChange={handlePeriodo} value={periodo}> 
              {USER_STATUS_OPTIONS.map((periodo) => (
                <MenuItem key={periodo.value} value={periodo.value}>
                  {periodo.label}
                </MenuItem>
              ))}
              </RHFSelect>
            )}

            { (tipoFase.value && turmaDefinida.value) && (
              <RHFSelect name="bimestre" label="Bimestre" onChange={handleBimestre} value={bimestre}> 
              {USER_STATUS_OPTIONS.map((bimestre) => (
                <MenuItem key={bimestre.value} value={bimestre.value}>
                  {bimestre.label}
                </MenuItem>
              ))}
              </RHFSelect>
            ) }

            { (tipoComponente.value && turmaDefinida.value) && (
              <RHFSelect name="disciplina" label="Disciplina" onChange={handleDisciplina} value={disciplina}> 
              {USER_STATUS_OPTIONS.map((disciplina) => (
                <MenuItem key={disciplina.value} value={disciplina.value}>
                  {disciplina.label}
                </MenuItem>
              ))}
              </RHFSelect>
            )}

            { (tipoComponente.value && turmaDefinida.value && disciplinaDefinida.value) && (
              <RHFSelect name="habilidade" label="Habilidades" onChange={handleHabilidade} value={habilidades}> 
              {USER_STATUS_OPTIONS.map((habilidade) => (
                <MenuItem key={habilidade.value} value={habilidade.value}>
                  {habilidade.label}
                </MenuItem>
              ))}
              </RHFSelect>
            ) }

            { (tipoComponente.value && turmaDefinida.value && disciplinaDefinida.value && habilidadeDefinida.value) && (
              <RHFSelect name="nomeAvaliacao" label="Digite o nome da avaliação" onChange={handleNomeAvaliacao} value={nomeAvaliacao}> 
              {USER_STATUS_OPTIONS.map((nomeAvaliacao) => (
                <MenuItem key={nomeAvaliacao.value} value={nomeAvaliacao.value}>
                  {nomeAvaliacao.label}
                </MenuItem>
              ))}
              </RHFSelect>
            ) }


          { (tipoDiagnostico.value && periodoDefinido.value) && (selectTurma()) }

           {/* <RHFSelect name="ddz" label="DDZ">
              {_ddzs.map((ddz) => (
                <MenuItem key={ddz} value={ddz}>
                  {ddz}
                </MenuItem>
              ))}
              </RHFSelect> */}


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
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
