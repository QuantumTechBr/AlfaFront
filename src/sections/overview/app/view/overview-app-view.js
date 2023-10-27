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
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
//
import AppWidgetSummary from '../app-widget-summary';
import AppIndiceFases from '../app-indice-fases';
import AppDesempenhoAlunos from '../app-desempenho-alunos';
import AppAvaliacaoDiagnostico from '../app-avaliacao-diagnostico';
import AppAvaliacaoComponente from '../app-avaliacao-componente';

// ----------------------------------------------------------------------
import OverviewTableToolbar from './overview-table-toolbar';
import NovaAvaliacaoForm from '../../../registro_aprendizagem/registro-aprendizagem-modal-form';
import dashboardsMethods from '../../dashboards-repository';
import Iconify from 'src/components/iconify';

export default function OverviewAppView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();

  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);

  const [_escolasFiltered, setEscolasFiltered] = useState([]);
  const [_turmasFiltered, setTurmasFiltered] = useState([]);

  const defaultFilters = {
    zona: [],
    escola: [],
    // turma: [],
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [dados, setDados] = useState({
    total_usuarios_ativos: {},
    total_alunos_ativos: {},
    total_turmas_ativas: {},
    indice_fases_geral: {},
    indice_fases_1_ano: {},
    indice_fases_2_ano: {},
    indice_fases_3_ano: {},
    indice_fases_: {},
    desempenho_alunos: {},
    avaliacao_diagnostico: {},
    avaliacao_componente: {},
  });

  const getTurmasPorAnoEscolar = (anoEscolar) =>
    _turmasFiltered.filter((turma) => turma.ano_escolar == anoEscolar).map((turma) => turma.id);

  const preencheGraficos = async () => {
    const fullFilters = {
      ddz: filters.zona.map((item) => item.id),
      escola: filters.escola.map((item) => item.id),
      // turma: filters.turma.map((item) => item.id),
    };

    await Promise.all([
      dashboardsMethods
        .getDashboardTotalUsuariosAtivos({ ddz: fullFilters.ddz, escola: fullFilters.escola })
        .then((response) => {
          // console.table(response.data);
          setDados((prevState) => ({
            ...prevState,
            total_usuarios_ativos: response.data,
          }));
        }),
      dashboardsMethods
        .getDashboardTotalAlunosAtivos({ ddz: fullFilters.ddz, escola: fullFilters.escola })
        .then((response) => {
          // console.table(response.data);
          setDados((prevState) => ({
            ...prevState,
            total_alunos_ativos: response.data,
          }));
        }),
      dashboardsMethods
        .getDashboardTotalTurmasAtivas({ ...fullFilters.ddz, ...fullFilters.escola })
        .then((response) => {
          // console.table(response.data);
          setDados((prevState) => ({
            ...prevState,
            total_turmas_ativas: response.data,
          }));
        }),

      // ## FASES

      // 1 ANO
      dashboardsMethods
        .getDashboardIndiceFases({
          ...fullFilters,
          turma: getTurmasPorAnoEscolar(1),
          bimestre: null,
        })
        .then((response) => {
          // console.table(response.data);
          setDados((prevState) => ({
            ...prevState,
            indice_fases_1_ano: response.data,
          }));
        }),

      // 2 ANO
      dashboardsMethods
        .getDashboardIndiceFases({
          ...fullFilters,
          turma: getTurmasPorAnoEscolar(2),
          bimestre: null,
        })
        .then((response) => {
          // console.table(response.data);
          setDados((prevState) => ({
            ...prevState,
            indice_fases_2_ano: response.data,
          }));
        }),

      // 3 ANO
      dashboardsMethods
        .getDashboardIndiceFases({
          ...fullFilters,
          turma: getTurmasPorAnoEscolar(3),
          bimestre: null,
        })
        .then((response) => {
          // console.table(response.data);
          setDados((prevState) => ({
            ...prevState,
            indice_fases_3_ano: response.data,
          }));
        }),

      // GERAL
      dashboardsMethods
        .getDashboardIndiceFases({ ...fullFilters, bimestre: null })
        .then((response) => {
          // console.table(response.data);
          setDados((prevState) => ({
            ...prevState,
            indice_fases_geral: response.data,
          }));
        }),

      // ## DESEMPENHO ALUNO

      dashboardsMethods.getDashboardDesempenhoAlunos(fullFilters).then((response) => {
        // console.table(response.data);
        setDados((prevState) => ({
          ...prevState,
          desempenho_alunos: response.data,
        }));
      }),

      dashboardsMethods.getDashboardAvaliacaoDiagnostico(fullFilters).then((response) => {
        // console.table(response.data);
        setDados((prevState) => ({
          ...prevState,
          avaliacao_diagnostico: response.data,
        }));
      }),
      dashboardsMethods.getDashboardAvaliacaoComponente(fullFilters).then((response) => {
        // console.table(response.data);
        // setDados((prevState) => ({
        //   ...prevState,
        //   avaliacao_componente: response.data,
        // }));
      }),
    ]);
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

        // setTurmasFiltered(turmas);
        setFilters((prevState) => ({
          ...prevState,
          ['escola']: [],
          // ['turma']: [],
          [campo]: value,
        }));
      } else if (campo == 'escola') {
        if (value.length == 0) {
          // setTurmasFiltered(turmas);
        } else {
          // var filtered = turmas.filter((turma) =>
          //   value.map((escola) => escola.id).includes(turma.escola.id)
          // );
          // setTurmasFiltered(filtered);
        }
        setFilters((prevState) => ({
          ...prevState,
          // ['turma']: [],
          [campo]: value,
        }));
      } else {
        setFilters((prevState) => ({
          ...prevState,
          [campo]: value,
        }));
      }
    },
    [setFilters, setEscolasFiltered, escolas, setTurmasFiltered, turmas]
  );

  const preparacaoInicial = async () => {
    await Promise.all([
      buscaZonas(),
      buscaEscolas().then((_escolas) => setEscolasFiltered(_escolas)),
      buscaTurmas().then((_turmas) => setTurmasFiltered(_turmas)),
    ]);

    // preencheGraficos();
  };

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    if (escolas.length && turmas.length) {
      preencheGraficos();
    }
    //
  }, [zonas, escolas, turmas]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  const novaAvaliacao = useBoolean();
  const closeNovaAvaliacao = (retorno = null) => {
    novaAvaliacao.onFalse();
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        {/* <Grid xs={12} md={8}>
          <AppWelcome
            title={`Welcome back 👋 \n Nome`}
            description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
            img={<SeoIllustration />}
            action={
              <Button variant="contained" color="primary">
                Go Now
              </Button>
            }
          /> 
        </Grid> 

        <Grid xs={12} md={4}>
          <AppFeatured list={_appFeatured} />
        </Grid> */}
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
        <Stack flexGrow={1} direction="row" alignItems="center" justifyContent="start" width="100%">
          <Grid xs={12} md="auto">
            <OverviewTableToolbar
              filters={filters}
              onFilters={handleFilters}
              zonaOptions={zonas}
              escolaOptions={_escolasFiltered || escolas}
              // turmaOptions={_turmasFiltered || turmas}
            />
          </Grid>

          <Grid xs={12} md="auto">
            <Button variant="contained" onClick={preencheGraficos}>
              Aplicar filtro
            </Button>
          </Grid>
        </Stack>
        <NovaAvaliacaoForm open={novaAvaliacao.value} onClose={closeNovaAvaliacao} />
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
        {(dados.indice_fases_1_ano.chart?.series ?? []).length > 0 && (
          <Stack
            flexGrow={1}
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            width="100%"
          >
            <Grid xs={12} md={6} lg={5}>
              <AppIndiceFases
                title="Índice de Fases - 1º Ano"
                chart={dados.indice_fases_1_ano.chart ?? { series: [] }}
              />
            </Grid>
          </Stack>
        )}
        {(dados.indice_fases_2_ano.chart?.series ?? []).length > 0 && (
          <Stack
            flexGrow={1}
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            width="100%"
          >
            <Grid xs={12} md={6} lg={5}>
              <AppIndiceFases
                title="Índice de Fases - 2º Ano"
                chart={dados.indice_fases_2_ano.chart ?? { series: [] }}
              />
            </Grid>
          </Stack>
        )}
        {(dados.indice_fases_3_ano.chart?.series ?? []).length > 0 && (
          <Stack
            flexGrow={1}
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            width="100%"
          >
            <Grid xs={12} md={6} lg={5}>
              <AppIndiceFases
                title="Índice de Fases - 3º Ano"
                chart={dados.indice_fases_3_ano.chart ?? { series: [] }}
              />
            </Grid>
          </Stack>
        )}
        <Stack
          flexGrow={1}
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          width="100%"
        >
          <Grid xs={12} md={6} lg={5}>
            <AppIndiceFases
              title="Índice de Fases - Geral"
              chart={dados.indice_fases_geral.chart ?? { series: [] }}
            />
          </Grid>
        </Stack>
        
        <Grid xs={12}>
          <AppDesempenhoAlunos
            title="Desempenho dos Alunos"
            subheader={dados.desempenho_alunos.subheader}
            chart={dados.desempenho_alunos.chart ?? { categories: [], series: [] }}
          />
        </Grid>
        <Grid xs={12} lg={6} sx={{ my: 3 }}>
          {/* <AppAvaliacaoDiagnostico title="Avaliação Diagnóstica" list={dados.avaliacao_diagnostico} subheader="" /> */}
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
        <Grid xs={12} md={6} lg={6}>
          {/* <AppAvaliacaoComponente title="Avaliação por Componente" list={{}} /> */}
        </Grid>
      </Grid>
    </Container>
  );
}
