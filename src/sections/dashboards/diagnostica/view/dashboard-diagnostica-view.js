'use client';

import { useEffect, useState, useCallback, useContext, useMemo } from 'react';
import _ from 'lodash';

// @mui
import { useTheme } from '@mui/material/styles';
import {
  Stack,
  Button,
  Typography,
  Container,
  Card,
  CardHeader,
  TableHead,
  TableRow,
  TableCell,
  IconButton,
  Collapse,
} from '@mui/material';
import Box from '@mui/material/Box';
import InstructionButton from 'src/components/helpers/instruction-button';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// theme
import { bgBlur } from 'src/theme/css';

import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { styled } from '@mui/material/styles';

// contexts
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { AuthContext } from 'src/auth/context/alfa';
// components
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from 'src/components/settings';
import LoadingBox from 'src/components/helpers/loading-box';
import Iconify from 'src/components/iconify';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';

// ----------------------------------------------------------------------
import DashboardDiagnosticaTableToolbar from './dashboard-diagnostica-table-toolbar';
import dashboardsMethods from 'src/sections/overview/dashboards-repository';

//
import NumeroComponent from '../../components/numero-component';
import DashboardGridFilters from '../../components/dashboard-grid-filter';
import Scrollbar from 'src/components/scrollbar';

import ParticipacaoGridChart from '../components/participacao-grid-chart';
import ParticipacaoSemedChart from '../components/participacao-semed-chart';
import ParticipacaoChart from '../components/participacao-chart';

//
import { paths } from 'src/routes/paths';
import { preDefinedZonaOrder } from 'src/_mock';
import DesempenhoComponent from '../components/desempenho-component';

