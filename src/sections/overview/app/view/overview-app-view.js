'use client';

import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { Box } from "@mui/material";
// hooks
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
// _mock
import {  _appRelated, } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
//
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import AppAreaInstalled from '../app-area-installed';
import AppAvaliacaoDiagnostico from '../app-avaliacao-diagnostico';
import AppAvaliacaoComponente from '../app-avaliacao-componente';

// ----------------------------------------------------------------------
import OverviewTableToolbar from './overview-table-toolbar';
import NovaAvaliacaoForm from '../../../registro_aprendizagem/registro-aprendizagem-modal-form';
import dashboardsMethods from '../../dashboards-repository';

export default function OverviewAppView() {
  const theme = useTheme();
  const settings = useSettingsContext();

  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);

  const [_escolasFiltered, setEscolasFiltered] = useState([]);
  const [_turmasFiltered, setTurmasFiltered] = useState([]);

  const defaultFilters = {
    zona: [],
    escola: [],
    turma: [],
  };
  
  const [filters, setFilters] = useState(defaultFilters);

  const preencheGraficos = async () => {
    const getObj = {escolaIds:filters.escola, turmaIds:filters.turma}

    Promise.all([
      dashboardsMethods.getDashboardAvaliacaoComponente(getObj).then((response) => { console.table(response.data); }),
      dashboardsMethods.getDashboardIndiceFases(getObj).then((response) => { console.table(response.data); }),
      dashboardsMethods.getDashboardTotalAlunosAtivos(getObj).then((response) => { console.table(response.data); }),
      dashboardsMethods.getDashboardTotalTurmasAtivas(getObj).then((response) => { console.table(response.data); }),
      dashboardsMethods.getDashboardTotalUsuariosAtivos(getObj).then((response) => { console.table(response.data); }),
    ]);
  }

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
      }

      else if (campo == 'escola') {
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
      }else{
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

    preencheGraficos();
  };

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    // 
  }, [zonas, escolas, turmas]); // CHAMADA SEMPRE QUE ESTES MUDAREM
  
  const novaAvaliacao = useBoolean();
  const closeNovaAvaliacao = (retorno=null) => {
    novaAvaliacao.onFalse();
  }

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
            <Typography variant="h3">
              Dashboard
            </Typography>
          </Grid>
          
          <Grid xs={12} md="auto">
            <Button variant="contained" color="primary" onClick={novaAvaliacao.onTrue}>
              Registro de Aprendizagem
            </Button>
          </Grid>
        </Stack>

        <Stack
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="start"
          width="100%"
        >

        <Grid xs={12} md="auto">

          <OverviewTableToolbar
            filters={filters}
            onFilters={handleFilters}
            zonaOptions={zonas}
            escolaOptions={_escolasFiltered || escolas}
            turmaOptions={_turmasFiltered  || turmas}
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
            percent={2.6}
            total={18765}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total de Alunos Cadastrados"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Número de Turmas Ativas"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Índice de Fases"
            chart={{
              series: [
                { label: '', value: 12244 },
                { label: '', value: 53345 },
                { label: '', value: 44313 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Desempenho dos Alunos"
            subheader="(+43%) que o ano passado"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  year: '2019',
                  data: [
                    {
                      name: '',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: '',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  year: '2020',
                  data: [
                    {
                      name: 'Asia',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'America',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} lg={6}>
          <AppAvaliacaoDiagnostico title="Avaliação Diagnóstica" subheader="" />
        </Grid>

        <Grid xs={12} md={6} lg={6}>
          <AppAvaliacaoComponente title="Avaliação por Componente" list={_appRelated} />
        </Grid>
        
      </Grid>
    </Container>
  );
}
