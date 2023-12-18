'use client';

import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { Box } from '@mui/material';
// hooks
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
// assets
import { RegistroAprendizagemFases } from 'src/_mock';
//
import AppWidgetSummary from '../app-widget-summary';
import AppDesempenhoAlunos from '../app-desempenho-alunos';

// ----------------------------------------------------------------------
import OverviewTableToolbar from './overview-table-toolbar';
import NovaAvaliacaoForm from '../../../registro_aprendizagem/registro-aprendizagem-modal-form';
import dashboardsMethods from '../../dashboards-repository';
import Iconify from 'src/components/iconify';
import IndicesComponent from './components/indices-component';
import last from 'lodash/last';
import LoadingBox from 'src/components/helpers/loading-box';
import { AuthContext } from 'src/auth/context/alfa';

export default function OverviewAppView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);
  const [_escolasFiltered, setEscolasFiltered] = useState([]);
  const [_turmasFiltered, setTurmasFiltered] = useState([]);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(false);
  const defaultFilters = {
    zona: user?.funcao_usuario?.length > 0 ? [user?.funcao_usuario[0]?.escola?.zona] : [],
    escola: [],
    turma: [],
    bimestre: '',
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [dados, setDados] = useState({
    total_usuarios_ativos: {},
    total_alunos_ativos: {},
    total_turmas_ativas: {},

    indice_fases_1_ano: {},
    indice_aprovacao_1_ano: {},
    indice_fases_2_ano: {},
    indice_aprovacao_2_ano: {},
    indice_fases_3_ano: {},
    indice_aprovacao_3_ano: {},
    indice_fases_geral: {},
    indice_aprovacao_geral: {},

    desempenho_alunos: {},
  });

  const getFormattedSeries = (series) => {
    let formattedSeries = [];
    for (const [key, value] of Object.entries(RegistroAprendizagemFases)) {
      formattedSeries.push({
        label: value,
        value: series.find((item) => item.label == value)?.value ?? 0,
      });
    }
    return formattedSeries;
  };

  const getTurmasPorAnoEscolar = (anoEscolar) => {
    const _turmas = filters.turma.length ? filters.turma : _turmasFiltered;
    return _turmas.filter((turma) => turma.ano_escolar == anoEscolar).map((turma) => turma.id);
  };

  const getIndices = async (anoEscolar) => {
    const fullFilters = {
      ddz: filters.zona.map((item) => item.id),
      escola: filters.escola.map((item) => item.id),
      bimestre: [(filters.bimestre != '' ? filters.bimestre : last(bimestres)).id],
    };

    if (anoEscolar && getTurmasPorAnoEscolar(anoEscolar).length == 0) {
      return 
    }
    dashboardsMethods
      .getDashboardIndiceFases({
        ...fullFilters,
        turma: anoEscolar ? getTurmasPorAnoEscolar(anoEscolar) : null,
      })
      .then((response) => {
        if (response.data.chart?.series && response.data.chart?.series.length > 0) {
          response.data.chart.series = getFormattedSeries(response.data.chart.series);
        }

        setDados((prevState) => ({
          ...prevState,
          [anoEscolar ? `indice_fases_${anoEscolar}_ano` : `indice_fases_geral`]: response.data,
        }));
      }),
      dashboardsMethods
        .getDashboardIndiceAprovacao({
          ...fullFilters,
          turma: anoEscolar ? getTurmasPorAnoEscolar(anoEscolar) : null,
        })
        .then((response) => {
          setDados((prevState) => ({
            ...prevState,
            [anoEscolar ? `indice_aprovacao_${anoEscolar}_ano` : `indice_aprovacao_geral`]: {
              ...response.data,
              hasSeries: (response.data.categories ?? []).length > 0,
            },
          }));
        });
  };

  const preencheGraficos = async () => {
    isGettingGraphics.onTrue();
    console.log('preencheGraficos');
    const fullFilters = {
      ddz: filters.zona.map((item) => item.id),
      escola: filters.escola.map((item) => item.id),
      turma: filters.turma.map((item) => item.id),
    };

    await Promise.all([
      dashboardsMethods
        .getDashboardTotalUsuariosAtivos({ ddz: fullFilters.ddz, escola: fullFilters.escola })
        .then((response) => {
          setDados((prevState) => ({
            ...prevState,
            total_usuarios_ativos: response.data,
          }));
        }),
      dashboardsMethods.getDashboardTotalAlunosAtivos(fullFilters).then((response) => {
        setDados((prevState) => ({
          ...prevState,
          total_alunos_ativos: response.data,
        }));
      }),
      dashboardsMethods
        .getDashboardTotalTurmasAtivas({ ddz: fullFilters.ddz, escola: fullFilters.escola })
        .then((response) => {
          setDados((prevState) => ({
            ...prevState,
            total_turmas_ativas: response.data,
          }));
        }),

      // ## FASES
      getIndices(1),
      getIndices(2),
      getIndices(3),
      getIndices(null),

      // ## DESEMPENHO ALUNO
      dashboardsMethods.getDashboardDesempenhoAlunos(fullFilters).then((response) => {
        setDados((prevState) => ({
          ...prevState,
          desempenho_alunos: response.data,
        }));
      }),
    ]);

    isGettingGraphics.onFalse();
  };

  const handleFilters = useCallback(
    (campo, value) => {
      if (campo == 'zona') {
        if (value.length == 0) {
          setEscolasFiltered(escolas);
        } else {
          var filtered = escolas.filter((escola) =>
            value.map((zona) => zona.id).includes(escola.zona.id)
          );
          setEscolasFiltered(filtered);
        }

        setTurmasFiltered(turmas);
        setFilters((prevState) => ({
          ...prevState,
          ['escola']: [],
          ['turma']: [],
          [campo]: value,
        }));
      } else if (campo == 'escola') {
        if (value.length == 0) {
          setTurmasFiltered(turmas);
        } else {
          var filtered = turmas.filter((turma) =>
            value.map((escola) => escola.id).includes(turma.escola.id)
          );
          setTurmasFiltered(filtered);
        }
        setFilters((prevState) => ({
          ...prevState,
          ['turma']: [],
          [campo]: value,
        }));
      } else {
        setFilters((prevState) => ({
          ...prevState,
          [campo]: value,
        }));
      }
    },
    [setFilters, setEscolasFiltered, escolas, setTurmasFiltered, turmas, bimestres]
  );

  const preparacaoInicial = async () => {
    if (preparacaoInicialRunned.value === false) {
      preparacaoInicialRunned.onTrue();
      console.log('preparacaoInicial');
      await Promise.all([
        buscaZonas(),
        buscaEscolas().then((_escolas) => setEscolasFiltered(_escolas)),
        buscaTurmas().then((_turmas) => setTurmasFiltered(_turmas)),
        buscaBimestres(),
      ]);

      contextReady.onTrue();
    }
  };

  preparacaoInicial(); // chamada unica

  useEffect(() => {
    if (contextReady.value) {
      preencheGraficos();

      if (bimestres && bimestres.length) {
        setFilters((prevState) => ({
          ...prevState,
          bimestre: last(bimestres),
        }));
      }
    }
  }, [contextReady.value]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {}, [contextReady.value]);

  const novaAvaliacao = useBoolean();
  const closeNovaAvaliacao = (retorno = null) => {
    novaAvaliacao.onFalse();
  };

  const handleChangeBimestreFn = (value) => {
    setFilters((prevState) => ({
      ...prevState,
      bimestre: value,
    }));

    preencheGraficos();
  };

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
            <Typography variant="h3">Dashboard</Typography>
          </Grid>

          <Grid xs={12} md="auto">
            <Button
              variant="contained"
              color="primary"
              onClick={novaAvaliacao.onTrue}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Registro de Aprendizagem
            </Button>
          </Grid>
        </Stack>

        <Grid container spacing={3}>
          <Stack
            flexGrow={1}
            direction="row"
            alignItems="center"
            justifyContent="start"
            width="100%"
            sx={{ position: 'sticky', top: 0, zIndex: 1101 }}
          >
            <Grid xs={12} md="auto">
              <OverviewTableToolbar
                filters={filters}
                onFilters={handleFilters}
                zonaOptions={zonas}
                escolaOptions={_escolasFiltered || escolas}
                turmaOptions={_turmasFiltered || turmas}
                bimestreOptions={bimestres}
              />
            </Grid>
            <Grid xs={12} md="auto">
              <Button variant="contained" onClick={preencheGraficos}>
                Aplicar filtro
              </Button>
            </Grid>
          </Stack>

          <Grid xs={12} md={4}>
            <AppWidgetSummary
              title="Total de Usuários Ativos"
              percents={dados.total_usuarios_ativos.percent}
              total={dados.total_usuarios_ativos.total}
              chart={{
                series: dados.total_usuarios_ativos.chart ?? [],
              }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <AppWidgetSummary
              title="Total de Alunos Cadastrados"
              percent={dados.total_alunos_ativos.percent}
              total={dados.total_alunos_ativos.total}
              chart={{
                colors: [theme.palette.info.light, theme.palette.info.main],
                series: dados.total_alunos_ativos.chart?.series ?? [],
              }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <AppWidgetSummary
              title="Número de Turmas Ativas"
              percent={dados.total_turmas_ativas.percent}
              total={dados.total_turmas_ativas.total}
              chart={{
                colors: [theme.palette.warning.light, theme.palette.warning.main],
                series: dados.total_turmas_ativas.chart?.series ?? [],
              }}
            />
          </Grid>

          {!!isGettingGraphics.value && (
            <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
              <LoadingBox />
            </Grid>
          )}

          {!isGettingGraphics.value &&
            (dados.indice_fases_1_ano.chart?.series ?? []).length > 0 && (
              <IndicesComponent
                key="indices_component_1_ano"
                ano_escolar={1}
                indice_fases={dados.indice_fases_1_ano}
                indice_aprovacao={dados.indice_aprovacao_1_ano}
                bimestres={bimestres}
                selectedBimestre={filters.bimestre}
                onChangeBimestre={handleChangeBimestreFn}
              />
            )}
          {!isGettingGraphics.value &&
            (dados.indice_fases_2_ano.chart?.series ?? []).length > 0 && (
              <IndicesComponent
                key="indices_component_2_ano"
                ano_escolar={2}
                indice_fases={dados.indice_fases_2_ano}
                indice_aprovacao={dados.indice_aprovacao_2_ano}
                bimestres={bimestres}
                selectedBimestre={filters.bimestre}
                onChangeBimestre={handleChangeBimestreFn}
              />
            )}
          {!isGettingGraphics.value &&
            (dados.indice_fases_3_ano.chart?.series ?? []).length > 0 && (
              <IndicesComponent
                key="indices_component_3_ano"
                ano_escolar={3}
                indice_fases={dados.indice_fases_3_ano}
                indice_aprovacao={dados.indice_aprovacao_3_ano}
                bimestres={bimestres}
                selectedBimestre={filters.bimestre}
                onChangeBimestre={handleChangeBimestreFn}
              />
            )}
          {!isGettingGraphics.value &&
            (dados.indice_fases_geral.chart?.series ?? []).length > 0 && (
              <IndicesComponent
                key="indices_component_geral"
                ano_escolar="Geral"
                indice_fases={dados.indice_fases_geral}
                indice_aprovacao={dados.indice_aprovacao_geral}
                bimestres={bimestres}
                selectedBimestre={filters.bimestre}
                onChangeBimestre={handleChangeBimestreFn}
              />
            )}
        </Grid>

        {!isGettingGraphics.value && (dados.desempenho_alunos.chart?.series ?? []).length > 0 && (
          <Grid xs={12}>
            <AppDesempenhoAlunos
              title="Desempenho dos Alunos"
              subheader={dados.desempenho_alunos.subheader}
              chart={dados.desempenho_alunos.chart ?? { categories: [], series: [] }}
            />
          </Grid>
        )}

        <Grid xs={12} lg={6} sx={{ my: 3 }}>
          <Button
            variant="contained"
            color="info"
            onClick={() => router.push(paths.dashboard.registro_aprendizagem.root_diagnostico)}
            sx={{ mr: 3 }}
          >
            Ir para Avaliação Diagnóstica
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => router.push(paths.dashboard.registro_aprendizagem.root_componente)}
            sx={{ mr: 3 }}
          >
            Ir para Avaliação por Componente
          </Button>
        </Grid>
      </Grid>

      <NovaAvaliacaoForm open={novaAvaliacao.value} onClose={closeNovaAvaliacao} />
    </Container>
  );
}
