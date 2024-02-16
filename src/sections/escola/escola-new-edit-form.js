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
import { useBoolean } from 'src/hooks/use-boolean';
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
import escolaMethods from './escola-repository';
import { ZonasContext } from '../zona/context/zona-context';
import AlunoEscolaForm from './aluno-escola-form';
// ----------------------------------------------------------------------

export default function EscolaNewEditForm({ currentEscola }) {
  const router = useRouter();
  const modalAlunoEscola = useBoolean();

  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  const [errorMsg, setErrorMsg] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });
  }, [buscaZonas])

  const NewEscolaSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    endereco: Yup.string().required('Endereço é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      nome: currentEscola?.nome || '',
      endereco: currentEscola?.endereco || '',
      zona: currentEscola?.zona?.id || '',
      cidade: currentEscola?.cidade?.nome || 'Manaus',
    }),
    [currentEscola]
  );

  const methods = useForm({
    // resolver: yupResolver(NewEscolaSchema),
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
      var novaEscola = {
        nome:  data.nome,
        endereco: data.endereco,
        zona_id: data.zona,
        cidade_id: "4a12c279-f19a-fae9-9c97-9b503e4bbc2c",
        aluno_escola: []
      }
    
      if (currentEscola?.id) {
        await escolaMethods.updateEscolaById(currentEscola.id, novaEscola).catch((error) => {
          throw error;
        });
        
      } else {
        await escolaMethods.insertEscola(novaEscola).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentEscola ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.escola.list);
    } catch (error) {
      currentEscola ? setErrorMsg('Tentativa de atualização da Escola falhou') : setErrorMsg('Tentativa de criação da Escola falhou');
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
  }, [currentEscola, defaultValues, reset]);

  return (
    <>
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}

            >
              <RHFTextField name="nome" label="Nome"/>
          <RHFTextField name="endereco" label="Endereço" />
              <RHFSelect name="zona" label="DDZ">
                {zonas.map((zona) => (
                  <MenuItem key={zona.id} value={zona.id}>
                    <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField name="cidade" label="Cidade" disabled={true} />

              {currentEscola && 
              (<Button
                variant="contained"
                onClick={modalAlunoEscola.onTrue}
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{
                  bgcolor: "#00A5AD",
                  mb: 3,
                }}
              >
                Definir Estudantes da Escola
              </Button>)
              }
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentEscola ? 'Criar Escola' : 'Atualizar Escola'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
    <AlunoEscolaForm escola={currentEscola} open={modalAlunoEscola.value} onClose={modalAlunoEscola.onFalse} />
    </>
  );
}

EscolaNewEditForm.propTypes = {
  currentEscola: PropTypes.object,
};
