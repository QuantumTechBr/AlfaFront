'use client';

import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

// theme
import { textGradient } from 'src/theme/css';

// contexts
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
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
import { first, last } from 'lodash';
import LoadingBox from 'src/components/helpers/loading-box';
import Iconify from 'src/components/iconify';

// assets
import { RegistroAprendizagemFases } from 'src/_mock';

// ----------------------------------------------------------------------
import DashboardDDZTableToolbar from './dashboard-ddz-table-toolbar';
import NovaAvaliacaoForm from 'src/sections/registro_aprendizagem/registro-aprendizagem-modal-form';
import dashboardsMethods from 'src/sections/overview/dashboards-repository';

import { AuthContext } from 'src/auth/context/alfa';

//
import NumeroComponent from '../../components/numero-component';
import IndicesCompostosFasesAlfabetizacaoWidget from '../../widgets/indices-compostos-fases-alfabetizacao-widget';
import DesempenhoAlunosWidget from '../../components/desempenho-alunos-widget';
import MetaComponent from '../../components/meta-component';

export default function DashboardDDZView() {
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);
  const [_escolasFiltered, setEscolasFiltered] = useState([]);
  const [_turmasFiltered, setTurmasFiltered] = useState([]);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(false);
  const [zonaFiltro, setZonaFiltro] = useState([]);

  const [filters, setFilters] = useState({
    anoLetivo: '',
    zona: zonaFiltro,
    escola: [],
    turma: [],
    bimestre: '',
  });

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
      ano_letivo: [(filters.anoLetivo != '' ? filters.anoLetivo : first(anosLetivos)).id],
      ddz: filters.zona.map((item) => item.id),
      escola: filters.escola.map((item) => item.id),
      turma: filters.turma.map((item) => item.id),
      bimestre: [(filters.bimestre != '' ? filters.bimestre : first(bimestres)).id], // todo change to last
    };

    if (anoEscolar && getTurmasPorAnoEscolar(anoEscolar).length == 0) {
      setDados((prevState) => ({
        ...prevState,
        [`indice_fases_${anoEscolar}_ano`]: {},
      }));
      return;
    }

    dashboardsMethods
      .getDashboardIndiceFases({
        ...fullFilters,
        turma: anoEscolar
          ? getTurmasPorAnoEscolar(anoEscolar)
          : filters.turma.length
          ? filters.turma.map((t) => t.id)
          : null,
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
    const fullFilters = {
      ano_letivo: [(filters.anoLetivo != '' ? filters.anoLetivo : first(anosLetivos)).id],
      ddz: filters.zona.map((item) => item.id),
      escola: filters.escola.map((item) => item.id),
      turma: filters.turma.map((item) => item.id),
      bimestre: [(filters.bimestre != '' ? filters.bimestre : first(bimestres)).id], // todo change to last
    };

    await Promise.all([
      dashboardsMethods
        .getDashboardTotalUsuariosAtivos({
          ano_letivo: fullFilters.ano_letivo,
          ddz: fullFilters.ddz,
          escola: fullFilters.escola,
        })
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
        .getDashboardTotalTurmasAtivas({
          ano_letivo: fullFilters.ano_letivo,
          ddz: fullFilters.ddz,
          escola: fullFilters.escola,
        })
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
          setTurmasFiltered(turmas);
        } else {
          var escolasFiltered = escolas.filter((escola) =>
            value.map((zona) => zona.id).includes(escola.zona.id)
          );
          var turmasFiltered = turmas.filter((turma) =>
            escolasFiltered.map((escola) => escola.id).includes(turma.escola.id)
          );
          setEscolasFiltered(escolasFiltered);
          setTurmasFiltered(turmasFiltered);
        }

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
      await Promise.all([
        buscaAnosLetivos(),
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
          bimestre: first(bimestres) // todo change to last,
        }));
      }
      if (anosLetivos && anosLetivos.length) {
        setFilters((prevState) => ({
          ...prevState,
          anoLetivo: first(anosLetivos),
        }));
      }
    }
  }, [contextReady.value]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {}, [contextReady.value]);

  useEffect(() => {
    let zf = [];
    if (user?.funcao_usuario?.length > 0) {
      if (user?.funcao_usuario[0]?.funcao?.nome == 'ASSESSOR DDZ') {
        zf = [user?.funcao_usuario[0]?.zona];
      } else {
        zf = [user?.funcao_usuario[0]?.escola?.zona];
      }
    }
    setZonaFiltro(zf);
    setFilters({
      anoLetivo: '',
      zona: zf,
      escola: [],
      turma: [],
      bimestre: '',
    });
  }, []);

  const filtroReset = () => {
    setFilters({
      anoLetivo: first(anosLetivos),
      zona: zonaFiltro,
      escola: [],
      turma: [],
      bimestre: first(bimestres), // todo change to last
    });
  };

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
            <Typography variant="h3">Dashboard (DDZ)</Typography>
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
              <DashboardDDZTableToolbar
                filters={filters}
                onFilters={handleFilters}
                anoLetivoOptions={anosLetivos}
                ddzOptions={zonas}
                escolaOptions={_escolasFiltered || escolas}
                anoTurmaOptions={_turmasFiltered || turmas}
                bimestreOptions={bimestres}
              />
            </Grid>
            <Grid xs={12} md="auto">
              <Button variant="contained" onClick={preencheGraficos}>
                Aplicar filtros
              </Button>

              <Button variant="soft" onClick={filtroReset} sx={{ margin: { left: 4 } }}>
                Limpar
              </Button>
            </Grid>
          </Stack>

          <Grid xs={12} md={4}>
            <NumeroComponent
              title="Total de Usuários Ativos"
              percents={dados.total_usuarios_ativos.percent}
              total={dados.total_usuarios_ativos.total}
              chart={{
                series: dados.total_usuarios_ativos.chart ?? [],
              }}
              icon={
                <Iconify
                  width={ICON_SIZE}
                  icon="bi:people-fill"
                  sx={{
                    // ...textGradient({
                    //   direction: '135deg',
                    //   startColor: theme.palette['primary'].main,
                    //   endColor: theme.palette['primary'].main,
                    // }),
                    color: theme.palette['primary'].main,
                  }}
                />
              }
            />
          </Grid>
          <Grid xs={12} md={4}>
            <NumeroComponent
              title="Total de Estudantes Avaliados"
              percent={dados.total_alunos_ativos.percent}
              total={dados.total_alunos_ativos.total}
              chart={{
                colors: [theme.palette.info.light, theme.palette.info.main],
                series: dados.total_alunos_ativos.chart?.series ?? [],
              }}
              icon={
                <Iconify
                  width={ICON_SIZE}
                  icon="bi:people-fill"
                  sx={{
                    color: theme.palette['primary'].main,
                  }}
                />
              }
            />
          </Grid>
          <Grid xs={12} md={4} alignSelf="">
            <MetaComponent title="Meta" total={76}></MetaComponent>
          </Grid>

          {!!isGettingGraphics.value && (
            <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
              <LoadingBox />
            </Grid>
          )}

          {!isGettingGraphics.value &&
            (dados.indice_fases_1_ano.chart?.series ?? []).length > 0 && (
              <IndicesCompostosFasesAlfabetizacaoWidget
                key="indices_component_1_ano"
                ano_escolar={1}
                indice_fases={dados.indice_fases_1_ano}
                indice_aprovacao={dados.indice_aprovacao_1_ano}
              />
            )}
          {!isGettingGraphics.value &&
            (dados.indice_fases_2_ano.chart?.series ?? []).length > 0 && (
              <IndicesCompostosFasesAlfabetizacaoWidget
                key="indices_component_2_ano"
                ano_escolar={2}
                indice_fases={dados.indice_fases_2_ano}
                indice_aprovacao={dados.indice_aprovacao_2_ano}
              />
            )}
          {!isGettingGraphics.value &&
            (dados.indice_fases_3_ano.chart?.series ?? []).length > 0 && (
              <IndicesCompostosFasesAlfabetizacaoWidget
                key="indices_component_3_ano"
                ano_escolar={3}
                indice_fases={dados.indice_fases_3_ano}
                indice_aprovacao={dados.indice_aprovacao_3_ano}
              />
            )}
          {!isGettingGraphics.value &&
            (dados.indice_fases_geral.chart?.series ?? []).length > 0 && (
              <IndicesCompostosFasesAlfabetizacaoWidget
                key="indices_component_geral"
                ano_escolar="Geral"
                indice_fases={dados.indice_fases_geral}
                indice_aprovacao={dados.indice_aprovacao_geral}
              />
            )}
        </Grid>

        {!isGettingGraphics.value && (dados.desempenho_alunos.chart?.series ?? []).length > 0 && (
          <Grid xs={12}>
            <DesempenhoAlunosWidget
              title="Desempenho dos Estudantes"
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
