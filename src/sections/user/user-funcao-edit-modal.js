import PropTypes from 'prop-types';
import { useMemo } from 'react';
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

import { useEffect, useState, useContext } from 'react';
import { EscolasContext } from '../escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { FuncoesContext } from '../funcao/context/funcao-context';
import { AuthContext } from 'src/auth/context/alfa';

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

  const funcoesEscola = ['DIRETOR', 'PROFESSOR', 'PEDAGOGO', 'ASSESSOR DE GESTAO', 'ASSESSOR PEDAGOGICO']
  const funcoesZona = ['ASSESSOR DDZ', 'COORDENADOR DE GESTAO']

  function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }


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
          })
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
  }, [buscaEscolas, buscaZonas, open]);

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
    setValue,
    getValues,
    formState: { isSubmitting },
    control,
  } = methods;

  const selectedFuncao = watch('funcao'); // Watch the 'funcao' field for changes

  useEffect(() => {
    if (funcaoUsuario) {
      reset(defaultValues);
    }
  }, [funcaoUsuario]);

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={() => {
        setValue('escola', '');
        setValue('zona', '');
        setValue('funcao', '');
        onClose();
      }}
      PaperProps={{
        sx: { maxWidth: 1080, minHeight: 600 },
      }}
    >
      {!contextReady.value && <LoadingBox texto="Carregando dependências" mt={4} />}

      {contextReady.value && (
        <FormProvider methods={methods}>
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
              onClose();
            }}>
              Cancelar
            </Button>

            <LoadingButton variant="contained" loading={isSubmitting}
              onClick={() => {
                const valorFuncao = getValues('funcao');
                let _funcao;
                switch (valorFuncao) {
                  case 'PEDAGOGO':
                    _funcao = funcoes.find(funcao => funcao.nome == 'DIRETOR');
                    break;

                  case 'ASSESSOR PEDAGOGICO':
                    _funcao = funcoes.find(funcao => funcao.nome == 'ASSESSOR DE GESTAO');
                    break
                  default:
                    _funcao = funcoes.find(funcao => funcao.nome == valorFuncao);
                }
                
                let _escola;
                let _zona;

                if (!_funcao) {
                  setErrorMsg('Função é obrigatório!');
                  return;
                }

                if (funcoesEscola.includes(_funcao.nome)) {
                  if (!getValues('escola') || getValues('escola') == '') {
                    setErrorMsg('Escola é obrigatório!');
                    return;
                  }

                  _escola = escolas.find(escola => escola.id == getValues('escola')?.id);
                  _zona = null;

                  if (!_escola) {
                    setErrorMsg('Escola não encontrada!');
                    return;
                  }
                  
                }

                if (funcoesZona.includes(_funcao.nome)) {
                  if (!getValues('zona') || getValues('zona') == '') {
                    setErrorMsg('Zona é obrigatório!');
                    return;
                  }

                  _zona = zonas.find(zona => zona.id == getValues('zona'));
                  _escola = null;

                  if (!_zona) {
                    setErrorMsg('Zona não encontrada!');
                    return;
                  }
                }

                let _funcaoUsuario = {
                  id: funcaoUsuario?.id,
                  usuario_id: funcaoUsuario?.user_id,
                  funcao: _funcao,
                  escola: _escola ?? null,
                  zona: _zona ?? null,
                  nome_exibicao: valorFuncao
                }
                
                setValue('escola', '');
                setValue('zona', '');
                setValue('funcao', '');
                onSave(_funcaoUsuario)
              }}
            >
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