export default function DashboardDiagnosticaView() {
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();
  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const [_escolasFiltered, setEscolasFiltered] = useState([]);
  const { turmas, buscaTurmas } = useContext(TurmasContext);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(true);
  const [zonaFiltro, setZonaFiltro] = useState('');

  const [filters, setFilters] = useState({
    anoLetivo: '',
    zona: zonaFiltro,
    escola: [],
    turma: [],
    anoEscolar: [],
    // tipo: '-',
    pne: '-',
    pneItem: '-',
  });

  const [filtersApplied, setFiltersApplied] = useState({ ...filters });

  const isZonaFiltered = !!filtersApplied.zona && filtersApplied.zona != '';
  const isEscolaFiltered = (filtersApplied.escola?.length ?? 0) > 0;

  const [dados, setDados] = useState({
    total_alunos: null,
    total_alunos_presentes: { entrada: 0, saida: 0 },
    total_alunos_ausentes: { entrada: 0, saida: 0 },
    //
    desempenho_por_ano: {
      entrada: { 1: 0, 2: 0, 3: 0 },
      saida: { 1: 0, 2: 0, 3: 0 },
    },
    //
    grid_ddz: [],
    grid_escolas: [],
    grid_turmas: [],
  });
  console.log(dados)
  const grid = isEscolaFiltered
    ? dados.grid_turmas
    : isZonaFiltered
      ? dados.grid_escolas
      : dados.grid_ddz;

  const getTurmasPorAnoEscolar = useCallback(
    (anoEscolar) => {
      return turmas.filter((turma) => turma.ano_escolar == anoEscolar).map((turma) => turma.id);
    },
    [turmas]
  );

  const prepareData = (result) => {
    if (!result || result.length == 0) {
      return
    }
    // BEGIN adequação dos dados
    result.grid_turmas = result.grid_turmas ? result.grid_turmas : [];
    // TODO REMOVE
    if ((typeof result.total_alunos).toLowerCase() != 'object') {
      // result.total_alunos = {
      //   entrada: result.total_alunos,
      //   saida: result.total_alunos,
      // };
      result.total_alunos = {
        entrada: result.total_alunos_presentes.entrada + result.total_alunos_ausentes.entrada,
        saida: result.total_alunos_presentes.saida + result.total_alunos_ausentes.saida,
      };
    }

    // CRIAÇÃO DO GRID DE ESCOLAS

    result.grid_escolas = [];

    let _grid_escolas = Object.assign(
      {},
      _(result.grid_turmas)
        .groupBy((item) => item.escola_id)
        .value()
    );

    _(_grid_escolas).forEach((turmasEscola, escola_id) => {
      // frequencias
      let _totalEntradaPresente = 0;
      let _totalEntradaAusente = 0;

      let _totalSaidaPresente = 0;
      let _totalSaidaAusente = 0;

      _.forEach(turmasEscola, (_turma) => {
        const _frequenciaEntrada = getFrequenciasAssociative(_turma.qtd_alunos_entrada);
        _totalEntradaPresente += _frequenciaEntrada['Presente'] ?? 0;
        _totalEntradaAusente += _frequenciaEntrada['Ausente'] ?? 0;

        const _frequenciaSaida = getFrequenciasAssociative(_turma.qtd_alunos_saida);
        _totalSaidaPresente += _frequenciaSaida['Presente'] ?? 0;
        _totalSaidaAusente += _frequenciaSaida['Ausente'] ?? 0;
      });

      const _qtd_alunos_entrada_saida = {
        qtd_alunos_entrada: {
          frequencias: ['Presente', 'Ausente'],
          total: [_totalEntradaPresente, _totalEntradaAusente],
        },
        qtd_alunos_saida: {
          frequencias: ['Presente', 'Ausente'],
          total: [_totalSaidaPresente, _totalSaidaAusente],
        },
      };

      const _toPush = {
        zona_id: _.first(turmasEscola).zona_id,
        zona_nome: _.first(turmasEscola).zona_nome,
        escola_id: _.first(turmasEscola).escola_id,
        escola_nome: _.first(turmasEscola).escola_nome,
        qtd_turmas: turmasEscola.length,
        qtd_alunos: _.sumBy(turmasEscola, (_turma) => _turma.qtd_alunos),
        ..._qtd_alunos_entrada_saida,
        turmas: turmasEscola,
      };

      result.grid_escolas.push(_toPush);
    });

    // ORDEM DA LISTA DE ESCOLAS
    result.grid_escolas = _.sortBy(result.grid_escolas, (e) => e.escola_nome);

    // ORDEM DA LISTA DE DDZS
    const _sortedZonas = result.grid_ddz.sort((a, b) => {
      const na = preDefinedZonaOrder[a.zona_nome] ?? 0;
      const nb = preDefinedZonaOrder[b.zona_nome] ?? 0;
      return na - nb;
    });
    result.grid_ddz = _sortedZonas;

    // ACRESCENTA À LISTA DE ESCOLAS DA DDZ
    result.grid_ddz = result.grid_ddz.map((item) => {
      return {
        ...item,
        escolas: result.grid_escolas.filter((_escola) => _escola.zona_id == item.zona_id),
      };
    });

    // END adequação dos dados

    setDados(result);
  };

  const preencheGraficos = useCallback(
    async (_filters) => {
      table.onResetPage();
      console.log('preencheGraficos');
      const _filtersToSearch = _filters ?? filters;

      isGettingGraphics.onTrue();
      const fullFilters = {
        ano_letivo: [
          (_filtersToSearch.anoLetivo != '' ? _filtersToSearch.anoLetivo : _.first(anosLetivos))
            ?.id,
        ],
        ddz: _filtersToSearch.zona.id ? [_filtersToSearch.zona.id] : [],
        escola: _filtersToSearch.escola.map((item) => item.id),
        turma: _.flatten(
          _filtersToSearch.anoEscolar.map((aE) => {
            return getTurmasPorAnoEscolar(aE);
          })
        ),
        laudo_necessidade: _filtersToSearch.pne == '-' ? '' : _filtersToSearch.pne,
        necessidades_especiais:
          _filtersToSearch.pne == '-' || _filtersToSearch.pneItem == '-'
            ? []
            : [`["${_filtersToSearch.pneItem}"]`],
      };

      // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      //   prepareData(mockData);
      // } else {
      if (fullFilters.ddz.length == 0) {
        await Promise.all([
          dashboardsMethods.getDashboardAvaliacaoDiagnosticoRede(fullFilters).then((response) => {
            const result = Object.assign({}, response.data);
            prepareData(result);
          }),
        ]);
      } else {
        await Promise.all([
          dashboardsMethods.getDashboardAvaliacaoDiagnostico(fullFilters).then((response) => {
            const result = Object.assign({}, response.data);
            prepareData(result);
          }),
        ]);
      }
      // }

      isGettingGraphics.onFalse();
    },
    [filters, anosLetivos, getTurmasPorAnoEscolar, isGettingGraphics]
  );

  const handleFilters = useCallback(
    (campo, value) => {
      let _newFilters = filters;
      if (campo == 'zona') {
        if (value.length == 0) {
          setEscolasFiltered(escolas);
        } else {
          var escolasFiltered = escolas.filter((escola) => value.id == escola.zona.id);
          setEscolasFiltered(escolasFiltered);
        }
        _newFilters = { ...filters, ['escola']: [], [campo]: value };
        setFilters(_newFilters);
      } else {
        _newFilters = { ...filters, [campo]: value };
        setFilters(_newFilters);
      }
      return _newFilters;
    },
    [setFilters, setEscolasFiltered, escolas, filters]
  );

  const preparacaoInicial = useCallback(() => {
    if (!preparacaoInicialRunned.value) {
      preparacaoInicialRunned.onTrue();
      Promise.all([
        buscaAnosLetivos(),
        buscaZonas(),
        buscaEscolas().then((_escolas) => setEscolasFiltered(_escolas)),
        buscaTurmas(),
      ]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [preparacaoInicialRunned, buscaAnosLetivos, buscaTurmas, contextReady]);

  useEffect(() => {
    if (user && contextReady.value) {

      let _zonaFiltro = '';
      console.log(user)
      if (user?.funcao_usuario?.length > 0) {
        if (user?.funcao_usuario[0]?.funcao?.nome == 'ASSESSOR DDZ' || user?.funcao_usuario[0]?.funcao?.nome == 'COORDENADOR DE GESTAO') {
          _zonaFiltro = zonas.find((z) => z.id == user?.funcao_usuario[0]?.zona.id);
        } else {
          _zonaFiltro = zonas.find((z) => z.id == user?.funcao_usuario[0]?.escola?.zona.id);
        }
      }

      // if (initialZona) {
      //  _zonaFiltro = zonas.find((z) => z.id == initialZona);
      // }

      // if (!_zonaFiltro) {
      //  _zonaFiltro = _.first(zonas);
      // }

      setZonaFiltro(_zonaFiltro);

      const _filters = {
        ...filters,
        zona: _zonaFiltro,
        ...(anosLetivos && anosLetivos.length > 0 ? { anoLetivo: _.first(anosLetivos) } : {}),
      };

      setFilters(_filters);
      setFiltersApplied(_filters);
      preencheGraficos(_filters);
    }
  }, [contextReady.value, user]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, []);

  const filtroReset = () => {
    setFilters({
      anoLetivo: _.first(anosLetivos),
      zona: '',
      escola: [],
      turma: [],
      anoEscolar: [],
      // tipo: '-',
      pne: '-',
      pneItem: '-',
    });
  };

  // TABLE GRID
  const TABLE_HEAD = useMemo(
    () => [
      ...(isEscolaFiltered
        ? [
          { id: 'escolas', label: 'Escolas', notsortable: true },
          { id: 'turma', label: 'Turma', notsortable: true },
        ]
        : isZonaFiltered
          ? [
            { id: 'escolas', label: 'Escolas', notsortable: true },
            { id: 'turmas', label: 'Turmas', width: 110, notsortable: true },
          ]
          : [
            // use with RowZonaDetailed
            // { id: 'collapse', label: '', notsortable: true, width: 30 },
            { id: 'ddz', label: 'DDZ', notsortable: true },
            { id: 'escolas', label: 'Escolas', width: 110, notsortable: true },
            { id: 'turmas', label: 'Turmas', width: 110, notsortable: true },
          ]),
      { id: 'estudantes', label: 'Estudantes', width: 110, notsortable: true },
      { id: 'entrada_presentes', label: 'Entrada Presentes', width: 110, notsortable: true },
      { id: 'entrada_ausentes', label: 'Entrada Ausentes', width: 110, notsortable: true },
      ...(dados.total_alunos_presentes.saida ?? 0 > 0
        ? [{ id: 'saida_presentes', label: 'Saída Presentes', width: 110, notsortable: true }]
        : []),
      ...(dados.total_alunos_ausentes.saida ?? 0 > 0
        ? [{ id: 'saida_ausentes', label: 'Saída Ausentes', width: 110, notsortable: true }]
        : []),
      { id: '', width: 88, notsortable: true },
    ],
    [dados]
  );

  const defaultTableFilters = { campo: '' };

  const table = useTable({ defaultRowsPerPage: 25 });

  const [tableFilters, setTableFilters] = useState(defaultTableFilters);

  const debouncedGridFilter = useDebounce(tableFilters, 380);

  const [tableRowsExpanded, setTableRowsExpanded] = useState(0);

  const onSetOpen = (open) => {
    setTableRowsExpanded((prevState) => {
      const _calculated = open ? prevState + 1 : prevState - 1;
      return _calculated < 0 ? 0 : _calculated;
    });
  };

  const dataFiltered = applyTableFilter({
    isZonaFiltered: isZonaFiltered,
    isEscolaFiltered: isEscolaFiltered,
    inputData: grid,
    comparator: getComparator(table.order, table.orderBy),
    filters: debouncedGridFilter,
  });

  const notFound = dataFiltered.length == 0;

  const handleTableFilters = useCallback(
    (nome, value) => {
      table.onResetPage();
      setTableFilters((prevState) => ({
        ...prevState,
        campo: value,
      }));
    },
    [table]
  );

  const _percentCalc = (valor1, valor2, fixNumberTo) => {
    const _calculed = ((valor1 ?? 0) / (valor2 ?? 0)) * 100;
    return !Number.isNaN(_calculed) && Number.isFinite(_calculed)
      ? fixNumberTo
        ? _calculed.toFixed(fixNumberTo ?? 0)
        : Math.floor(_calculed)
      : 0;
  };

  // GRÁFICOS

  const auxilarEscolaPorZonaParticipacao = (grid_escolas) => {
    return grid_escolas.map((item) => {
      let _entradaPresente = 0;
      let _entradaAusente = 0;

      let _saidaPresente = 0;
      let _saidaAusente = 0;

      _.forEach(item.turmas, (_turma) => {
        const _frequenciaEntrada = getFrequenciasAssociative(_turma.qtd_alunos_entrada);
        _entradaPresente += _frequenciaEntrada['Presente'] ?? 0;
        _entradaAusente += _frequenciaEntrada['Ausente'] ?? 0;

        const _frequenciaSaida = getFrequenciasAssociative(_turma.qtd_alunos_saida);
        _saidaPresente += _frequenciaSaida['Presente'] ?? 0;
        _saidaAusente += _frequenciaSaida['Ausente'] ?? 0;
      });

      const _isToList =
        _entradaPresente + _entradaAusente > 0 || _saidaPresente + _saidaAusente > 0;

      return {
        name: item.escola_nome,
        data: {
          totalEntradaPresente: _entradaPresente,
          totalEntradaAusente: _entradaAusente,
          totalSaidaPresente: _saidaPresente,
          totalSaidaAusente: _saidaAusente,
        },
        isToList: _isToList,
      };
    });
  };

  // GRÁFICO 1
  const participacaoGridChartSeries = useCallback(() => {
    const series = [];

    // FILTRO POR ESCOLAS
    if (isEscolaFiltered) {
      const porTurma = dados.grid_turmas.map((item) => {
        const _frequenciaEntrada = getFrequenciasAssociative(item.qtd_alunos_entrada);
        let _entradaPresente = _frequenciaEntrada['Presente'] ?? 0;
        let _entradaAusente = _frequenciaEntrada['Ausente'] ?? 0;

        const _frequenciaSaida = getFrequenciasAssociative(item.qtd_alunos_saida);
        let _saidaPresente = _frequenciaSaida['Presente'] ?? 0;
        let _saidaAusente = _frequenciaSaida['Ausente'] ?? 0;

        return {
          data: {
            totalEntradaPresente: _entradaPresente,
            totalEntradaAusente: _entradaAusente,
            totalSaidaPresente: _saidaPresente,
            totalSaidaAusente: _saidaAusente,
          },
        };
      });

      series.push({
        tipo: 'Entrada',
        name: 'Presentes',
        data: porTurma.map((pz) =>
          _percentCalc(
            pz.data.totalEntradaPresente,
            pz.data.totalEntradaAusente + pz.data.totalEntradaPresente
          )
        ),
        quantidade: porTurma.map((pz) => pz.data.totalEntradaPresente),
      });

      series.push({
        tipo: 'Entrada',
        name: 'Ausentes',
        data: porTurma.map((pz) =>
          _percentCalc(
            pz.data.totalEntradaAusente,
            pz.data.totalEntradaAusente + pz.data.totalEntradaPresente
          )
        ),
        quantidade: porTurma.map((pz) => pz.data.totalEntradaAusente),
      });

      // Saida
      if (_.sum(porTurma.map((pz) => pz.data.totalSaidaPresente)) > 0) {
        series.push({
          tipo: 'Saída',
          name: 'Presentes',
          data: porTurma.map((pz) =>
            _percentCalc(
              pz.data.totalSaidaPresente,
              pz.data.totalSaidaAusente + pz.data.totalSaidaPresente
            )
          ),
          quantidade: porTurma.map((pz) => pz.data.totalSaidaPresente),
        });
      }

      if (_.sum(porTurma.map((pz) => pz.data.totalSaidaAusente)) > 0) {
        series.push({
          tipo: 'Saída',
          name: 'Ausentes',
          data: porTurma.map((pz) =>
            _percentCalc(
              pz.data.totalSaidaAusente,
              pz.data.totalSaidaAusente + pz.data.totalSaidaPresente
            )
          ),
          quantidade: porTurma.map((pz) => pz.data.totalSaidaAusente),
        });
      }
      return series;
    }

    // FILTRO POR ZONAS
    if (isZonaFiltered) {
      const porEscola = auxilarEscolaPorZonaParticipacao(dados.grid_escolas).filter(
        (pe) => pe.isToList
      );

      // _.forEach(_porEscola, (pe) => {
      //   // if(pe.isToList)
      //   porEscola.push(pe);
      // });

      series.push({
        tipo: 'Entrada',
        name: 'Presentes',
        data: porEscola.map((pe) =>
          _percentCalc(
            pe.data.totalEntradaPresente,
            pe.data.totalEntradaAusente + pe.data.totalEntradaPresente
          )
        ),
        quantidade: porEscola.map((pe) => pe.data.totalEntradaPresente),
      });

      series.push({
        tipo: 'Entrada',
        name: 'Ausentes',
        data: porEscola.map((pe) =>
          _percentCalc(
            pe.data.totalEntradaAusente,
            pe.data.totalEntradaAusente + pe.data.totalEntradaPresente
          )
        ),
        quantidade: porEscola.map((pe) => pe.data.totalEntradaAusente),
      });

      if (_.sum(porEscola.map((pe) => pe.data.totalSaidaPresente)) > 0) {
        series.push({
          tipo: 'Saída',
          name: 'Presentes',
          data: porEscola.map((pe) =>
            _percentCalc(
              pe.data.totalSaidaPresente,
              pe.data.totalSaidaAusente + pe.data.totalSaidaPresente
            )
          ),
          quantidade: porEscola.map((pe) => pe.data.totalSaidaPresente),
        });
      }

      if (_.sum(porEscola.map((pe) => pe.data.totalSaidaAusente)) > 0) {
        series.push({
          tipo: 'Saída',
          name: 'Ausentes',
          data: porEscola.map((pe) =>
            _percentCalc(
              pe.data.totalSaidaAusente,
              pe.data.totalSaidaAusente + pe.data.totalSaidaPresente
            )
          ),
          quantidade: porEscola.map((pe) => pe.data.totalSaidaAusente),
        });
      }

      return series;
    }

    // SEM FILTROS
    const porZona = dados.grid_ddz.map((item) => {
      const _frequenciaEntrada = getFrequenciasAssociative(item.qtd_alunos_entrada);
      let _entradaPresente = _frequenciaEntrada['Presente'] ?? 0;
      let _entradaAusente = _frequenciaEntrada['Ausente'] ?? 0;

      const _frequenciaSaida = getFrequenciasAssociative(item.qtd_alunos_saida);
      let _saidaPresente = _frequenciaSaida['Presente'] ?? 0;
      let _saidaAusente = _frequenciaSaida['Ausente'] ?? 0;

      return {
        name: item.zona_nome,
        data: {
          totalEntradaPresente: _entradaPresente,
          totalEntradaAusente: _entradaAusente,
          totalSaidaPresente: _saidaPresente,
          totalSaidaAusente: _saidaAusente,
        },
      };
    });

    series.push({
      tipo: 'Entrada',
      name: 'Presentes',
      data: porZona.map((pz) =>
        _percentCalc(
          pz.data.totalEntradaPresente,
          pz.data.totalEntradaPresente + pz.data.totalEntradaAusente,
          1
        )
      ),
      quantidade: porZona.map((pz) => pz.data.totalEntradaPresente),
    });

    series.push({
      tipo: 'Entrada',
      name: 'Ausentes',
      data: porZona.map((pz) =>
        _percentCalc(
          pz.data.totalEntradaAusente,
          pz.data.totalEntradaPresente + pz.data.totalEntradaAusente,
          1
        )
      ),
      quantidade: porZona.map((pz) => pz.data.totalEntradaAusente),
    });

    if (_.sum(porZona.map((pz) => pz.data.totalSaidaPresente)) > 0) {
      series.push({
        tipo: 'Saída',
        name: 'Presentes',
        data: porZona.map((pz) =>
          _percentCalc(
            pz.data.totalSaidaPresente,
            pz.data.totalSaidaPresente + pz.data.totalSaidaAusente,
            1
          )
        ),
        quantidade: porZona.map((pz) => pz.data.totalSaidaPresente),
      });
    }

    if (_.sum(porZona.map((pz) => pz.data.totalSaidaAusente)) > 0) {
      series.push({
        tipo: 'Saída',
        name: 'Ausentes',
        data: porZona.map((pz) =>
          _percentCalc(
            pz.data.totalSaidaAusente,
            pz.data.totalSaidaPresente + pz.data.totalSaidaAusente,
            1
          )
        ),
        quantidade: porZona.map((pz) => pz.data.totalSaidaAusente),
      });
    }

    return series;
  }, [dados, isZonaFiltered, isEscolaFiltered]);

  const participacaoGridChartOptions = useCallback(() => {
    let options = {};
    if (isEscolaFiltered) {
      options = {
        ...options,
        plotOptions: { bar: { columnWidth: 60, horizontal: true, barHeight: '80%' } },
        xaxis: {
          labels: { show: false },
          categories: dados.grid_turmas.map(
            (item) => `${item.turma_ano_escolar}º ${item.turma_nome}`
          ),
        },
      };
    } else if (isZonaFiltered) {
      options = {
        ...options,
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '80%',
          },
        },
        xaxis: {
          labels: { show: false, trim: true },
          categories: auxilarEscolaPorZonaParticipacao(dados.grid_escolas)
            .filter((pe) => pe.isToList)
            .map((i) => i.name),
        },
      };
    } else {
      options = {
        ...options,
        plotOptions: { bar: { columnWidth: '80%' } },
        xaxis: {
          labels: { show: true },
          categories: dados.grid_ddz.map((item) => item.zona_nome),
        },
      };
    }
    return options;
  }, [dados, isZonaFiltered, isEscolaFiltered]);

  // GRÁFICO 2
  const participacaoSemedChartSeries = useCallback(() => {
    const _series = [];

    // SEM FILTROS
    const porZona = dados.grid_ddz.map((item) => {
      const _frequenciaEntrada = getFrequenciasAssociative(item.qtd_alunos_entrada);
      let _entradaPresente = _frequenciaEntrada['Presente'] ?? 0;
      let _entradaAusente = _frequenciaEntrada['Ausente'] ?? 0;

      const _frequenciaSaida = getFrequenciasAssociative(item.qtd_alunos_saida);
      let _saidaPresente = _frequenciaSaida['Presente'] ?? 0;
      let _saidaAusente = _frequenciaSaida['Ausente'] ?? 0;

      return {
        name: item.zona_nome,
        data: {
          entrada: { presentes: _entradaPresente, ausentes: _entradaAusente },
          saida: { presentes: _saidaPresente, ausentes: _saidaAusente },
        },
      };
    });

    const _entrada = {
      presentes: porZona.reduce((total, pz) => (total += pz.data.entrada.presentes), 0),
      ausentes: porZona.reduce((total, pz) => (total += pz.data.entrada.ausentes), 0),
    };

    _series.push({
      name: 'Entrada',
      data: [
        _percentCalc(_entrada.presentes, _entrada.presentes + _entrada.ausentes),
        _percentCalc(_entrada.ausentes, _entrada.presentes + _entrada.ausentes),
      ],
      quantidade: [_entrada.presentes, _entrada.ausentes],
      total: _entrada.presentes + _entrada.ausentes,
    });

    const _saida = {
      presentes: porZona.reduce((total, pz) => (total += pz.data.saida.presentes), 0),
      ausentes: porZona.reduce((total, pz) => (total += pz.data.saida.ausentes), 0),
    };

    if (_.sum(_saida) > 0) {
      _series.push({
        name: 'Saída',
        data: [
          _percentCalc(_saida.presentes, _saida.presentes + _saida.ausentes),
          _percentCalc(_saida.ausentes, _saida.presentes + _saida.ausentes),
        ],
        quantidade: [_saida.presentes, _saida.ausentes],
        total: _saida.presentes + _saida.ausentes,
      });
    }

    return _series;
  }, [dados, isZonaFiltered, isEscolaFiltered]);

  const participacaoSemedChartOptions = useCallback(() => {
    let options = {
      xaxis: {
        categories: ['Presentes', 'Ausentes'],
      },
    };

    return options;
  }, []);

  // GRÁFICO 3
  const participacaoChartSeries = useCallback(() => {
    const series = [];

    const metricasPorAno = [1, 2, 3].map((_anoEscolar) => {
      let _totalEntradaPresente = 0;
      let _totalEntradaAusente = 0;

      let _totalSaidaPresente = 0;
      let _totalSaidaAusente = 0;
      console.log("isZonaFiltered", isZonaFiltered)

      if (isEscolaFiltered || isZonaFiltered) {
        const _turmasDoAnoEscolar = (dados.grid_turmas ?? []).filter(
          (_turma) => _turma.turma_ano_escolar == _anoEscolar
        );

        _turmasDoAnoEscolar.forEach((_turma) => {
          const _frequenciaEntrada = getFrequenciasAssociative(_turma.qtd_alunos_entrada);
          _totalEntradaPresente += _frequenciaEntrada['Presente'] ?? 0;
          _totalEntradaAusente += _frequenciaEntrada['Ausente'] ?? 0;

          const _frequenciaSaida = getFrequenciasAssociative(_turma.qtd_alunos_saida);
          _totalSaidaPresente += _frequenciaSaida['Presente'] ?? 0;
          _totalSaidaAusente += _frequenciaSaida['Ausente'] ?? 0;
        });
      } else {
        // SEM FILTRO - REDE
        _totalEntradaPresente = dados.desempenho_por_ano?.entrada[_anoEscolar]?.quantidade ?? 0;
        _totalEntradaAusente =
          (dados.desempenho_por_ano?.entrada[_anoEscolar]?.total ?? 0) -
          (dados.desempenho_por_ano?.entrada[_anoEscolar]?.quantidade ?? 0);

        _totalSaidaPresente = dados.desempenho_por_ano?.saida[_anoEscolar]?.quantidade ?? 0;
        _totalSaidaAusente =
          (dados.desempenho_por_ano?.saida[_anoEscolar]?.total ?? 0) -
          (dados.desempenho_por_ano?.saida[_anoEscolar]?.quantidade ?? 0);
      }

      return {
        totalEntradaPresente: _totalEntradaPresente,
        totalEntradaAusente: _totalEntradaAusente,
        totalSaidaPresente: _totalSaidaPresente,
        totalSaidaAusente: _totalSaidaAusente,
      };
    });

    series.push({
      name: 'Entrada',
      data: metricasPorAno.map((item) =>
        _percentCalc(
          item.totalEntradaPresente,
          item.totalEntradaPresente + item.totalEntradaAusente,
          1
        )
      ),
      quantidade: metricasPorAno.map((item) => item.totalEntradaPresente),
      total: metricasPorAno.map((item) => item.totalEntradaPresente + item.totalEntradaAusente),
    });

    if (_.sum(metricasPorAno.map((item) => item.totalSaidaPresente)) > 0) {
      series.push({
        name: 'Saída',
        data: metricasPorAno.map((item) =>
          _percentCalc(item.totalSaidaPresente, item.totalSaidaPresente + item.totalSaidaAusente, 1)
        ),
        quantidade: metricasPorAno.map((item) => item.totalSaidaPresente),
        total: metricasPorAno.map((item) => item.totalSaidaPresente + item.totalSaidaAusente),
      });
    }

    return series;
  }, [dados, isZonaFiltered, isEscolaFiltered]);

  const participacaoChartOptions = useCallback(() => {
    let options = {
      xaxis: {
        categories: [1, 2, 3].map((_anoEscolar) => `${_anoEscolar}º Ano`),
        labels: {
          // show: false,
        },
      },
    };

    return options;
  }, []);

  // GRÁFICO 4
  const desempenhoChartSeries = useCallback(
    (metrica, _anoEscolar) => {
      // console.log(dados)
      let _metricas = {};


      if (_anoEscolar) {
        if (!dados.grid_turmas) {
          const _turmasNoAnoEscolar = dados.grid_ddz.filter(
            (_turma) => _turma.turma_ano_escolar == _anoEscolar
          );

          _metricas.entrada = [
            _.sumBy(dados.grid_ddz, (t) => t.desempenho[metrica].entrada.N1[_anoEscolar]),
            _.sumBy(dados.grid_ddz, (t) => t.desempenho[metrica].entrada.N2[_anoEscolar]),
            _.sumBy(dados.grid_ddz, (t) => t.desempenho[metrica].entrada.N3[_anoEscolar]),
          ];

          const _metricasSaida = [
            _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].saida.N1[_anoEscolar]),
            _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].saida.N2[_anoEscolar]),
            _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].saida.N3[_anoEscolar]),
          ];

          if (_.sum(_metricasSaida) > 0) {
            _metricas.saida = _metricasSaida;
          }
        } else {
          const _turmasNoAnoEscolar = dados.grid_turmas.filter(
            (_turma) => _turma.turma_ano_escolar == _anoEscolar
          );

          _metricas.entrada = [
            _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].entrada.N1),
            _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].entrada.N2),
            _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].entrada.N3),
          ];

          if (_turmasNoAnoEscolar.filter((t) => !!t.desempenho[metrica].saida).length > 0) {
            _metricas.saida = [
              _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].saida.N1),
              _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].saida.N2),
              _.sumBy(_turmasNoAnoEscolar, (t) => t.desempenho[metrica].saida.N3),
            ];
          }
        }
      } else {
        if (!dados.grid_turmas) {
          const porZona = dados.grid_ddz.map((item) => {
            return {
              name: item.zona_nome,
              data: item.desempenho[metrica],
            };
          });

          _metricas.entrada = [
            _.sumBy(porZona, (z) => _.sum(Object.values(z.data.entrada.N1))),
            _.sumBy(porZona, (z) => _.sum(Object.values(z.data.entrada.N2))),
            _.sumBy(porZona, (z) => _.sum(Object.values(z.data.entrada.N3))),
          ];

          const _metricasSaida = [
            _.sumBy(porZona, (z) => _.sum(Object.values(z.data.saida.N1))),
            _.sumBy(porZona, (z) => _.sum(Object.values(z.data.saida.N2))),
            _.sumBy(porZona, (z) => _.sum(Object.values(z.data.saida.N3))),
          ];

          if (_.sum(_metricasSaida) > 0) {
            _metricas.saida = _metricasSaida;
          }
        } else {
          const porZona = dados.grid_ddz.map((item) => {
            return {
              name: item.zona_nome,
              data: item.desempenho[metrica],
            };
          });
          console.log(porZona)

          let _metricasSaida = []

          if (typeof porZona[0]?.data.entrada.N1 === "object") {
            _metricas.entrada = [
              _.sumBy(porZona, (z) => _.sum(_.values(z.data.entrada.N1))),
              _.sumBy(porZona, (z) => _.sum(_.values(z.data.entrada.N2))),
              _.sumBy(porZona, (z) => _.sum(_.values(z.data.entrada.N3))),
            ];
            _metricasSaida = [
              _.sumBy(porZona, (z) => _.sum(_.values(z.data.saida.N1))),
              _.sumBy(porZona, (z) => _.sum(_.values(z.data.saida.N2))),
              _.sumBy(porZona, (z) => _.sum(_.values(z.data.saida.N3))),
            ];

          } else {

            _metricas.entrada = [
              _.sumBy(porZona, (z) => z.data.entrada.N1),
              _.sumBy(porZona, (z) => z.data.entrada.N2),
              _.sumBy(porZona, (z) => z.data.entrada.N3),
            ];
            _metricasSaida = [
              _.sumBy(porZona, (z) => z.data.saida.N1),
              _.sumBy(porZona, (z) => z.data.saida.N2),
              _.sumBy(porZona, (z) => z.data.saida.N3),
            ];
          }

          if (_.sum(_metricasSaida) > 0) {
            _metricas.saida = _metricasSaida;
          }
        }
      }

      const somaEntrada = _.sum(_metricas.entrada);
      let somaSaida = 0;
      if (_metricas.saida) {
        somaSaida = _.sum(_metricas.saida);
      }

      const _series = {};

      if (_.sum(_metricas.entrada) > 0) {
        _series['entrada'] = {
          name: 'Entrada',
          data: _metricas.entrada.map((v) => _percentCalc(v, somaEntrada, 1)),
          quantidade: _metricas.entrada,
          total: somaEntrada,
        };
      }

      if (somaSaida > 0) {
        _series['saida'] = {
          name: 'Saída',
          data: _metricas.saida.map((v) => _percentCalc(v, somaSaida, 1)),
          quantidade: _metricas.saida,
          total: somaSaida,
        };
      }

      return _series;
    },
    [dados]
  );

  const extraTitulo = isEscolaFiltered ? "ESCOLAS" : filtersApplied.zona.nome ?? "SEMED";

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Stack
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Grid xs={12} md>
            <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h3">Dashboard: Avaliação Diagnóstica</Typography>
              <InstructionButton youtubeLink={""} />
            </Box>
          </Grid>
        </Stack>

        {!contextReady.value && (
          <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
            <LoadingBox />
          </Grid>
        )}

        {!!contextReady.value && (
          <>
            <Stack
              flexGrow={1}
              direction={{
                xs: 'column',
                md: 'row',
              }}
              width="100%"
              spacing={{
                xs: 1,
                md: 0,
              }}
              alignItems="center"
              sx={{
                position: { lg: 'sticky' },
                top: { lg: window.screen.width > 1740 ? 0 : 64 },
                zIndex: theme.zIndex.appBar + 2,

                ...bgBlur({
                  color: theme.palette.background.default,
                }),
              }}
              paddingY={1}
            >
              <Grid xs={12} md="auto" paddingY={2}
                sx={{
                  backgroundColor: 'white',
                }}
              >
                <DashboardDiagnosticaTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  anoLetivoOptions={anosLetivos}
                  ddzOptions={zonas}
                  escolaOptions={_escolasFiltered || escolas}
                  anoEscolarOptions={[1, 2, 3]}
                />
              </Grid>
              <Grid xs={12} md="auto" paddingY={2}
                sx={{
                  backgroundColor: 'white',
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    width: {
                      xs: '100%',
                      md: 'auto',
                    },
                  }}
                  onClick={() => {
                    setFiltersApplied(filters);
                    preencheGraficos(filters);
                  }}
                >
                  Aplicar filtros
                </Button>

                <Button
                  variant="soft"
                  sx={{
                    width: {
                      xs: 'calc(30% - 10px)',
                      md: 'auto',
                    },
                    marginLeft: { xs: '10px', md: 2 },
                  }}
                  onClick={filtroReset}
                >
                  Limpar
                </Button>
              </Grid>
            </Stack>

            {!!isGettingGraphics.value && (
              <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
                <LoadingBox texto="Carregando, isto pode demorar alguns segundos..." />
              </Grid>
            )}

            {!isGettingGraphics.value && (
              <Grid container marginX={0} spacing={3} marginTop={3} width="100%">
                <Grid xs={12} md={4} lg={4}>
                  <NumeroComponent
                    sx={{ py: 1 }}
                    title="Estudantes"
                    subtitle="Entrada"
                    total={dados.total_alunos.entrada}
                  />
                </Grid>
                <Grid xs={12} md={4} lg={4}>
                  <NumeroComponent
                    sx={{ py: 1 }}
                    title="Estudantes Presentes"
                    subtitle="Entrada"
                    total={dados.total_alunos_presentes.entrada ?? 0}
                  />
                </Grid>
                <Grid xs={12} md={4} lg={4}>
                  <NumeroComponent
                    sx={{ py: 1 }}
                    title="Estudantes Ausentes"
                    subtitle="Entrada"
                    total={dados.total_alunos_ausentes.entrada ?? 0}
                  />
                </Grid>

                {(dados.total_alunos_presentes.saida > 0 ||
                  dados.total_alunos_ausentes.saida > 0) && (
                    <Grid xs={12} container>
                      <Grid xs={12} md={4} lg={4}>
                        <NumeroComponent
                          sx={{ py: 1 }}
                          title="Estudantes"
                          subtitle="Saída"
                          total={dados.total_alunos.saida}
                        />
                      </Grid>
                      <Grid xs={12} md={4} lg={4}>
                        <NumeroComponent
                          sx={{ py: 1 }}
                          title="Estudantes Presentes"
                          subtitle="Saída"
                          total={dados.total_alunos_presentes.saida ?? 0}
                        />
                      </Grid>

                      <Grid xs={12} md={4} lg={4}>
                        <NumeroComponent
                          sx={{ py: 1 }}
                          title="Estudantes Ausentes"
                          subtitle="Saída"
                          total={dados.total_alunos_ausentes.saida ?? 0}
                        />
                      </Grid>
                    </Grid>
                  )}

                <Grid xs={12}>
                  <ParticipacaoGridChart
                    title="Participação"
                    chartSeries={participacaoGridChartSeries()}
                    options={participacaoGridChartOptions()}
                  />
                </Grid>

                <Grid xs={12} lg={4}>
                  <ParticipacaoSemedChart
                    title={`Participação ${extraTitulo}`}
                    chartSeries={participacaoSemedChartSeries()}
                    options={participacaoSemedChartOptions()}
                  />
                </Grid>
                <Grid xs={12} lg={8}>
                  <ParticipacaoChart
                    title="Participação"
                    chartSeries={participacaoChartSeries()}
                    options={participacaoChartOptions()}
                  />
                </Grid>

                <Grid xs={12} mt={4}>
                  <Typography variant="h5">Desempenho</Typography>
                </Grid>

                {/* Desempenho GERAL */}
                <Grid xs={12} lg={4}>
                  <DesempenhoComponent
                    title={extraTitulo}
                    chartSeries={Object.values(desempenhoChartSeries('geral'))}
                    options={{
                      legend: { show: true, showForSingleSeries: true, position: 'bottom' },
                    }}
                    sx={{ overflow: 'visible' }}
                  />
                </Grid>
                <Grid xs={12} lg={4}>
                  <DesempenhoComponent
                    title={`Língua Portuguesa - ${extraTitulo}`}
                    chartSeries={Object.values(desempenhoChartSeries('lingua_portuguesa'))}
                    options={{
                      legend: { show: true, showForSingleSeries: true, position: 'bottom' },
                    }}
                    sx={{ overflow: 'visible' }}
                  />
                </Grid>
                <Grid xs={12} lg={4}>
                  <DesempenhoComponent
                    title={`Matemática - ${extraTitulo}`}
                    chartSeries={Object.values(desempenhoChartSeries('matematica'))}
                    options={{
                      legend: { show: true, showForSingleSeries: true, position: 'bottom' },
                    }}
                    sx={{ overflow: 'visible' }}
                  />
                </Grid>

                {/* Desempenho por Ano de Ensino */}

                {[1, 2, 3].map((_anoEscolar) => {
                  const _desempenhoGeralChartSeries = desempenhoChartSeries('geral', _anoEscolar);
                  if (
                    Object.values(_desempenhoGeralChartSeries).length == 0 ||
                    (_.sum(_desempenhoGeralChartSeries.entrada?.quantidade ?? 0) == 0 &&
                      _.sum(_desempenhoGeralChartSeries.saida?.quantidade ?? 0) == 0)
                  )
                    return (
                      <Grid xs={12} key={`desempenho_anoescolar_${_anoEscolar}`} container></Grid>
                    );

                  return (
                    <Grid xs={12} key={`desempenho_anoescolar_${_anoEscolar}`} container>
                      <Grid xs={12} lg={4}>
                        <DesempenhoComponent
                          title={`${_anoEscolar}º Ano`}
                          chartSeries={Object.values(_desempenhoGeralChartSeries)}
                          sx={{ overflow: 'visible' }}
                        />
                      </Grid>
                      <Grid xs={12} lg={4}>
                        <DesempenhoComponent
                          title={`Língua Portuguesa - ${_anoEscolar}º Ano`}
                          chartSeries={Object.values(
                            desempenhoChartSeries('lingua_portuguesa', _anoEscolar)
                          )}
                          sx={{ overflow: 'visible' }}
                        />
                      </Grid>
                      <Grid xs={12} lg={4}>
                        <DesempenhoComponent
                          title={`Matemática - ${_anoEscolar}º Ano`}
                          chartSeries={Object.values(
                            desempenhoChartSeries('matematica', _anoEscolar)
                          )}
                          sx={{ overflow: 'visible' }}
                        />
                      </Grid>
                    </Grid>
                  );
                })}

                <Grid xs={12}>
                  <Card sx={{ mt: 3, mb: 4 }}>
                    <CardHeader
                      title={isEscolaFiltered ? 'Turmas' : isZonaFiltered ? 'Escolas' : 'DDZs'}
                    />
                    <DashboardGridFilters filters={tableFilters} onFilters={handleTableFilters} />

                    <TableContainer
                      sx={{
                        mt: 1,
                        height:
                          70 +
                          (dataFiltered.length == 0
                            ? 350
                            : (dataFiltered.length < table.rowsPerPage
                              ? dataFiltered.length
                              : table.rowsPerPage) * 43),
                        // : dataFiltered.length *
                        //     (!isEscolaFiltered && !isZonaFiltered ? 47 : 43) +
                        //   tableRowsExpanded * 300),
                      }}
                    >
                      <Scrollbar>
                        <Table size="small" sx={{ minWidth: 960 }} aria-label="collapsible table">
                          <TableHeadCustom
                            order={table.order}
                            orderBy={table.orderBy}
                            headLabel={TABLE_HEAD}
                            rowCount={grid.length}
                            onSort={table.onSort}
                          />

                          <TableBody>
                            {Object.entries(
                              dataFiltered.slice(
                                table.page * table.rowsPerPage,
                                table.page * table.rowsPerPage + table.rowsPerPage
                              )
                            ).map(([key, row]) => (
                              <Row
                                key={`tableRowDash_${key}`}
                                row={{ ...row, key: key }}
                                isZonaFiltered={isZonaFiltered}
                                isEscolaFiltered={isEscolaFiltered}
                                onSetOpen={(open) => onSetOpen(open)}
                                filterOnClick={(id) => {
                                  if (isEscolaFiltered) {
                                    return false;
                                  } else if (isZonaFiltered) {
                                    const _filters = handleFilters(
                                      'escola',
                                      _.filter(escolas, (_escola) => _escola.id == id)
                                    );
                                    setFiltersApplied(_filters);
                                    preencheGraficos(_filters);
                                  } else {
                                    const _filters = handleFilters(
                                      'zona',
                                      _.find(zonas, (_zona) => _zona.id == id)
                                    );
                                    setFiltersApplied(_filters);
                                    preencheGraficos(_filters);
                                  }
                                }}
                              />
                            ))}

                            <TableEmptyRows
                              height={43}
                              emptyRows={emptyRows(table.page, table.rowsPerPage, grid.length)}
                            />

                            <TableNoData notFound={notFound} />
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>

                    <TablePaginationCustom
                      count={dataFiltered.length}
                      page={table.page}
                      rowsPerPage={table.rowsPerPage}
                      rowsPerPageOptions={[5, 10, 15, 25]}
                      onPageChange={table.onChangePage}
                      onRowsPerPageChange={table.onChangeRowsPerPage}
                      dense={table.dense}
                    />

                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyTableFilter({ isZonaFiltered, isEscolaFiltered, inputData, comparator, filters }) {
  const { campo } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (campo) {
    if (isEscolaFiltered) {
      inputData = inputData.filter(
        (row) =>
          _.compact([
            row.escola_nome.toLowerCase().indexOf(campo.toLowerCase()) !== -1,
            `${row.turma_ano_escolar}${row.turma_nome}`
              .toLowerCase()
              .indexOf(campo.toLowerCase()) !== -1,
            row.escola_nome.toLowerCase().indexOf(campo.toLowerCase()) !== -1,
            `${row.turma_ano_escolar} ${row.turma_nome}`
              .toLowerCase()
              .indexOf(campo.toLowerCase()) !== -1,
            `${row.turma_ano_escolar}º ${row.turma_nome}`
              .toLowerCase()
              .indexOf(campo.toLowerCase()) !== -1,
          ]).length > 0
      );
    } else if (isZonaFiltered) {
      inputData = inputData.filter(
        (row) =>
          _.compact([row.escola_nome.toLowerCase().indexOf(campo.toLowerCase()) !== -1]).length > 0
      );
    } else {
      inputData = inputData.filter(
        (row) => row.zona_nome.toLowerCase().indexOf(campo.toLowerCase()) !== -1
      );
    }
  }

  return inputData;
}

// ----------------------------------------------------------------------

const getFrequenciasAssociative = (lista = {}) => {
  const totais = {};

  _.forEach(lista.frequencias, (frequencia, keyN) => {
    if (!_.has(totais, frequencia)) {
      Object.assign(totais, { [`${frequencia}`]: 0 });
    }
    totais[`${frequencia}`] += lista.total[keyN];
  });

  return totais;
};
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  ':hover': {
    backgroundColor: theme.palette.action.focus,
  },
}));

function RowZonaDetailed(props) {
  const { row, filterOnClick, onSetOpen } = props;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    onSetOpen(open);
  }, [open]);

  const _frequenciaEntrada = getFrequenciasAssociative(row.qtd_alunos_entrada);
  let _entradaPresente = _frequenciaEntrada['Presente'] ?? 0;
  let _entradaAusente = _frequenciaEntrada['Ausente'] ?? 0;

  const _frequenciaSaida = getFrequenciasAssociative(row.qtd_alunos_saida);
  let _saidaPresente = _frequenciaSaida['Presente'] ?? 0;
  let _saidaAusente = _frequenciaSaida['Ausente'] ?? 0;

  return (
    <>
      <StyledTableRow
        key={`tableStyledRowDash_${row.key}`}
        sx={{ '& > *': { borderBottom: 'unset', backgroundColor: open ? `#00000020` : null } }}
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.zona_nome}</TableCell>
        <TableCell>{row.qtd_escolas ?? 0}</TableCell>
        <TableCell>{row.qtd_turmas ?? 0}</TableCell>
        <TableCell>{row.qtd_alunos ?? 0}</TableCell>
        <TableCell>{_entradaPresente ?? 0}</TableCell>
        <TableCell>{_entradaAusente ?? 0}</TableCell>
        {_saidaPresente > 0 && <TableCell>{_saidaPresente ?? 0}</TableCell>}
        {_saidaAusente > 0 && <TableCell>{_saidaAusente ?? 0}</TableCell>}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Button
            color="primary"
            variant="contained"
            size="small"
            onClick={() => filterOnClick(row.zona_id)}
          >
            Ver escolas
          </Button>
        </TableCell>
      </StyledTableRow>

      <TableRow>
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, border: '1px solid #00000080' }}>
              <Table size="small" aria-label="Turmas" width="100%">
                <TableHead>
                  <TableRow>
                    <TableCell>Escola</TableCell>
                    <TableCell>Turmas</TableCell>
                    <TableCell>Estudandes</TableCell>
                    <TableCell>Entrada Presentes</TableCell>
                    <TableCell>Entrada Ausentes</TableCell>
                    <TableCell>Saída Presentes</TableCell>
                    <TableCell>Saída Ausentes</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.escolas.map((registro) => (
                    <StyledTableRow key={registro.escola_id}>
                      <TableCell component="th" scope="row">
                        {registro.escola_nome}
                      </TableCell>
                      <TableCell width="110">{registro.qtd_turmas}</TableCell>
                      <TableCell width="110">{registro.qtd_alunos}</TableCell>
                      <TableCell width="110">{registro.qtd_alunos_entrada.total[0]}</TableCell>
                      <TableCell width="110">{registro.qtd_alunos_entrada.total[1]}</TableCell>
                      <TableCell width="110">{registro.qtd_alunos_saida.total[0]}</TableCell>
                      <TableCell width="110">{registro.qtd_alunos_saida.total[1]}</TableCell>
                      <TableCell width="94"></TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function RowZona(props) {
  const { row, filterOnClick, onSetOpen } = props;

  const _frequenciaEntrada = getFrequenciasAssociative(row.qtd_alunos_entrada);
  let _entradaPresente = _frequenciaEntrada['Presente'] ?? 0;
  let _entradaAusente = _frequenciaEntrada['Ausente'] ?? 0;

  const _frequenciaSaida = getFrequenciasAssociative(row.qtd_alunos_saida);
  let _saidaPresente = _frequenciaSaida['Presente'] ?? 0;
  let _saidaAusente = _frequenciaSaida['Ausente'] ?? 0;

  return (
    <StyledTableRow
      key={`tableStyledRowDash_${row.key}`}
      sx={{ '& > *': { borderBottom: 'unset' } }}
    >
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.zona_nome}</TableCell>
      <TableCell>{row.qtd_escolas ?? 0}</TableCell>
      <TableCell>{row.qtd_turmas ?? 0}</TableCell>
      <TableCell>{row.qtd_alunos ?? 0}</TableCell>
      <TableCell>{_entradaPresente ?? 0}</TableCell>
      <TableCell>{_entradaAusente ?? 0}</TableCell>
      <TableCell>{_saidaPresente ?? 0}</TableCell>
      <TableCell>{_saidaAusente ?? 0}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={() => filterOnClick(row.zona_id)}
        >
          Ver escolas
        </Button>
      </TableCell>
    </StyledTableRow>
  );
}

function RowEscola(props) {
  const { row, filterOnClick } = props;

  let _entradaPresente = 0;
  let _entradaAusente = 0;

  let _saidaPresente = 0;
  let _saidaAusente = 0;

  _.forEach(row.turmas, (_turma) => {
    const _frequenciaEntrada = getFrequenciasAssociative(_turma.qtd_alunos_entrada);
    _entradaPresente += _frequenciaEntrada['Presente'] ?? 0;
    _entradaAusente += _frequenciaEntrada['Ausente'] ?? 0;

    const _frequenciaSaida = getFrequenciasAssociative(_turma.qtd_alunos_saida);
    _saidaPresente += _frequenciaSaida['Presente'] ?? 0;
    _saidaAusente += _frequenciaSaida['Ausente'] ?? 0;
  });

  return (
    <StyledTableRow
      key={`tableStyledRowDash_${row.key}`}
      sx={{ '& > *': { borderBottom: 'unset' } }}
    >
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.escola_nome}</TableCell>
      <TableCell>{row.qtd_turmas ?? 0}</TableCell>
      <TableCell>{row.qtd_alunos ?? 0}</TableCell>
      <TableCell>{_entradaPresente ?? 0}</TableCell>
      <TableCell>{_entradaAusente ?? 0}</TableCell>
      {_saidaPresente > 0 && <TableCell>{_saidaPresente ?? 0}</TableCell>}
      {_saidaAusente > 0 && <TableCell>{_saidaAusente ?? 0}</TableCell>}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={() => filterOnClick(row.escola_id)}
        >
          Ver turmas
        </Button>
      </TableCell>
    </StyledTableRow>
  );
}

