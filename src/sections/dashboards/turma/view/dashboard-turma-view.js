'use client';

import { useEffect, useState, useCallback, useContext } from 'react';
import _ from 'lodash';

// @mui
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { Stack, Button, Typography, Container } from '@mui/material';

// contexts
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';

// routes
import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hook';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';

// components
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from 'src/components/settings';
import LoadingBox from 'src/components/helpers/loading-box';
import Iconify from 'src/components/iconify';

// _mock
import { anos_metas, anos_options } from 'src/_mock/assets';

// assets
import { RegistroAprendizagemFases } from 'src/_mock';

// ----------------------------------------------------------------------
import DashboardTurmaTableToolbar from './dashboard-turma-table-toolbar';
import NovaAvaliacaoForm from 'src/sections/registro_aprendizagem/registro-aprendizagem-modal-form';
import dashboardsMethods from 'src/sections/overview/dashboards-repository';

import { AuthContext } from 'src/auth/context/alfa';

//
import NumeroComponent from '../../components/numero-component';
import MetaComponent from '../../components/meta-component';
import IndicesCompostosFasesAlfabetizacaoWidget from '../../widgets/indices-compostos-fases-alfabetizacao-widget';
import DesempenhoAlunosWidget from '../../components/desempenho-alunos-widget';

