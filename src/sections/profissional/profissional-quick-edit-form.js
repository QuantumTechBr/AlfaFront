import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState, useContext } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS, _ddzs } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import userMethods from '../user/user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import { useBoolean } from 'src/hooks/use-boolean';
import { ZonasContext } from '../zona/context/zona-context';
import { AuthContext } from 'src/auth/context/alfa';

// ----------------------------------------------------------------------

export default function ProfissionalQuickEditForm({ currentUser, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const assessor = useBoolean(false);
  const { user } = useContext(AuthContext);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { permissoes, buscaPermissoes } = useContext(PermissoesContext);
  const [funcaoUsuario, setFuncaoUsuario] = useState(currentUser.funcao);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser.funcao == '775bb893-032d-492a-b94b-4909e9c2aeab') {
      assessor.onTrue()
    } else {
      assessor.onFalse()
    }
    buscaFuncoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });
    
    buscaPermissoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de permissoes');
    });
  }, []);


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
      status: (currentUser?.status ? "true" : "false") || '',
      zona: currentUser?.zona || '',
      escola: currentUser?.escola || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    getValues,
    setValue,
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
          login: data.email,
          status: data.status,
        }
      } else {
        novoUsuario = {
          nome:  data.nome,
          email: data.email,
          login: data.email,
          status: data.status,
        }
      }
      if (data.funcao == '775bb893-032d-492a-b94b-4909e9c2aeab') {
        if (data.zona == '') {
          setErrorMsg('Voce deve selecionar uma zona');
          return
        } else {
          novoUsuario.funcao_usuario = [{
            funcao_id: data.funcao,
            zona_id: data.zona,
          }];
        }
      } else {
        if (data.escola == '') {
          setErrorMsg('Voce deve selecionar uma escola');
          return
        } else {
          novoUsuario.funcao_usuario = [{
            funcao_id: data.funcao,
            escola_id: data.escola,
          }];
        }
      }
      const funcao = funcoes.find((funcaoEscolhida) =>  funcaoEscolhida.id == data.funcao)
      const permissao = permissoes.find((permissao) => permissao.nome == funcao.nome)
      novoUsuario.permissao_usuario_id = [permissao.id]
      await userMethods.updateUserById(currentUser.id, novoUsuario).catch((error) => {
        throw error;
      });   
      reset() 
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();

      console.info('DATA', data);
    } catch (error) {
      let arrayMsg = Object.values(error).map((msg) => {
        return (msg[0]?.charAt(0) || '').toUpperCase() + (msg[0]?.slice(1) || '');
      });
      let mensagem = arrayMsg.join(' ');
      currentUser ? setErrorMsg(`Tentativa de atualização do usuário falhou - `+`${mensagem}`) : setErrorMsg(`Tentativa de criação do usuário falhou - `+`${mensagem}`);
      console.error(error);
    }
  });

  const desabilitaMudarFuncao = () => {
    if (user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR") {
      return true 
    }
    return false
  }

  const handleFuncao = (event) => {
    setValue('funcao', event.target.value)
    if (event.target.value == '775bb893-032d-492a-b94b-4909e9c2aeab') {
      assessor.onTrue()
    } else {
      assessor.onFalse()
    }
    setFuncaoUsuario(event.target.value)
    return
  }

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
        <DialogTitle>Edição Rápida</DialogTitle>

        <DialogContent>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          <br></br>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="nome" label="Nome Completo" />
            <RHFTextField name="email" label="Email" />
            <RHFTextField name="senha" label="Nova Senha" type="password" />

            <RHFSelect name="funcao" label="Função" disabled={desabilitaMudarFuncao()} value={funcaoUsuario} onChange={handleFuncao}>
              {funcoes.map((_funcao) => (
                <MenuItem key={_funcao.id} value={_funcao.id}>
                  {_funcao.nome}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="status" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect sx={{
                display: !assessor.value ? "none" : "inherit"
              }} id={`zona_`+`${currentUser.id}`} disabled={getValues('funcao') == '' ? true : false} name="zona" label="DDZ">
                {zonas.map((zona) => (
                  <MenuItem key={zona.id} value={zona.id}>
                    <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect sx={{
                display: assessor.value ? "none" : "inherit"
              }} id={`escola_`+`${currentUser.id}`} disabled={getValues('funcao') == '' ? true : false} name="escola" label="Escola">
                {escolas.map((escola) => (
                  <MenuItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </MenuItem>
                ))}
              </RHFSelect>

          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Atualizar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ProfissionalQuickEditForm.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
