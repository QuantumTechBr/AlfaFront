import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState, useContext } from 'react';
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
import { USER_STATUS_OPTIONS } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import userMethods from './user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import { useBoolean } from 'src/hooks/use-boolean';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import LoadingBox from 'src/components/helpers/loading-box';
import { useAuthContext } from 'src/auth/hooks';
import _ from 'lodash';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ row, open, onClose, onSave }) {
  const defaultFilters = {
    escolasAG: [],
  };

  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const [currentUser, setCurrentUser] = useState();
  const [filters, setFilters] = useState(defaultFilters);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setErrorMsg('');
    if (open) {
      setCurrentUser(row);
    }
  }, [open]);

  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string()
      .required('Email é obrigatório')
      .email('Email tem que ser um endereço de email válido'),
    funcao_usuario: Yup.string(),
    escola: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentUser?.nome || '',
      email: currentUser?.email || '',
      status: (currentUser?.status && currentUser?.status === 'true' ? 'true' : 'false') || '',
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
    watch,
    formState: { isSubmitting },
    setValue,
    getValues,
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      let novoUsuario = {
        nome: data.nome,
        email: data.email,
        login: data.email,
        status: data.status,
      };
      if (data.senha) {
        novoUsuario['senha'] = data.senha;
        // novoUsuario = {
        //   nome: data.nome,
        //   email: data.email,
        //   senha: data.senha,
        //   login: data.email,
        //   status: data.status,
        // }
      } 
      // else {
      //   novoUsuario = {
      //     nome: data.nome,
      //     email: data.email,
      //     login: data.email,
      //     status: data.status,
      //   }
      // }
      const retornoPatch = await userMethods
        .updateUserById(currentUser.id, novoUsuario)
        .catch((error) => {
          throw error;
        });

      retornoPatch.data.status = novoUsuario.status;

      enqueueSnackbar('Atualizado com sucesso!');
      onSave(retornoPatch.data);
      reset();
    } catch (error) {
      const arrayMsg = _.flattenDeep(
        Object.values(error).map((er) => Object.values(er).map((e) => Object.values(e)))
      );
      const mensagem = arrayMsg.join(' ');
      currentUser
        ? setErrorMsg(`Tentativa de atualização do usuário falhou - ` + `${mensagem}`)
        : setErrorMsg(`Tentativa de criação do usuário falhou - ` + `${mensagem}`);
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues)
  }, [currentUser, defaultValues, reset]);

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={() => {
        setCurrentUser();
        onClose();
      }}
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
            mb={3}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="nome" label="Nome Completo" />
            <RHFTextField name="email" label="Email" />
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            mb={3}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="status" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Atualizar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

UserQuickEditForm.propTypes = {
  row: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool,
};
