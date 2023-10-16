import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
import { _roles, USER_STATUS_OPTIONS, _ddzs } from 'src/_mock';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import userMethods from '../user/user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import permissaoMethods from '../permissao/permissao-repository';


// ----------------------------------------------------------------------

export default function ProfissionalQuickEditForm({ currentUser, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const [permissoes, setPermissoes] = useState([]);

  useEffect(() => {
    buscaFuncoes();
    buscaEscolas();
    
    permissaoMethods.getAllPermissoes().then(permissoes => {
      setPermissoes(permissoes.data);
    }).catch((erro) => {
      console.log(erro);
      throw(erro);
    })
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
      ddz: currentUser?.ddz || '',
      escola: currentUser?.escola || '',
    }),
    [currentUser]
  );

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
    console.log(currentUser)
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
      novoUsuario.funcao_usuario = [{
        funcao_id: data.funcao,
        escola_id: data.escola
      }];
      const funcao = funcoes.find((funcaoEscolhida) =>  funcaoEscolhida.id == data.funcao)
      const permissao = permissoes.find((permissao) => permissao.nome == funcao.nome)
      novoUsuario.permissao_usuario_id = [permissao.id]
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
        <DialogTitle>Edição Rápida</DialogTitle>

        <DialogContent>
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

            <RHFSelect name="funcao" label="Função">
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

            <RHFSelect name="escola" label="Escola">
              {escolas.map((_escola) => (
                <MenuItem key={_escola.id} value={_escola.id}>
                  {_escola.nome}
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
