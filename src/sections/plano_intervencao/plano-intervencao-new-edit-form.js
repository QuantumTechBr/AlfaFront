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
import { ConfirmDialog } from 'src/components/custom-dialog';
import { DataGrid } from '@mui/x-data-grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import LoadingBox from 'src/components/helpers/loading-box';
import { PlanoIntervencaoFileManagerView } from 'src/sections/plano_intervencao/view';

import documentoIntervencaoMethods from './documento_plano_intervencao/documento-intervencao-repository';
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
export default function PlanoIntervencaoNewEditForm({ currentPlano, newFrom = false, statusConcluido }) {

  const [filters, setFilters] = useState(filtros);
  const router = useRouter();
  const conclui = useBoolean();
  const url = window.location.href;
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
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
  const [documentosAntigos, setDocumentosAntigos] = useState([]);
  const [documentosAntigosSelecionados, setDocumentosAntigosSelecionados] = useState([]);
  
  let aplicarInicial = '';
  let colunasDocumentosAntigos = [
    // { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nomeArquivo', headerName: 'Nome', width: 500 },
    { field: 'tamanho', headerName: 'Tamanho', width: 120 },
    { field: 'created_at', headerName: 'Criado em', width: 240 },
  ]
  


  if (currentPlano?.aplicacao) {
    if (currentPlano.aplicacao.escolas?.length > 0) {
      aplicarInicial = 'Escolas';
    } else if (currentPlano.aplicacao.zonas?.length > 0) {
      aplicarInicial = 'DDZs';
    } else if (currentPlano.aplicacao.alunos?.length > 0) {
      aplicarInicial = 'Alunos';
    } else if (currentPlano.aplicacao.turmas?.length > 0) {
      aplicarInicial = 'Turmas';
    }
  }

  let inicioPrevisto = new Date('01-01-2000');
  if (currentPlano) {
    inicioPrevisto = parseISO(currentPlano.inicio_previsto);
  }

  let terminoPrevisto = new Date('01-01-2000');
  if (currentPlano) {
    terminoPrevisto = parseISO(currentPlano.termino_previsto);
  }


  useEffect(() => {
    preparado.onFalse();
    profissionalMethods.getAllProfissionais().then(profissionais => {
      let lp = []
      if (profissionais.data.length == 0) {
        setWarningMsg('A API retornou uma lista vazia de profissionais');
        preparado.onTrue(); 
      }
      profissionais.data.map((profissional) => {
        // if (profissional.funcao.nome == "PROFESSOR") {
          let pro = {
            label: profissional.profissional,
            id: profissional.id,
          }
          lp.push(pro)
        // }
      });
      setListaProfissionais(lp);
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
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de habilidades');
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

  useEffect(() => {
    if (url.includes('/new/')) {
      if (allHab.length > 0 ) {
        preparado.onTrue();
      }        
    }
  }, [allHab])

  useEffect(()  => {
    if (currentPlano) {
      const novoFiltros = {
        ano: '',
        fase: '',
        habilidades: currentPlano.habilidades_plano_intervencao ? currentPlano.habilidades_plano_intervencao : [],
        escolas: currentPlano.aplicacao?.escolas ? currentPlano.aplicacao?.escolas : [],
        zonas: currentPlano.aplicacao?.zonas ? currentPlano.aplicacao?.zonas : [],
        turmas: currentPlano.aplicacao?.turmas ? currentPlano.aplicacao?.turmas : [],
        alunos: currentPlano.aplicacao?.alunos ? currentPlano.aplicacao?.alunos : [],
      };

      setFilters(novoFiltros);

      if (currentPlano.ano_escolar) {
        switch (currentPlano.ano_escolar) {
          case 1:
            setHab(habilidades_1ano)
            break;

          case 2:
            setHab(habilidades_2ano)
            break;
          
          case 3:
            setHab(habilidades_3ano)
            break;

        
          default:
            break;
        }
        preparado.onTrue();  
      }
      if (newFrom && currentPlano?.id) {
        documentoIntervencaoMethods.getAllDocumentos(currentPlano.id).then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          setDocumentosAntigos(response.data);
        }).catch((error) => {
          setErrorMsg('Erro de comunicação com a API de documentos');
        })
      }
    }
  }, [currentPlano]);

  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      responsavel: currentPlano?.responsavel ? {id: currentPlano.responsavel.id, label: currentPlano.responsavel.nome} : '',
      ano_escolar: currentPlano?.ano_escolar || '',
      inicio_previsto: inicioPrevisto,
      termino_previsto: terminoPrevisto,
      status: currentPlano?.status || '',
      aplicacao: currentPlano?.aplicacao || {},
      aplicar: aplicarInicial,
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
    try {
      let listaIdsAplicacao = {
        zonas: [],
        escolas: [],
        turmas: [],
        alunos: []
      };
      if (aplicar == 'DDZs') {
        listaIdsAplicacao.zonas = filters.zonas;
      }
      if (aplicar == 'Escolas') {
        listaIdsAplicacao.escolas = filters.escolas;
      }
      if (aplicar == 'Turmas') {
        listaIdsAplicacao.turmas = filters.turmas; 
      }
      if (aplicar == 'Alunos') {
        data.alunos.map((aluno) => {
          listaIdsAplicacao.alunos.push(aluno.id)
        })
      }
      let inicioPrev = new Date(data.inicio_previsto);
      let terminoPrev = new Date(data.termino_previsto);
      let aplicacao = listaIdsAplicacao;
      let toSend = {
        responsavel_id: data.responsavel.id,
        aplicacao,
        ano_escolar: parseInt(data.ano_escolar),
        fase: data.fase,
        inicio_previsto: inicioPrev.getFullYear() + "-" + (inicioPrev.getMonth()+1) + "-" + inicioPrev.getDate(),
        termino_previsto: terminoPrev.getFullYear() + "-" + (terminoPrev.getMonth()+1) + "-" + terminoPrev.getDate(),
        habilidades_plano_intervencao: filters.habilidades.map((habilidade) => {return {'habilidade': {'habilidade_id': habilidade}, 'habilidade_id': habilidade}}),
        status: 'Criado',
        copy_files: documentosAntigosSelecionados
      };
      if (currentPlano) {
        if (newFrom) {
          await planoIntervencaoMethods.insertPlanoIntervencao(toSend).then((retorno) => {
            reset();
            enqueueSnackbar('Criado com sucesso!');
            router.push(paths.dashboard.plano_intervencao.edit(retorno.data.id));
          }).catch((error) => {
            throw error;
          });  
        } else {
          await planoIntervencaoMethods.updatePlanoIntervencaoById(currentPlano.id, toSend).catch((error) => {
            throw error;
          });
        }
      } else {
        await planoIntervencaoMethods.insertPlanoIntervencao(toSend).then((retorno) => {
          reset();
          enqueueSnackbar('Criado com sucesso!');
          router.push(paths.dashboard.plano_intervencao.edit(retorno.data.id));
        }).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar('Atualizado com sucesso!');
    } catch (error) {
      let arrayMsg = Object.values(error).map((msg) => {
        return msg[0].charAt(0).toUpperCase() + msg[0]?.slice(1);
      });
      let mensagem = arrayMsg.join(' ');
      currentPlano ? setErrorMsg(`Tentativa de atualização do plano falhou - `+`${mensagem}`) : setErrorMsg(`Tentativa de criação do plano falhou - `+`${mensagem}`);
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
  }, [currentPlano]);

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

  //const handleFilterAluno = useCallback(
  //  (event) => {
  //    handleFilters(
  //      'alunos',
  //      typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
  //    );
  //  },
  //  [handleFilters]
  //);

  const handleSelectDocumentoAntigo = (event) => {
    setDocumentosAntigosSelecionados(event);
  }
  

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

  const concluiPlano = async () => {
    await planoIntervencaoMethods.updatePlanoIntervencaoById(currentPlano?.id, {status: 'Concluído'}).catch((error) => {
        console.log(error);
      });
    statusConcluido()
    conclui.onFalse();
  }

  useEffect(() => {
    if (ano_escolar == '1') {
      setHab(habilidades_1ano);
    }
    if (ano_escolar == '2') {
      setHab(habilidades_2ano);
    }
    if (ano_escolar == '3') {
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

  const telaDocumento = () => {
    router.push(paths.dashboard.plano_intervencao.documento(currentPlano?.id));
  }

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
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!preparado.value ? (
                  <LoadingBox />) : (
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
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
                      {ano}º
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
                    <MenuItem key={fase} value={fase} sx={{ height: '34px' }}>
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

                <RHFSelect name="aplicar" label="Aplicar Plano a...">
                  {aplicacao_options.map((aplicar) => (
                    <MenuItem key={aplicar} value={aplicar}>
                      {aplicar}
                    </MenuItem>
                  ))}
                </RHFSelect>

              
                {selecionarAplicacao()}


              </Box>

              {currentPlano?.id && newFrom &&
                <div>
                  <Accordion sx={{ bgcolor: '#f5f5f5', my: 1}}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                      sx={{ bgcolor: '#f5f5f5', borderRadius: 2, mt: 1}}
                    >
                      <h3>Anexos</h3>
                    </AccordionSummary>
                    <AccordionDetails >
                      <DataGrid
                        rows={documentosAntigos}
                        columns={colunasDocumentosAntigos}
                        checkboxSelection
                        hideFooterPagination
                        sx={{mt:3, bgcolor: "white"}}
                        onRowSelectionModelChange={handleSelectDocumentoAntigo}
                        />
                    </AccordionDetails>
                  </Accordion>
                </div>
              }

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }} alignItems="flex-end">
              <Button disabled={getValues('status') == 'Concluído' ? true : false} variant="contained" color='success' sx={{ visibility: currentPlano ? (newFrom ? 'hidden' : 'inherit') : 'hidden' }} onClick={() => {conclui.onTrue()}}>
                  Status Concluído
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {currentPlano ? (newFrom ? 'Criar Plano' : 'Atualizar Plano') : 'Criar Plano'}
                </LoadingButton>
                <ConfirmDialog
                  open={conclui.value}
                  onClose={conclui.onFalse}
                  title="Plano Concluído"
                  content="Tem certeza que deseja marcar esse plano como Concluído?"
                  action={
                    <Button variant="contained" color="success" onClick={concluiPlano}>
                      Concluído
                    </Button>
                  }
                />
              </Stack>
            </Card>
          </Grid>
        </Grid>)}
      </FormProvider>

      {currentPlano?.id && !newFrom && 
        <Card sx={{mt:3}}>
          <PlanoIntervencaoFileManagerView planoId={currentPlano?.id}/>
        </Card>
      }

      
    </>
  );
}

PlanoIntervencaoNewEditForm.propTypes = {
  currentPlano: PropTypes.object,
  newFrom: PropTypes.bool,
  statusConcluido: PropTypes.func,
};
