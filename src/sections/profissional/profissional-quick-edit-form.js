import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState, useContext, useCallback } from 'react';
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
import { AuthContext } from 'src/auth/context/alfa';


export default function ProfissionalQuickEditForm({ row, open, onClose, onSave }) {
  const [currentUser, setCurrentUser] = useState();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setErrorMsg('');
    if (open) {
      setCurrentUser({ nome: row.profissional, ...row });
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
  console.log(defaultValues)
  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    try {
      var novoUsuario = {
        nome: data.nome,
        email: data.email,
        login: data.email,
        status: data.status,
      };

      const retornoPatch = await userMethods
        .updateUserById(currentUser.id, novoUsuario)
        .catch((error) => {
          throw error;
        });

      retornoPatch.data.profissional = retornoPatch.data.nome;
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
        ? setErrorMsg(`Tentativa de atualização do profissional falhou - ` + `${mensagem}`)
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

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Atualizar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ProfissionalQuickEditForm.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  open: PropTypes.bool,
};
