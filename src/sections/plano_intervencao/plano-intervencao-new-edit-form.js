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
  anos_options, 
  fases_options,
  aplicacao_options,
} from 'src/_mock';
import planoIntervencaoMethods from './plano-intervencao-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { TurmasContext } from '../turma/context/turma-context';
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
import profissionalMethods from '../profissional/profissional-repository';
import { useBoolean } from 'src/hooks/use-boolean';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';
import alunoMethods from '../aluno/aluno-repository';
import habilidadeMethods from '../habilidade/habilidade-repository';
// ----------------------------------------------------------------------
const filtros = {
  ano: '',
  fase: '',
  habilidades: [],
  escolas: [],
  zonas: [],
  turmas: [],
  alunos: [],
};
export default function PlanoIntervencaoNewEditForm({ currentPlano }) {

  const [filters, setFilters] = useState(filtros);
  const router = useRouter();

  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [hab, setHab] = useState([])
  const preparado = useBoolean(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [listaProfissionais, setListaProfissionais] = useState([])
  const [alunos, setAlunos] = useState([]);
  const [allHab, setAllHab] = useState([]);
  const [habilidades_1ano, setHabilidades_1ano] = useState([]);
  const [habilidades_2ano, setHabilidades_2ano] = useState([]);
  const [habilidades_3ano, setHabilidades_3ano] = useState([]);

  let inicioPrevisto = new Date('01-01-2000');
  if (currentPlano) {
    inicioPrevisto = parseISO(currentPlano.inicio_previsto);
  }

  let terminoPrevisto = new Date('01-01-2000');
  if (currentPlano) {
    terminoPrevisto = parseISO(currentPlano.termino_previsto);
  }

  useEffect(() => {
    profissionalMethods.getAllProfissionais().then(profissionais => {
      let lp = []
      if (profissionais.data.length == 0) {
        setWarningMsg('A API retornou uma lista vazia de profissionais');
        preparado.onTrue(); 
      }
      profissionais.data.map((profissional) => {
        let pro = {
          label: profissional.profissional,
          id: profissional.id,
        }
        lp.push(pro)
      });
      setListaProfissionais(lp);
      preparado.onTrue();  
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de profissionais');
      preparado.onTrue(); 
    })
    alunoMethods.getAllAlunos({offset: 0, limit: 10000}).then(alunos => {
      let auto_complete_aluno = []
      alunos.data.results.map((aluno) => {
        let al = {
          label: aluno.nome,
          id: aluno.id,
        }
        auto_complete_aluno.push(al)
      });
      console.log(auto_complete_aluno)
      setAlunos(auto_complete_aluno)
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de alunos');
    });
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
    })
    buscaFuncoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });
    buscaTurmas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de turmas');
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
      responsavel: currentPlano?.responsavel || '',
      ano_escolar: currentPlano?.ano_escolar || '',
      inicio_previsto: inicioPrevisto,
      termino_previsto: terminoPrevisto,
      status: currentPlano?.status || '',
      aplicacao: currentPlano?.aplicacao || {},
      fase: currentPlano?.fase || '',
      habilidades_plano_intervencao: currentPlano?.habilidades_plano_intervencao || filters.habilidades,
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

  // useEffect(() => {
  //   const subscription = watch((values, { name, type }) => {
  //     if (type == 'change' && name == 'ano_escolar') {
  //       setFilters(filtros)
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  // }, [setFilters, watch]);

  const values = watch();

  const { ano_escolar, fase, habilidades, aplicar } = values;

  const onSubmit = handleSubmit(async (data) => {
    console.log(data)
    console.log(filters)
    try {
      let listaIdsAplicacao = [];
      if (aplicar == 'DDZs') {
        listaIdsAplicacao = filters.zonas;
      }
      if (aplicar == 'Escolas') {
        listaIdsAplicacao = filters.escolas;
      }
      if (aplicar == 'Turmas') {
        listaIdsAplicacao = filters.turmas; 
      }
      if (aplicar == 'Alunos') {
        data.alunos.map((aluno) => {
          listaIdsAplicacao.push(aluno.id)
        })
      }
      let inicioPrev = new Date(data.inicio_previsto)
      let terminoPrev = new Date(data.termino_previsto)
      let toSend = {
        responsavel_id: data.responsavel.id,
        aplicacao: {
          ids: listaIdsAplicacao,
        },
        ano_escolar: parseInt(data.ano_escolar.slice(0,1)),
        fase: data.fase,
        inicio_previsto: inicioPrev.getFullYear() + "-" + (inicioPrev.getMonth()+1) + "-" + inicioPrev.getDate(),
        termino_previsto: terminoPrev.getFullYear() + "-" + (terminoPrev.getMonth()+1) + "-" + terminoPrev.getDate(),
        habilidades_plano_intervencao_id: filters.habilidades,
        status: 'Criado',
      };
      console.log(toSend)
      if (currentPlano) {
        await planoIntervencaoMethods.updatePlanoIntervencaoById(currentPlano.id, toSend).catch((error) => {
          throw error;
        });
        
      } else {
        await planoIntervencaoMethods.insertPlanoIntervencao(toSend).catch((error) => {
          throw error;
        });
      }
      // reset();
      // enqueueSnackbar(currentPlano ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      // router.push(paths.dashboard.plano_intervencao.list);
      // console.info('DATA', data);
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

  const handleFilterZona = useCallback(
    (event) => {
      handleFilters(
        'zonas',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const handleFilterEscola = useCallback(
    (event) => {
      handleFilters(
        'escolas',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const handleFilterTurma = useCallback(
    (event) => {
      handleFilters(
        'turmas',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const handleFilterAluno = useCallback(
    (event) => {
      handleFilters(
        'alunos',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const renderValueHabilidade = (selected) => 
    selected.map((habId) => {
      return (hab.find((option) => option.id == habId)?.nome);
    }).join(', ');


  const renderValueEscola = (selected) => 
    selected.map((escolaId) => {
      return escolas.find((option) => option.id == escolaId)?.nome;
    }).join(', ');

    const renderValueTurma = (selected) => 
    selected.map((turmaId) => {
      let turma = turmas.find((option) => option.id == turmaId);
      return turma?.ano_escolar.concat('º ', turma?.nome);
    }).join(', '); 

  const renderValueAluno = (selected) => 
    selected.map((alunoId) => {
      return alunos.find((option) => option.id == alunoId)?.nome;
    }).join(', ');  

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
    setFilters(filtros);
  }, [ano_escolar]);

  useEffect(() => {
    let novoFiltro = filters;
    novoFiltro.escolas = [];
    novoFiltro.zonas = [];
    novoFiltro.alunos = [];
    novoFiltro.turmas = [];
    setFilters(novoFiltro);
  }, [aplicar]);


  const selecionarAplicacao = () => {
    if (aplicar == 'DDZs') {
      return (
        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >
          <InputLabel>DDZ</InputLabel>
          <Select
            multiple
            name="zonas"
            value={filters.zonas}
            onChange={handleFilterZona}
            input={<OutlinedInput fullWidth label="DDZ" />}
            renderValue={(selected) => selected.map((value) => value.nome).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {zonas?.map((option) => (
              <MenuItem key={option.id} value={option}>
                <Checkbox disableRipple size="small" checked={filters.zonas.includes(option)} />
                {option.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }
    if (aplicar == 'Escolas') {
      return (
        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >
          <InputLabel>Escolas</InputLabel>

          <Select
            multiple
            name="escolas"
            value={filters.escolas}
            onChange={handleFilterEscola}
            input={<OutlinedInput label="Escola" />}
            renderValue={renderValueEscola}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {escolas?.map((escola) => (
              <MenuItem key={escola.id} value={escola.id}>
                <Checkbox disableRipple size="small" checked={filters.escolas.includes(escola.id)} />
                {escola.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }
    if (aplicar == 'Turmas') {
      return (
        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >
          <InputLabel>Turmas</InputLabel>

          <Select
            multiple
            name="turmas"
            value={filters.turmas}
            onChange={handleFilterTurma}
            input={<OutlinedInput label="Turmas" />}
            renderValue={renderValueTurma}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {turmas?.map((turma) => (
              <MenuItem key={turma.id} value={turma.id}>
                <Checkbox disableRipple size="small" checked={filters.turmas.includes(turma.id)} />
                {` ${turma.ano_escolar}º ${turma.nome} (${turma.turno})  (${turma.escola.nome})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }
    if (aplicar == 'Alunos') {
      return (
        <RHFAutocomplete
          multiple
          name="alunos"
          options={alunos}
          getOptionLabel={(option) => option.label}
          label="Alunos"
        />
      )
    }
  }

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

              <RHFAutocomplete
                name="responsavel"
                options={listaProfissionais}
                label="Responsável"
              />

              {/* <Autocomplete
                disablePortal
                name="responsavel"
                options={listaProfissionais}
                renderInput={(params) => <TextField {...params} label="Responsável" />}
              /> */}

              {/* <RHFSelect name="responsavel" label="Responsável">
                {listaProfissionais.map((profissional) => (
                  <MenuItem key={profissional.id} value={profissional.id}>
                    {profissional.profissional}
                  </MenuItem>
                ))}
              </RHFSelect> */}

              <RHFSelect name="aplicar" label="Aplicar Plano a...">
                {aplicacao_options.map((aplicar) => (
                  <MenuItem key={aplicar} value={aplicar}>
                    {aplicar}
                  </MenuItem>
                ))}
              </RHFSelect>

             
        {selecionarAplicacao()}
        

              {/* <RHFSelect name="zona" label="DDZ">
                {zonas.map((zona) => (
                  <MenuItem key={zona.id} value={zona.id}>
                    <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
                  </MenuItem>
                ))}
              </RHFSelect> */}

              


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
