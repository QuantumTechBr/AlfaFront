'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import { _appFeatured, _appAuthors, _appInstalled, _appRelated, _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
//
import AppWidget from '../app-widget';
import AppWelcome from '../app-welcome';
import AppFeatured from '../app-featured';
import AppNewInvoice from '../app-new-invoice';
import AppTopAuthors from '../app-top-authors';
import AppTopRelated from '../app-top-related';
import AppAreaInstalled from '../app-area-installed';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import AppTopInstalledCountries from '../app-top-installed-countries';
import AppAvaliacaoDiagnostico from '../app-avaliacao-diagnostico';
import AppAvaliacaoComponente from '../app-avaliacao-componente';

// ----------------------------------------------------------------------
import NovaAvaliacaoForm from '../../../registro_aprendizagem/registro-aprendizagem-nova-avaliacao-form';
import { useBoolean } from 'src/hooks/use-boolean';
import OverviewTableToolbar from './overview-table-toolbar'; 

export default function OverviewAppView() {
 // const { user } = useMockedUser();

  const defaultFilters = {
    nome: ''
  };

  const [filters, setFilters] = useState(defaultFilters);

  const handleFilters = useCallback(
    (nome, value) => {
      setFilters((prevState) => ({
        ...prevState,
        [nome]: value,
      }));
    },
    [setFilters]
  );

  const theme = useTheme();
  const settings = useSettingsContext();

  const novaAvaliacao = useBoolean();

  const closeNovaAvaliacao = (retorno=null) => {
    novaAvaliacao.onFalse();
  }


  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>

        <Grid xs={12} md={10}>
          <Typography variant="h3" paragraph>
            Dashboard
          </Typography>

        </Grid>

        <Grid xs={12} md={8}>

          <OverviewTableToolbar
            filters={filters}
            onFilters={handleFilters}
            ddzOptions={[]}
            escolaOptions={[]}
            turmaOptions={[]}
          />

        </Grid>

        <Grid xs={12} md={2}>
          <Button variant="contained" color="primary" onClick={novaAvaliacao.onTrue}>
            Registro de Aprendizagem
          </Button>
        </Grid>

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
                  year: '2023',
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
                  year: '2022',
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
          <AppAvaliacaoComponente title="Avaliação por Component" list={_appRelated} /> 
        </Grid>

        </Grid>
    </Container>
  );
}
