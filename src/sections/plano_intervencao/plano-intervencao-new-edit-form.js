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
import { 
  _roles, 
  USER_STATUS_OPTIONS, 
  _ddzs, 
  habilidades_1ano, 
  habilidades_2ano, 
  habilidades_3ano, 
  anos_options, 
  fases_options
} from 'src/_mock';
import planoIntervencaoMethods from './plano-intervencao-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import permissaoMethods from '../permissao/permissao-repository';
import Alert from '@mui/material/Alert';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import parseISO from 'date-fns/parseISO';
import ptBR from 'date-fns/locale/pt-BR';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
// ----------------------------------------------------------------------

export default function PlanoIntervencaoNewEditForm({ currentPlano }) {
  const filtros = {
    ano: '',
    fase: '',
    habilidades: [],
  };
  const [filters, setFilters] = useState(filtros);
  const router = useRouter();

  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [hab, setHab] = useState([])

  const [errorMsg, setErrorMsg] = useState('');

  let inicioPrevisto = new Date('01-01-2000');
  if (currentPlano) {
    inicioPrevisto = parseISO(currentPlano.inicio_previsto);
  }

  let terminoPrevisto = new Date('01-01-2000');
  if (currentPlano) {
    terminoPrevisto = parseISO(currentPlano.termino_previsto);
  }

  useEffect(() => {
    buscaFuncoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });
    
  }, []);

  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });
  
  const defaultValues = useMemo(
    () => ({
      nome: currentPlano?.responsavel?.nome || '',
      responsavel: currentPlano?.responsavel || {},
      ano_escolar: currentPlano?.ano_escolar || '',
      inicio_previsto: inicioPrevisto,
      termino_previsto: terminoPrevisto,
      status: currentPlano?.status || '',
      aplicacao: currentPlano?.aplicacao || {},
      fase: currentPlano?.fase || '',
      habilidades_plano_intervencao: currentPlano?.habilidades_plano_intervencao || [],
    }),
    [currentPlano]
  );

  const methods = useForm({
    //resolver: yupResolver(NewUserSchema),
    defaultValues,
  });


  const {
    register,
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (type == 'change' && name == 'ano_escolar') {
        setFilters(filtros)
      }
    });

    return () => subscription.unsubscribe();
  }, [setFilters, watch]);

  const values = watch();

  const { ano_escolar, fase, habilidades } = values;

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
      if (currentPlano) {
        await planoIntervencaoMethods.updatePlanoIntervencaoById(currentPlano.id, novoUsuario).catch((error) => {
          throw error;
        });
        
      } else {
        await planoIntervencaoMethods.insertPlanoIntervencao(novoUsuario).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentPlano ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.plano_intervencao.list);
      console.info('DATA', data);
    } catch (error) {
      let arrayMsg = Object.values(error).map((msg) => {
        return msg[0].charAt(0).toUpperCase() + msg[0]?.slice(1);
      });
      let mensagem = arrayMsg.join(' ');
      currentPlano ? setErrorMsg(`Tentativa de atualização do usuário falhou - `+`${mensagem}`) : setErrorMsg(`Tentativa de criação do usuário falhou - `+`${mensagem}`);
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
  }, [currentPlano]);

  const assessor = () => {
    if (getValues('funcao') == '775bb893-032d-492a-b94b-4909e9c2aeab') {
      return true;
    } else {
      return false;
    }
  }

  const handleFilters = useCallback(
    async (nome, value) => {
      // table.onResetPage();
      if (nome == 'habilidades') {
        const novosFiltros = {
          ...filters,
          [nome]: filters.habilidades.push(value),
        }
      }
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
      setFilters(novosFiltros);
    },
    []
  );

  const handleFilterHabilidade = useCallback(
    (event) => {
      handleFilters(
        'habilidades',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const renderValueHabilidade = (selected) => {
    //console.log(selected)
    return selected.map((habilidade) => {
      return hab.find((habi) => {
        if (habi == habilidade) {
          return habi
        }
      }).slice(0,3)
    }).join(', ');
  };

  useEffect(() => {
    if (ano_escolar == '1º') {
      setHab(habilidades_1ano);
    }
    if (ano_escolar == '2º') {
      setHab(habilidades_2ano);
    }
    if (ano_escolar == '3º') {
      setHab(habilidades_3ano);
    }
  }, [ano_escolar]);


  return (
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

              <RHFSelect name="ano_escolar" label="Ano Escolar">
                {anos_options.map((ano) => (
                  <MenuItem key={ano} value={ano}>
                    {ano}
                  </MenuItem>
                ))}
              </RHFSelect>

              <FormControl
                sx={{
                  flexShrink: 0,
                }}
              >
            
            <InputLabel>Habilidades</InputLabel>

            <Select
              multiple
              value={filters.habilidades}
              onChange={handleFilterHabilidade}
              input={<OutlinedInput label="Habilidades" />}
              renderValue={renderValueHabilidade}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {hab?.map((habi) => (
                <MenuItem key={habi} value={habi}>
                  <Checkbox disableRipple size="small" checked={filters.habilidades.includes(habi)} />
                  {habi}
                </MenuItem>
              ))}
            </Select>
            </FormControl>


            <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
              <Controller
                name="inicio_previsto"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker value={value} onChange={onChange} label='Início Previsto' />
                )}
              />
            </LocalizationProvider>
            <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
              <Controller
                name="termino_previsto"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker value={value} onChange={onChange} label='Término Previsto' />
                )}
              />
            </LocalizationProvider>


              <RHFSelect name="fase" label="Fase">
                {fases_options.map((fase) => (
                  <MenuItem key={fase} value={fase}>
                    {fase}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="" label="Variável a Melhorar" value="Índice de Alfabetização" disabled={true}>
                  <MenuItem value="Índice de Alfabetização">
                    Índice de Alfabetização
                  </MenuItem>
              </RHFSelect>


            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentPlano ? 'Criar Plano' : 'Atualizar Plano'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

PlanoIntervencaoNewEditForm.propTypes = {
  currentPlano: PropTypes.object,
};
