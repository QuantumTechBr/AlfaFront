import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useContext, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { DataGrid } from '@mui/x-data-grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';
import {
  anos_options,
  permissao_values,
  fases_options,
  aplicacao_options,
} from 'src/_mock';
import planoIntervencaoMethods from './plano-intervencao-repository';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { TurmasContext } from '../turma/context/turma-context';
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
import alunoMethods from '../aluno/aluno-repository';
import habilidadeMethods from '../habilidade/habilidade-repository';
import LoadingBox from 'src/components/helpers/loading-box';
import { PlanoIntervencaoFileManagerView } from 'src/sections/plano_intervencao/view';
import { AuthContext } from 'src/auth/context/alfa';

import documentoIntervencaoMethods from './documento_plano_intervencao/documento-intervencao-repository';
import { getValue } from '@mui/system';
import { set } from 'lodash';
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
  const { user } = useContext(AuthContext);
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
  const [zonasUsuario, setZonasUsuario] = useState([]);
  const [maxPermissaoUsuario, setMaxPermissaoUsuario] = useState('');
  const [aplicacao_options_filtrado, setAOF] = useState(aplicacao_options);
  const [buscaPro, setBuscaPro] = useState('');
  const [buscaAlu, setBuscaAlu] = useState('');
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);
  const [escolaTurma, setEscolaTurma] = useState({});
  const [aplicacaoDefault, setAplicacaoDefault] = useState(filtros);

  let aplicarInicial = '';
  const colunasDocumentosAntigos = [
    // { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nomeArquivo', headerName: 'Nome', width: 500 },
    { field: 'tamanho', headerName: 'Tamanho', width: 120 },
    { field: 'created_at', headerName: 'Criado em', width: 240 },
  ]



  if (currentPlano?.aplicacao) {
    if (currentPlano.aplicacao.alunos?.length > 0) {
      aplicarInicial = 'Alunos';
    } else if (currentPlano.aplicacao.turmas?.length > 0) {
      aplicarInicial = 'Turmas';
    } else if (currentPlano.aplicacao.escolas?.length > 0) {
      aplicarInicial = 'Escolas';
    } else if (currentPlano.aplicacao.zonas?.length > 0) {
      aplicarInicial = 'DDZs';
    }
  }

  const inicioPrevisto = useMemo(() => {
    if (currentPlano) {
      return parseISO(currentPlano.inicio_previsto);
    }
    return new Date();
  }, [currentPlano]);

  const terminoPrevisto = useMemo(() => {
    if (currentPlano) {
      return parseISO(currentPlano.termino_previsto);
    }
    return new Date();
  }, [currentPlano]);

  const hanbleEditResponsavel = () => {
    setBuscaPro({ id: currentPlano.responsavel.id, label: currentPlano.responsavel.nome })
    return { id: currentPlano.responsavel.id, label: currentPlano.responsavel.nome };
  }


  const defaultValues = useMemo(
    () => ({
      responsavel: currentPlano?.responsavel ? hanbleEditResponsavel() : '',
      acao: currentPlano?.acao || '',
      ano_escolar: currentPlano?.ano_escolar || '',
      inicio_previsto: inicioPrevisto,
      termino_previsto: terminoPrevisto,
      status: currentPlano?.status || '',
      aplicacao: currentPlano?.aplicacao || {},
      aplicar: aplicarInicial,
      fase: currentPlano?.fase || '',
      habilidades_plano_intervencao: currentPlano?.habilidades_plano_intervencao || filters.habilidades,
    }),
    [aplicarInicial, currentPlano, filters.habilidades, inicioPrevisto, terminoPrevisto]
  );


  const methods = useForm({
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

  const getAllProfissionais = (nome = '') => {
    profissionalMethods
      .getAllProfissionaisPaginado({ offset: 0, limit: 5, nome: nome })
      .then(profissionais => {
        const lp = []
        if (profissionais.data.results.length == 0) {
          setWarningMsg('A API retornou uma lista vazia de profissionais');
          preparado.onTrue();
        }
        profissionais.data.results.map((profissional) => {
          // if (profissional.funcao.nome == "PROFESSOR") {
          const pro = {
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
  }

  const getAlunoById = (id) => {
    return alunoMethods.getAlunoById(id).then(aluno => {
      const al = {
        label: aluno.data.nome,
        id: aluno.data.id,
      }
      return al
    })
  }

  const getAluno = (pesquisa = '') => {
    alunoMethods.getAllAlunos({ offset: 0, limit: 10, pesquisa: pesquisa }).then(response => {
      const auto_complete_aluno = []
      response.data.results.map((aluno) => {
        const al = {
          label: aluno.nome,
          id: aluno.id,
        }
        auto_complete_aluno.push(al)
      });
      setAlunos(auto_complete_aluno)
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de alunos');
    });
  }

  useEffect(() => {
    preparado.onFalse();
    getAllProfissionais();
    getAluno();
    habilidadeMethods.getAllHabilidades().then((response) => {
      const hab1ano = [];
      const hab2ano = [];
      const hab3ano = [];
      response.data.map((habilidade) => {
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
      setAllHab(response.data);
      setHabilidades_1ano(hab1ano);
      setHabilidades_2ano(hab2ano);
      setHabilidades_3ano(hab3ano);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de habilidades');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaTurmas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de turmas');
    });
    let maxPU = 'PROFESSOR'
    for (let index = 0; index < user?.permissao_usuario?.length; index++) { // AQUI DEFINIMOS A MAIOR PERMISSAO QUE O USUARIO TEM
      maxPU = permissao_values[maxPU] < permissao_values[user?.permissao_usuario[index].nome] ? user?.permissao_usuario[index].nome : maxPU
    }
    setMaxPermissaoUsuario(maxPU);
    const buscandoZona = [];
    if (permissao_values[maxPU] >= 6) { // COM BASE NA MAIOR PERMISSAO QUE O USUARIO TEM, MONTAMOS QUAIS ZONAS PODEM SER ESCOLHIDAS PARA APLICAR O PLANO
      buscaZonas().then(_zonas => setZonasUsuario(_zonas)).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de zonas');
      });
    } else {
      user?.funcao_usuario?.map((fu) => {
        buscandoZona.push(fu.zona)
      })
      setZonasUsuario(buscandoZona);
      if (permissao_values[maxPU] < 5) { // RETIRAMOS A OPÇÃO DE APLICAR PLANO A ZONAS 
        setAOF(aplicacao_options.slice(1))
      }
    }
  }, []); // eslint-disable-line


  useEffect(() => {
    if (url.includes('/new/')) {
      if (allHab.length > 0) {
        preparado.onTrue();
      }
    }
  }, [allHab])

  const handleAlunosEdit = async (alunosAplicacao) => {
    let alunosEdit = [];
    alunosAplicacao.map((estudante) => {
      const r = getAlunoById(estudante?.id);
      alunosEdit.push(r);
    })
    await Promise.all(alunosEdit).then((resultado) => {
      setAlunosSelecionados(resultado) 
    });
  }

  const handleEscolaTurma = useCallback(
    (event) => setEscolaTurma(event.target.value),
    [setEscolaTurma],
  );

  const handleZonasEdit = (zonasAplicacao) => {
    let zonasId = [];
    zonasAplicacao?.map((zona) => {
      zonasId.push(zona?.id);
    })
    return zonasId;
  }

  const handleEscolasEdit = (escolasAplicacao) => {
    let escolasId = [];
    escolasAplicacao?.map((esc) => {
      escolasId.push(esc?.id);
    })
    return escolasId;
  }

  const handleTurmasEdit = (turmasAplicacao) => {
    let turmasId = [];
    turmasAplicacao?.map((tur) => {
      turmasId.push(tur?.id);
    })
    return turmasId;
  }

  useEffect(() => {
    if (currentPlano?.aplicacao) {
      const novoFiltros = {
        ano: '',
        fase: '',
        habilidades: currentPlano.habilidades_plano_intervencao ? currentPlano.habilidades_plano_intervencao : [],
        escolas: currentPlano.aplicacao?.escolas ? handleEscolasEdit(currentPlano.aplicacao?.escolas) : [],
        zonas: currentPlano.aplicacao?.zonas ? handleZonasEdit(currentPlano.aplicacao?.zonas) : [],
        turmas: currentPlano.aplicacao?.turmas ? handleTurmasEdit(currentPlano.aplicacao?.turmas) : [],
        alunos: currentPlano.aplicacao?.alunos ? handleAlunosEdit(currentPlano.aplicacao?.alunos) : [],
      };
      if (currentPlano.aplicacao.turmas) {
        let etInicial = escolas?.filter((escola) => escola?.id == currentPlano?.aplicacao?.turmas[0]?.escola_id)
        setEscolaTurma(etInicial[0]?.id)
      }
      setAplicacaoDefault(novoFiltros);
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
  }, [currentPlano, escolas]);

  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });





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
    setErrorMsg('');
    try {
      const listaIdsAplicacao = {
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
        alunosSelecionados.map((aluno) => {
          listaIdsAplicacao.alunos.push(aluno.id)
        })
      }
      const inicioPrev = new Date(data.inicio_previsto);
      const terminoPrev = new Date(data.termino_previsto);
      const aplicacao = listaIdsAplicacao;
      const toSend = {
        acao: data.acao,
        responsavel_id: data.responsavel.id,
        aplicacao,
        ano_escolar: parseInt(data.ano_escolar),
        fase: data.fase,
        inicio_previsto: inicioPrev.getFullYear() + "-" + (inicioPrev.getMonth() + 1) + "-" + inicioPrev.getDate(),
        termino_previsto: terminoPrev.getFullYear() + "-" + (terminoPrev.getMonth() + 1) + "-" + terminoPrev.getDate(),
        habilidades_plano_intervencao: filters.habilidades.map((habilidade) => { return { 'habilidade': { 'habilidade_id': habilidade }, 'habilidade_id': habilidade } }),
        status: 'Criado',
        copy_files: documentosAntigosSelecionados
      };
      if (currentPlano) {
        if (newFrom) {
          await planoIntervencaoMethods.insertPlanoIntervencao(toSend).then((retorno) => {
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
          enqueueSnackbar('Criado com sucesso!');
          router.push(paths.dashboard.plano_intervencao.edit(retorno.data.id));
        }).catch((error) => {
          throw error;
        });
      }
      enqueueSnackbar('Atualizado com sucesso!');
    } catch (error) {
      const arrayMsg = Object.values(error).map((msg) => {
        return ((msg[0] && msg[0].charAt(0))?.toUpperCase() ?? '') + (msg[0]?.slice(1) ?? '');
      });
      const mensagem = arrayMsg.join(' ');
      currentPlano ? setErrorMsg(`Tentativa de atualização do plano falhou - ` + `${mensagem}`) : setErrorMsg(`Tentativa de criação do plano falhou - ` + `${mensagem}`);
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues)
  }, [currentPlano]); // eslint-disable-line

  const handleFilters = useCallback(
    async (nome, value) => {
      // table.onResetPage();
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

  const handleAlunos = (newInputValue) => {
    let novoAlunos = alunosSelecionados.filter((alu) => alu?.id != newInputValue?.id);
    if (novoAlunos.length == alunosSelecionados.length) {
      novoAlunos.push(newInputValue);
    }
    setAlunosSelecionados(novoAlunos);
    setValue("alunos", newInputValue)
  }

  const handleSelectDocumentoAntigo = (event) => {
    setDocumentosAntigosSelecionados(event);
  }


  const renderValueHabilidade = (selected) =>
    selected.map((habId) => {
      return (hab.find((option) => option.id == habId)?.nome);
    }).join(', ');

  const renderValueZona = (selected) =>
    selected.map((zonaId) => {
      return zonas.find((option) => option.id == zonaId)?.nome;
    }).join(', ');

  const renderValueEscola = (selected) =>
    selected.map((escolaId) => {
      return escolas.find((option) => option.id == escolaId)?.nome;
    }).join(', ');

  const renderValueTurma = (selected) =>
    selected.map((turmaId) => {
      const turma = turmas.find((option) => option.id == turmaId);
      return turma?.ano_escolar.concat('º ', turma?.nome);
    }).join(', ');

  const renderValueAluno = (selected) =>
    selected.map((aluno) => {
      return aluno?.label;
    }).join(', ');

  const concluiPlano = async () => {
    await planoIntervencaoMethods.updatePlanoIntervencaoById(currentPlano?.id, { status: 'Concluído' }).catch((error) => {
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
    let novoFiltro = filtros;
    novoFiltro.ano = ano_escolar;
    setFilters(novoFiltro);
  }, [ano_escolar]);

  useEffect(() => {
    setFilters(aplicacaoDefault);
    setAlunosSelecionados([]);
    setBuscaAlu('');
  }, [aplicar]);

  const telaDocumento = () => {
    router.push(paths.dashboard.plano_intervencao.documento(currentPlano?.id));
  }

  const escolaNome = (escolaId) => {
    let escola_nome = '';
    escolas.map((esc) => {
      if (esc.id == escolaId) {
        escola_nome = esc.nome
      }
    })
    return escola_nome;
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
            renderValue={renderValueZona}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {zonasUsuario?.map((zona) => (
              <MenuItem key={zona.id} value={zona.id} >
                <Checkbox disableRipple size="small" checked={filters.zonas.includes(zona.id)} />
                {zona.nome}
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
        <Box >
          <FormControl
            sx={{
              flexShrink: 0,
              width: '100%',
            }}
          >
            <InputLabel>Escolas</InputLabel>

            <Select
              name="escola_turma"
              value={escolaTurma}
              onChange={handleEscolaTurma}
              input={<OutlinedInput label="Escola" />}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              }}
            >
              {escolas?.map((escola) => (
                <MenuItem key={escola.id} value={escola.id}>
                  {escola.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            sx={{
              flexShrink: 0,
              width: '100%',
              mt: 1.5,
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
              {turmas?.filter((_turma) => escolaTurma == _turma.escola_id).map((turma) => (
                <MenuItem key={turma.id} value={turma.id}>
                  <Checkbox disableRipple size="small" checked={filters.turmas.includes(turma.id)} />
                  {` ${turma.ano_escolar}º ${turma.nome} (${turma.turno})  (${escolaNome(turma.escola_id)})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )
    }
    if (aplicar == 'Alunos') {
      return (
        <Box>
          <Controller
            name="alunos"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                onChange={(event, newInputValue) => handleAlunos(newInputValue)}
                value={buscaAlu}
                options={alunos}
                noOptionsText="Nenhum aluno encontrado"
                filterOptions={(x) => x}
                onInputChange={(event, newInputValue) => {
                  setBuscaAlu(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Nome/Matrícula"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton type="button" sx={{ p: '10px' }} aria-label="search"
                            onClick={() => {
                              getAluno(buscaAlu)
                            }
                            }
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}

                  />
                )}
              />
            )}
          />
          <TextField
            label="Alunos Selecionados"
            value={renderValueAluno(alunosSelecionados)}
            sx={{
              mt: 2,
              width: '100%'
            }}
          />
        </Box>
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
                    {fases_options.map((_fase) => (
                      <MenuItem key={_fase} value={_fase} sx={{ height: '34px' }}>
                        {_fase}
                      </MenuItem>
                    ))}
                  </RHFSelect>

                  <RHFSelect name="" label="Variável a Melhorar" value="Índice de Alfabetização" disabled={true}>
                    <MenuItem value="Índice de Alfabetização">
                      Índice de Alfabetização
                    </MenuItem>
                  </RHFSelect>

                  <RHFTextField name="acao" label="Ação" />

                  <Controller
                    name="responsavel"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        onChange={(event, newInputValue) => setValue("responsavel", newInputValue)}
                        value={buscaPro}
                        options={listaProfissionais}
                        noOptionsText="Nenhum professor encontrado"
                        filterOptions={(x) => x}
                        onInputChange={(event, newInputValue) => {
                          setBuscaPro(newInputValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Responsável"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search"
                                    onClick={() => {
                                      getAllProfissionais(buscaPro)
                                    }
                                    }
                                  >
                                    <SearchIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}

                          />
                        )}
                      />
                    )}
                  />

                  <RHFSelect name="aplicar" label="Aplicar Plano a...">
                    {aplicacao_options_filtrado.map((_aplicar) => (
                      <MenuItem key={_aplicar} value={_aplicar}>
                        {_aplicar}
                      </MenuItem>
                    ))}
                  </RHFSelect>


                  {selecionarAplicacao()}


                </Box>

                {currentPlano?.id && newFrom &&
                  <div>
                    <Accordion sx={{ bgcolor: '#f5f5f5', my: 1 }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        sx={{ bgcolor: '#f5f5f5', borderRadius: 2, mt: 1 }}
                      >
                        <h3>Anexos</h3>
                      </AccordionSummary>
                      <AccordionDetails >
                        <DataGrid
                          rows={documentosAntigos}
                          columns={colunasDocumentosAntigos}
                          checkboxSelection
                          hideFooterPagination
                          sx={{ mt: 3, bgcolor: "white" }}
                          onRowSelectionModelChange={handleSelectDocumentoAntigo}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </div>
                }

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }} alignItems="flex-end">
                  <Button disabled={getValues('status') == 'Concluído' ? true : false} variant="contained" color='success' sx={{ visibility: currentPlano ? (newFrom ? 'hidden' : 'inherit') : 'hidden' }} onClick={() => { conclui.onTrue() }}>
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
        <Card sx={{ mt: 3 }}>
          <PlanoIntervencaoFileManagerView planoId={currentPlano?.id} />
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