function RowTurma(props) {
  const { row } = props;

  const _frequenciaEntrada = getFrequenciasAssociative(row.qtd_alunos_entrada);
  let _entradaPresente = _frequenciaEntrada['Presente'] ?? 0;
  let _entradaAusente = _frequenciaEntrada['Ausente'] ?? 0;

  const _frequenciaSaida = getFrequenciasAssociative(row.qtd_alunos_saida);
  let _saidaPresente = _frequenciaSaida['Presente'] ?? 0;
  let _saidaAusente = _frequenciaSaida['Ausente'] ?? 0;

  return (
    <StyledTableRow
      key={`tableStyledRowDash_${row.key}`}
      sx={{ '& > *': { borderBottom: 'unset' } }}
    >
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.escola_nome}</TableCell>
      <TableCell>
        {row.turma_ano_escolar}º {row.turma_nome}
      </TableCell>
      <TableCell>{row.qtd_alunos ?? 0}</TableCell>
      <TableCell>{_entradaPresente ?? 0}</TableCell>
      <TableCell>{_entradaAusente ?? 0}</TableCell>
      {_saidaPresente > 0 && <TableCell>{_saidaPresente ?? 0}</TableCell>}
      {_saidaAusente > 0 && <TableCell>{_saidaAusente ?? 0}</TableCell>}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button
          component={RouterLink}
          color="primary"
          variant="contained"
          size="small"
          href={`${paths.dashboard.registro_aprendizagem.root_diagnostico}`}
        >
          Ver avaliações
        </Button>
      </TableCell>
    </StyledTableRow>
  );
}

function Row(props) {
  const { row, isZonaFiltered, isEscolaFiltered, filterOnClick, onSetOpen } = props;

  if (isEscolaFiltered) {
    return (
      <RowTurma
        row={{ ...row }}
        isZonaFiltered={isZonaFiltered}
        isEscolaFiltered={isEscolaFiltered}
        filterOnClick={(id) => filterOnClick(id)}
      />
    );
  } else if (isZonaFiltered) {
    return <RowEscola row={{ ...row }} filterOnClick={(id) => filterOnClick(id)} />;
  } else {
    return (
      <RowZona
        row={{ ...row }}
        onSetOpen={(open) => onSetOpen(open)}
        filterOnClick={(id) => filterOnClick(id)}
      />
    );
  }
}
