import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useContext, useEffect, useState } from 'react';
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
// _mock
import { _anosSerie, _turnos, USER_STATUS_OPTIONS } from 'src/_mock';

import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import Alert from '@mui/material/Alert';
import zonaMethods from './zona-repository';
// ----------------------------------------------------------------------

export default function ZonaNewEditForm({ currentZona }) {
  const router = useRouter();

  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  const [errorMsg, setErrorMsg] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const NewZonaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    nome_responsavel: Yup.string().required('Nome do responsável é obrigatório'),
    fone_responsavel: Yup.string().required('Fone do responsável é obrigatório'),
    email_responsavel: Yup.string().required('E-Mail do responsável é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentZona?.nome || '',
      nome_responsavel: currentZona?.nome_responsavel || '',
      fone_responsavel: currentZona?.fone_responsavel || '',
      email_responsavel: currentZona?.email_responsavel || '',
      cidade: currentZona?.cidade?.nome || 'Manaus',

    }),
    [currentZona]
  );

  const methods = useForm({
    resolver: yupResolver(NewZonaSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data)
      var novaZona = {
        nome:  data.nome,
        nome_responsavel: data.nome_responsavel,
        fone_responsavel: data.fone_responsavel,
        email_responsavel: data.email_responsavel,
        cidade_id: "4a12c279-f19a-fae9-9c97-9b503e4bbc2c",
      }
    
      if (currentZona?.id) {
        await zonaMethods.updateZonaById(currentZona.id, novaZona).catch((error) => {
          throw error;
        });
        
      } else {
        await zonaMethods.insertZona(novaZona).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentZona ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.zona.list);
      console.info('DATA', data);
    } catch (error) {
      currentZona ? setErrorMsg('Tentativa de atualização da zona falhou') : setErrorMsg('Tentativa de criação da zona falhou');
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
  }, [currentZona]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
          <RHFTextField name="nome" label="Nome" sx={{ mb: 3 }}/>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}

            >
              <RHFTextField name="nome_responsavel" label="Nome do Responsável" sx={{ mb: 3 }}/>
              <RHFTextField name="fone_responsavel" label="Fone do Responsável" sx={{ mb: 3 }}/>
              <RHFTextField name="email_responsavel" label="E-Mail do Responsável" sx={{ mb: 3 }}/>
              <RHFTextField name="cidade" label="Cidade" disabled={true} sx={{ mb: 3 }}/>
              
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentZona ? 'Criar Zona' : 'Atualizar Zona'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ZonaNewEditForm.propTypes = {
  currentZona: PropTypes.object,
};
