import PropTypes from 'prop-types';
import { useMemo, useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'src/hooks/use-boolean';

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
import RHFAutocomplete from '../../components/hook-form/rhf-autocomplete';
// components
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { EscolasContext } from '../escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { FuncoesContext } from '../funcao/context/funcao-context';
import { AuthContext } from 'src/auth/context/alfa';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { AnosLetivosContext } from '../ano_letivo/context/ano-letivo-context';

import LoadingBox from 'src/components/helpers/loading-box';
import _ from 'lodash';
import { id } from 'date-fns/locale';

// ----------------------------------------------------------------------

export default function UserFuncaoEditModal({ row, open, onClose, onSave, funcoesOptions }) {
  const [funcaoUsuario, setFuncaoUsuario] = useState();
  const contextReady = useBoolean(false);
  const [escolasFiltered, setEscolasFiltered] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const { user: loggedUser } = useContext(AuthContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const {funcoes, buscaFuncoes} = useContext(FuncoesContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { turmas, buscaTurmas, deleteProfessorTurma, postProfessorTurma } = useContext(TurmasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const [turmasProfessorBanco, setTurmasProfessorBanco] = useState([]);
  const [loadingTurmasProfessor, setLoadingTurmasProfessor] = useState(false);

  const funcoesEscola = ['DIRETOR', 'PROFESSOR', 'PEDAGOGO', 'ASSESSOR DE GESTAO', 'ASSESSOR PEDAGOGICO']
  const funcoesZona = ['ASSESSOR DDZ', 'COORDENADOR DE GESTAO']

  function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  const resolveUsuarioId = (usuarioData) =>
    usuarioData?.user_id ?? usuarioData?.usuario_id ?? usuarioData?.usuario?.id ?? usuarioData?.user?.id ?? usuarioData?.id;

  useEffect(() => {
    contextReady.onFalse();
    setErrorMsg('');
    if (open) {
      Promise.all([
        buscaEscolas()
          .catch((error) => {
            setErrorMsg('Erro de comunicação com a API de escolas');
          }),
        buscaZonas()
          .catch((error) => {
            setErrorMsg('Erro de comunicação com a API de zonas');
          }),
        buscaFuncoes()
          .catch((error) => {
            setErrorMsg('Erro de comunicação com a API de funções');
          }),
        buscaTurmas({ force: false })
          .catch((error) => {
            setErrorMsg('Erro de comunicação com a API de turmas');
          }),
        buscaAnosLetivos()
          .catch((error) => {
            setErrorMsg('Erro de comunicação com a API de anos letivos');
          }),
      ]).then(() => {
        contextReady.onTrue();
        if (row) {
          setFuncaoUsuario({
            ...row,
            funcao: row.funcao?.nome_exibicao ?? row.funcao?.nome ?? '',
            escola: row.escola?.nome ? { label: row.escola.nome, id: row.escola.id } : '',
            zona: row.zona?.nome ? { label: row.zona.nome, id: row.zona.id } : '',
          });

        }
      });
    }
  }, [buscaEscolas, buscaZonas, buscaFuncoes, buscaTurmas, buscaAnosLetivos, open, row]);

  useEffect(() => {
    if (!open) {
      setTurmasProfessorBanco([]);
      return;
    }
    
    if (row?.professorTurmas) {
      setTurmasProfessorBanco(Array.isArray(row.professorTurmas) ? row.professorTurmas : []);
    }
  }, [open, row]);

  useEffect(() => {
    const escolasAC = [];
    escolas.map((escola) => {
      const ea = {
        label: escola.nome,
        id: escola.id,
      }
      escolasAC.push(ea)
    })
    setEscolasFiltered(escolasAC);
  }, [escolas]);


  const defaultValues = useMemo(
    () => ({
      id: funcaoUsuario?.id ?? '',
      user_id: funcaoUsuario?.user_id ?? '',
      funcao: funcaoUsuario?.nome_exibicao ?? funcaoUsuario?.funcao?.nome ?? '',
      escola: funcaoUsuario?.escola ?? '',
      zona: funcaoUsuario?.zona?.id ?? '',
      turmas: [],
    }),
    [funcaoUsuario]
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    setValue,    formState: { isSubmitting },
    control,
  } = methods;

  const selectedFuncao = watch('funcao'); // Watch the 'funcao' field for changes
  const selectedEscola = watch('escola');

  const turmasOptions = useMemo(() => {
    const escolaId = selectedEscola?.id ?? null;
    if (!escolaId) {
      return [];
    }
    const returnTurmas = (turmas ?? [])
      .filter((turma) => turma?.escola_id === escolaId)
      .map((turma) => ({
        id: turma.id,
        label: `${turma?.ano_escolar ? `${turma.ano_escolar}` : ''}${turma.nome ?? ''}${turma?.turno ? ` - ${turma.turno}` : ''}${turma?.ano_id ? ` - ${anosLetivos.find(ano => ano.id == turma.ano_id)?.ano ?? ''}` : ''}`,
        turma,
        ano_letivo: anosLetivos.find(ano => ano.id == turma.ano_id)?.ano ?? '',
      })).sort((a, b) => {
        if (a.ano_letivo > b.ano_letivo) return -1;
        if (a.ano_letivo < b.ano_letivo) return 1;
        if (a.turma.ano_escolar < b.turma.ano_escolar) return -1;
        if (a.turma.ano_escolar > b.turma.ano_escolar) return 1;
        if (a.turma.nome < b.turma.nome) return -1;
        if (a.turma.nome > b.turma.nome) return 1;
        return 0;
      });
    return returnTurmas;
  }, [turmas, selectedEscola]);

  useEffect(() => {
    if (funcaoUsuario) {
      reset(defaultValues);
    }
  }, [funcaoUsuario, defaultValues, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const escolaId = selectedEscola?.id ?? null;
    if (!escolaId) {
      setValue('turmas', [], { shouldDirty: false });
      return;
    }
    const optionsById = new Map(turmasOptions.map((option) => [option.id, option]));
    const selecionadas = turmasProfessorBanco
      .filter(
        (relacao) =>
          (relacao?.turma?.escola?.id ?? relacao?.turma?.escola_id) === escolaId
      )
      .map((relacao) => {
        const option = optionsById.get(relacao?.turma?.id);
        if (option) {
          return { ...option, professorTurmaId: relacao.id };
        }
        return {
          id: relacao?.turma?.id,
          label: relacao?.turma?.nome ?? `Turma ${relacao?.turma?.id}`,
          turma: relacao?.turma,
          professorTurmaId: relacao?.id,
        };
      });
    setValue('turmas', selecionadas, { shouldDirty: false });
  }, [open, selectedEscola, turmasProfessorBanco, turmasOptions, setValue]);

  const handleUpdate = async (formData) => {
    setErrorMsg('');
    const valorFuncao = formData.funcao;
    let _funcao;
    switch (valorFuncao) {
      case 'PEDAGOGO':
        _funcao = funcoes.find((funcao) => funcao.nome == 'DIRETOR');
        break;
      case 'ASSESSOR PEDAGOGICO':
        _funcao = funcoes.find((funcao) => funcao.nome == 'ASSESSOR DE GESTAO');
        break;
      default:
        _funcao = funcoes.find((funcao) => funcao.nome == valorFuncao);
    }

    if (!_funcao) {
      setErrorMsg('Funcao e obrigatoria!');
      return;
    }

    let _escola = null;
    let _zona = null;

    if (funcoesEscola.includes(_funcao.nome)) {
      if (!formData.escola || formData.escola === '') {
        setErrorMsg('Escola e obrigatoria!');
        return;
      }

      _escola = escolas.find((escola) => escola.id == formData.escola?.id);
      _zona = null;

      if (!_escola) {
        setErrorMsg('Escola nao encontrada!');
        return;
      }

      const usuarioId = resolveUsuarioId(funcaoUsuario ?? row);
      if (!usuarioId) {
        setErrorMsg('Usuario invalido para atualizar turmas.');
        return;
      }

      if (_funcao.nome === 'PROFESSOR') {
        const selectedTurmaIds = (formData.turmas || [])
          .map((turma) => turma?.id)
          .filter(Boolean);
  
        const turmasBancoMesmaEscola = turmasProfessorBanco.filter(
          (relacao) => (relacao?.turma?.escola?.id ?? relacao?.turma?.escola_id) === _escola.id
        );
  
        const turmasBancoIds = turmasBancoMesmaEscola.map((relacao) => relacao?.turma?.id);
        const turmasRemover = turmasBancoMesmaEscola.filter(
          (relacao) => !selectedTurmaIds.includes(relacao?.turma?.id)
        );
        const turmasAdicionar = selectedTurmaIds.filter((turmaId) => !turmasBancoIds.includes(turmaId));
  
        try {
          if (turmasRemover.length) {
            await Promise.all(turmasRemover.map((relacao) => deleteProfessorTurma(relacao.id)));
          }
          if (turmasAdicionar.length) {
            await Promise.all(
              turmasAdicionar.map((turmaId) =>
                postProfessorTurma({
                  turma_id: turmaId,
                  usuario_id: usuarioId,
                })
              )
            );
          }

        } catch (error) {
          console.error(error);
          setErrorMsg('Erro ao atualizar turmas do professor.');
          return;
        }
      }

    }

    if (funcoesZona.includes(_funcao.nome)) {
      if (!formData.zona || formData.zona === '') {
        setErrorMsg('Zona e obrigatoria!');
        return;
      }

      _zona = zonas.find((zona) => zona.id == formData.zona);
      _escola = null;

      if (!_zona) {
        setErrorMsg('Zona nao encontrada!');
        return;
      }
    } else if (!funcoesEscola.includes(_funcao.nome)) {
      _zona = null;
      _escola = null;
    }

    let usuarioIdRef = funcaoUsuario?.user_id ?? funcaoUsuario?.usuario_id ?? funcaoUsuario?.usuario?.id;
    if (!usuarioIdRef) {
      usuarioIdRef = resolveUsuarioId(row);
    }

    const _funcaoUsuario = {
      id: funcaoUsuario?.id,
      usuario_id: usuarioIdRef,
      funcao: _funcao,
      escola: _escola ?? null,
      zona: _zona ?? null,
      nome_exibicao: valorFuncao,
    };

    setValue('escola', '');
    setValue('zona', '');
    setValue('funcao', '');
    setValue('turmas', []);
    onSave(_funcaoUsuario);
  };

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={() => {
        setValue('escola', '');
        setValue('zona', '');
        setValue('funcao', '');
        setValue('turmas', []);
        onClose();
      }}
      PaperProps={{
        sx: { maxWidth: 1080, minHeight: 600 },
      }}
    >
      {!contextReady.value && <LoadingBox texto="Carregando dependências" mt={4} />}

      {contextReady.value && (
        <FormProvider methods={methods} onSubmit={handleSubmit(handleUpdate)}>
          <DialogTitle>Função Usuário</DialogTitle>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <DialogContent>
            <br></br>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >

              <RHFSelect
                sx={{}}
                id={`funcao` + `${funcaoUsuario?.id}`}
                name="funcao"
                label="Função"
              >
              {funcoesOptions 
                .map((funcao) => (
                  <MenuItem key={funcao.nome_exibicao} value={funcao.nome_exibicao}>
                    {funcao.nome_exibicao}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFAutocomplete
                disablePortal
                id={`escola_` + `${funcaoUsuario?.id}`}
                name="escola"
                label="Escola"
                options={escolasFiltered}
                disabled={!selectedFuncao} // Use the watched value
                sx={{
                  display: funcoesEscola.includes(selectedFuncao) ? 'inherit' : 'none', // Use the watched value
                }}

              />
              
              <RHFAutocomplete
                multiple
                disablePortal
                id={`turmas_` + `${funcaoUsuario?.id}`}
                name="turmas"
                label="Turmas"
                options={turmasOptions}
                loading={loadingTurmasProfessor}
                disabled={!selectedFuncao || !selectedEscola}
                sx={{
                  display: selectedFuncao == 'PROFESSOR' && selectedEscola ? 'inherit' : 'none',
                }}
                getOptionLabel={(option) => option?.label ?? ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
              
              <RHFSelect
                sx={{
                  display: funcoesZona.includes(selectedFuncao) ? 'inherit' : 'none', // Use the watched value
                }}
                id={`zona_` + `${funcaoUsuario?.id}`}
                name="zona"
                label="Zona"
              >
                {zonas
                  .map((zona) => (
                    <MenuItem key={zona.id} value={zona.id}>
                      {zona.nome}
                    </MenuItem>
                  ))}
              </RHFSelect>


            </Box>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={() => {
              setValue('escola', '');
              setValue('zona', '');
              setValue('funcao', '');
              setValue('turmas', []);
              onClose();
            }}>
              Cancelar
            </Button>

            <LoadingButton variant="contained" loading={isSubmitting} type="submit">
              Atualizar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      )}
    </Dialog>
  );
}

UserFuncaoEditModal.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool,
  funcoesOptions: PropTypes.array,
};