export default function DashboardTurmaView() {
  const { checkPermissaoModulo } = useAuthContext();
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();

  const searchParams = useSearchParams();
  const initialTurma = searchParams.get('turma');

  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);
  const [_escolasFiltered, setEscolasFiltered] = useState([]);
  const [_turmasFiltered, setTurmasFiltered] = useState([]);

  const contextReady = useBoolean(false);

  const permissaoCadastrar = checkPermissaoModulo('registro_aprendizagem', 'cadastrar');

  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(true);
  const [zonaFiltro, setZonaFiltro] = useState([]);

  const [filters, setFilters] = useState({
    anoLetivo: '',
    zona: zonaFiltro,
    escola: [],
    turma: [],
    bimestre: '',
  });

  const _objDados = {
    indice_fases_geral: {},
    indice_aprovacao_geral: {},
    desempenho_alunos: {},
  };

  (anos_options ?? []).forEach((option) => {
    Object.assign(_objDados, { [`indice_fases_${option}_ano`]: {} });
    Object.assign(_objDados, { [`indice_aprovacao_${option}_ano`]: {} });
  });

  const [dados, setDados] = useState(_objDados);

  const getFormattedSeries = (series) => {
    const formattedSeries = [];
    for (const [key, value] of Object.entries(RegistroAprendizagemFases)) {
      formattedSeries.push({
        label: value,
        value: series.find((item) => item.label == value)?.value ?? 0,
      });
    }
    return formattedSeries;
  };

  const getTurmasPorAnoEscolar = useCallback(
    (anoEscolar) => {
      const _turmas = filters.turma.length > 0 ? filters.turma : _turmasFiltered;
      return _turmas.filter((turma) => turma.ano_escolar == anoEscolar).map((turma) => turma.id);
    },
    [filters, _turmasFiltered]
  );

  const getIndiceFases = useCallback(
    async (anoEscolar, payloadFilters) => {
      let _turmasPorAno = getTurmasPorAnoEscolar(anoEscolar);
      if (payloadFilters.turma && payloadFilters.turma.length > 0) {
        _turmasPorAno = _turmasPorAno.filter((e) => payloadFilters.turma.includes(e));
      }

      if (anoEscolar && _turmasPorAno.length == 0) {
        setDados((prevState) => ({
          ...prevState,
          [`indice_fases_${anoEscolar}_ano`]: {},
        }));
        return;
      }

      dashboardsMethods
        .getDashboardIndiceFases({
          ...payloadFilters,
          turma: anoEscolar
            ? _turmasPorAno
            : payloadFilters.turma.length > 0
            ? payloadFilters.turma.map((t) => t.id ?? t)
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
        });
      dashboardsMethods
        .getDashboardIndiceAprovacao({
          ...payloadFilters,
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
    },
    [getTurmasPorAnoEscolar]
  );

  const preencheGraficos = useCallback(
    async (_filters) => {
      console.log('preencheGraficos');
      const _filtersToSearch = _filters ?? filters;
      isGettingGraphics.onTrue();
      const payloadFilters = {
        ano_letivo: [
          (_filtersToSearch.anoLetivo != '' ? _filtersToSearch.anoLetivo : _.first(anosLetivos)).id,
        ],
        ddz: _filtersToSearch.zona.map((item) => item.id),
        escola: _filtersToSearch.escola.map((item) => item.id),
        turma: _filtersToSearch.turma.map((item) => item.id),
        bimestre: [
          (_filtersToSearch.bimestre != '' ? _filtersToSearch.bimestre : _.last(bimestres)).id,
        ],
      };

      await Promise.all([
        // ## INDICE DE FASES
        ...anos_options.map((_anoOption) => getIndiceFases(parseInt(_anoOption), payloadFilters)),
        getIndiceFases(null, payloadFilters),

        // ## DESEMPENHO ALUNO
        dashboardsMethods
          .getDashboardDesempenhoAlunos({
            ano_letivo: payloadFilters.ano_letivo,
            ddz: payloadFilters.ddz,
            escola: payloadFilters.escola,
            turma: payloadFilters.turma,
          })
          .then((response) => {
            setDados((prevState) => ({
              ...prevState,
              desempenho_alunos: response.data,
            }));
          }),
      ]);

      isGettingGraphics.onFalse();
    },
    [filters, bimestres, anosLetivos, getIndiceFases, isGettingGraphics]
  );

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
            escolasFiltered.map((escola) => escola.id).includes(turma.escola_id)
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
            value.map((escola) => escola.id).includes(turma.escola_id)
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
    [setFilters, setEscolasFiltered, escolas, setTurmasFiltered, turmas]
  );

  const preparacaoInicial = useCallback(() => {
    if (!preparacaoInicialRunned.value) {
      preparacaoInicialRunned.onTrue();
      Promise.all([
        buscaAnosLetivos(),
        buscaZonas(),
        buscaEscolas().then((_escolas) => setEscolasFiltered(_escolas)),
        buscaTurmas().then((_turmas) => setTurmasFiltered(_turmas)),
        buscaBimestres(),
      ]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [
    preparacaoInicialRunned,
    buscaAnosLetivos,
    buscaZonas,
    buscaEscolas,
    buscaTurmas,
    buscaBimestres,
    contextReady,
  ]);

  useEffect(() => {
    if (contextReady.value) {
      const _turma = turmas.filter((t) => t.id == initialTurma);
      const _escola = escolas.filter((e) => e.id == _turma[0]?.escola_id);

      const _filters = {
        ...filters,
        ...(anosLetivos && anosLetivos.length > 0 ? { anoLetivo: _.first(anosLetivos) } : {}),
        zona: _escola.length > 0 ? zonas.filter((z) => z.id == _escola[0]?.zona.id) : filters.zona,
        escola: _escola.length > 0 ? _escola : escolas.length == 1 ? escolas : [],
        turma: _turma.length > 0 ? _turma : turmas.length == 1 ? turmas : [],
        ...(bimestres && bimestres.length > 0 ? { bimestre: _.last(bimestres) } : {}),
      };
      setFilters((prevState) => ({ ...prevState, ..._filters }));
      preencheGraficos(_filters);
    }
  }, [contextReady.value]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {
    let _zonaFiltro = [];
    if (user?.funcao_usuario?.length > 0) {
      if (user?.funcao_usuario[0]?.funcao?.nome == 'ASSESSOR DDZ') {
        _zonaFiltro = [user?.funcao_usuario[0]?.zona];
      } else {
        _zonaFiltro = [user?.funcao_usuario[0]?.escola?.zona];
      }
    }
    setZonaFiltro(_zonaFiltro);
    setFilters({
      anoLetivo: '',
      zona: _zonaFiltro,
      escola: [],
      turma: [],
      bimestre: '',
    });
  }, [user?.funcao_usuario]);

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, []);

  const filtroReset = () => {
    setFilters({
      anoLetivo: _.first(anosLetivos),
      zona: zonaFiltro,
      escola: [],
      turma: [],
      bimestre: _.last(bimestres),
    });
  };

  const novaAvaliacao = useBoolean();
  const closeNovaAvaliacao = (retorno = null) => {
    novaAvaliacao.onFalse();
  };

  const indiceDeFasesCount = useCallback(
    (ano) => {
      const _list = [];
      anos_options.forEach((option) => {
        const _series = dados[`indice_fases_${option}_ano`]?.chart?.series ?? [];
        _list[+option] = _series.length;
      });

      if (ano) return _list[+ano];
      return _list;
    },
    [dados]
  );

  const countHasIndiceDeFases = () => {
    return indiceDeFasesCount().filter((i) => i > 0).length;
  };

  const anoHasIndiceDeFases = useCallback(
    (ano) => {
      let _ano;
      indiceDeFasesCount().forEach((value, index) => {
        if (value > 0) {
          _ano = index;
        }
      });
      return _ano;
    },
    [indiceDeFasesCount]
  );

  const getAlfabetizadosAno = useCallback(
    (ano) => {
      const _series = dados[`indice_aprovacao_${ano}_ano`]?.categories[0]?.series ?? [];
      const _amount = _series.filter((s) => s.name == 'Alfabetizado')[0]?.amount ?? 0;
      return _amount;
    },
    [dados]
  );

  const getIndiceDeAprovacaoAno = useCallback(
    (ano) => {
      return _.sumBy(
        dados[`indice_aprovacao_${anoHasIndiceDeFases()}_ano`]?.categories[0]?.series,
        (s) => s.amount
      );
    },
    [dados, anoHasIndiceDeFases]
  );

  const getTotalEstudandes = useCallback(
    (ano_escolar) => {
      const _indice_fases = ano_escolar
        ? dados[`indice_fases_${+ano_escolar}_ano`]
        : dados.indice_fases_geral;
      return (_indice_fases.chart?.series ?? []).reduce((acc, item) => acc + item.value, 0);
    },
    [dados]
  );

  const getTotalEstudandesAvaliados = useCallback(
    (ano_escolar) => {
      const _indice_fases = ano_escolar
        ? dados[`indice_fases_${+ano_escolar}_ano`]
        : dados.indice_fases_geral;
      return (_indice_fases.chart?.series ?? []).reduce(
        (acc, item) => acc + (item.label != 'Não Avaliado' ? item.value : 0),
        0
      );
    },
    [dados]
  );

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
            <Typography variant="h3">Dashboard (Turma)</Typography>
          </Grid>

          {permissaoCadastrar && (
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
          )}
        </Stack>

        {!contextReady.value && (
          <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
            <LoadingBox />
          </Grid>
        )}

        {!!contextReady.value && (
          <>
            <Stack
              marginBottom={3}
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
              sx={{ position: { md: 'sticky' }, top: { md: 0 }, zIndex: { md: 1101 } }}
              paddingY={1}
            >
              <Grid xs={12} md="auto" paddingY={0}>
                <DashboardTurmaTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  anoLetivoOptions={anosLetivos}
                  ddzOptions={zonas}
                  escolaOptions={_escolasFiltered || escolas}
                  anoTurmaOptions={(_turmasFiltered || turmas).filter((t) =>
                    filters.escola.map((e) => e.id).includes(t.escola_id)
                  )}
                  bimestreOptions={bimestres}
                />
              </Grid>
              <Grid xs={12} md="auto" paddingY={0}>
                <Button
                  variant="contained"
                  sx={{
                    width: {
                      xs: '70%',
                      md: 'auto',
                    },
                  }}
                  onClick={() => {
                    preencheGraficos();
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
                <LoadingBox />
              </Grid>
            )}

            {!isGettingGraphics.value && (
              <Grid container marginX={0} spacing={3} marginTop={3} width="100%">
                <Grid xs={12} md={4}>
                  <NumeroComponent
                    title="Total de Estudantes"
                    total={getTotalEstudandes()}
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
                <Grid xs={12} md={4}>
                  <NumeroComponent
                    title="Total de Estudantes Avaliados"
                    total={getTotalEstudandesAvaliados()}
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
                <Grid xs={12} md={4}>
                  {countHasIndiceDeFases() > 1 && (
                    <Typography
                      textAlign="center"
                      alignItems="center"
                      variant="body2"
                      sx={{ padding: 4, height: '100%', display: 'flex' }}
                    >
                      A meta é exibida apenas com único ano escolar (série) selecionado no filtro
                      Ano-Turma.
                    </Typography>
                  )}
                  {countHasIndiceDeFases() == 1 &&
                    dados[`indice_aprovacao_${anoHasIndiceDeFases()}_ano`]?.categories && (
                      <MetaComponent
                        title="Meta"
                        subtitle={`sobre a meta de ${
                          anos_metas[anoHasIndiceDeFases()]
                        }% alfabetizados`}
                        meta={anos_metas[anoHasIndiceDeFases()]}
                        alfabetizados={getAlfabetizadosAno(anoHasIndiceDeFases())}
                        total={getIndiceDeAprovacaoAno(anoHasIndiceDeFases())}
                      ></MetaComponent>
                    )}
                </Grid>

                {anos_options.map((ano_escolar) => {
                  if (indiceDeFasesCount(ano_escolar) > 0) {
                    const _indice_fases = dados[`indice_fases_${+ano_escolar}_ano`];
                    const _indice_alfabetizacao = dados[`indice_aprovacao_${+ano_escolar}_ano`];

                    return (
                      <IndicesCompostosFasesAlfabetizacaoWidget
                        key={`indices_component_${+ano_escolar}_ano`}
                        ano_escolar={+ano_escolar}
                        total_avaliados={getTotalEstudandesAvaliados(ano_escolar)}
                        indice_fases={_indice_fases}
                        indice_alfabetizacao={_indice_alfabetizacao}
                      />
                    );
                  }
                })}

                {(dados.indice_fases_geral.chart?.series ?? []).length > 0 &&
                  countHasIndiceDeFases() > 1 && (
                    <IndicesCompostosFasesAlfabetizacaoWidget
                      key="indices_component_geral"
                      indice_fases={dados.indice_fases_geral}
                      indice_alfabetizacao={dados.indice_aprovacao_geral}
                    />
                  )}

                {dados.desempenho_alunos.chart &&
                  (dados.desempenho_alunos.chart?.series ?? []).length > 0 && (
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
                    component={RouterLink}
                    href={paths.dashboard.registro_aprendizagem.root_diagnostico}
                    sx={{ mr: 3, marginTop: 2 }}
                  >
                    Ir para Acompanhamento Diagnóstico
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    component={RouterLink}
                    href={paths.dashboard.registro_aprendizagem.root_componente}
                    sx={{ mr: 3, marginTop: 2 }}
                  >
                    Ir para Acompanhamento por Componente
                  </Button>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Grid>
      <NovaAvaliacaoForm open={novaAvaliacao.value} onClose={closeNovaAvaliacao} />
    </Container>
  );
}
