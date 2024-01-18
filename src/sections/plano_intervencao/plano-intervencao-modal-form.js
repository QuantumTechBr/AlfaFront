import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useCallback, useMemo, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Iconify from 'src/components/iconify/iconify';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';

// _mock
import { 
  anos_options, 
  fases_options,
  aplicacao_options, 
} from 'src/_mock';

// components
import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { IconButton } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';

import { useBoolean } from 'src/hooks/use-boolean';
import planoIntervencaoMethods from './plano-intervencao-repository';
import Alert from '@mui/material/Alert';
import habilidadeMethods from '../habilidade/habilidade-repository';
import permissaoMethods from '../permissao/permissao-repository';

// ----------------------------------------------------------------------

const filtros = {
  ano: '',
  fase: '',
  habilidades: [],
};

export default function NovoPlanoIntervencaoForm({ open, onClose }) {
  const [filters, setFilters] = useState(filtros);
  const router = useRouter();
  const [hab, setHab] = useState([])
  const preparado = useBoolean(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [allHab, setAllHab] = useState([]);
  const [habilidades_1ano, setHabilidades_1ano] = useState([]);
  const [habilidades_2ano, setHabilidades_2ano] = useState([]);
  const [habilidades_3ano, setHabilidades_3ano] = useState([]);

  useEffect(() => {
    habilidadeMethods.getAllHabilidades().then((retorno) => {
      let hab1ano = [];
      let hab2ano = [];
      let hab3ano = [];
      retorno.data.map((habilidade) => {
        if (habilidade.ano_escolar == 1) {
          hab1ano.push(habilidade);
          return
        }
        if (habilidade.ano_escolar == 2) {
          hab2ano.push(habilidade);
          return
        }
        if (habilidade.ano_escolar == 3) {
          hab3ano.push(habilidade);
          return
        }
      })
      setAllHab(retorno.data);
      setHabilidades_1ano(hab1ano);
      setHabilidades_2ano(hab2ano);
      setHabilidades_3ano(hab3ano);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de habilidades');
    });
  }, []);

  


  const defaultValues = useMemo(
    () => ({
      ano: '',
      fase: '',
      habilidades: [],
    }),
    []
  );

  const methods = useForm({
    //resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting },
  } = methods;

  //useEffect(() => {
  //  const subscription = watch((values, { name, type }) => {
  //    if (type == 'change' && name == 'ano') {
  //      setFilters(filtros)
  //    }
  //  });
  //
  //  return () => subscription.unsubscribe();
  //}, [setFilters, watch]);

  const values = watch();

  const { ano, fase, habilidades } = values;

  const selecionado = useBoolean(false);

  const podeBuscar = (habilidades, fase) => {
    if (fase != '' || habilidades.length > 0) {
      return true
    }
    return false
  }


  const handleFilters = useCallback(
    async (nome, value) => {
      // table.onResetPage();
      // console.log(filters)
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
      setFilters(novosFiltros);
    },
    [filters]
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

  const renderValueHabilidade = (selected) => 
    selected.map((habId) => {
      return (hab.find((option) => option.id == habId)?.nome);
    }).join(', ');

  useEffect(() => {
    if (ano == '1º') {
      setHab(habilidades_1ano);
    }
    if (ano == '2º') {
      setHab(habilidades_2ano);
    }
    if (ano == '3º') {
      setHab(habilidades_3ano);
    }
    setFilters(filtros);
  }, [ano]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      permissaoMethods.getAllPermissoes({
        fase: fase,
        habilidades: filters.habilidades,
      })
      console.log(data)
      console.log(filters)
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

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent>
          <br></br>
          <Box rowGap={3} 
          columnGap={2} 
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
          >

          <RHFSelect name="ano" label="Ano" sx={{
            flexShrink: 0,
          }}>
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
              name="habilidades_plano_intervencao"
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
                <MenuItem key={habi.id} value={habi.id}>
                  <Checkbox disableRipple size="small" checked={filters.habilidades.includes(habi.id)} />
                  {`${habi.nome} - ${habi.descricao}`}
                </MenuItem>
              ))}
            </Select>
            </FormControl>

            <RHFSelect name="fase" label="Fase">
                {fases_options.map((fase) => (
                  <MenuItem key={fase} value={fase}>
                    {fase}
                  </MenuItem>
                ))}
              </RHFSelect>

          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            disabled={!podeBuscar(filters.habilidades, fase)}
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            sx={{ mr: 2}} 
          >
            Buscar Plano
          </LoadingButton>

          <Button
              disabled={true}
              component={RouterLink}
              href={paths.dashboard.plano_intervencao.new_from}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Novo Plano a Partir de...
            </Button>

          <Button
              component={RouterLink}
              href={paths.dashboard.plano_intervencao.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Novo Plano
            </Button>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}

NovoPlanoIntervencaoForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
