import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';

// components
import Chart, { useChart } from 'src/components/chart';
import { Box, Stack, Typography } from '@mui/material';
import { px } from 'framer-motion';
import { slugify } from 'src/utils/functions';
import { fPercent } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function IndiceAlfabetizacaoComponent({
  title,
  subheader,
  indice_alfabetizacao = [],
  options,
  ...other
}) {
  const totalItems = indice_alfabetizacao.reduce((total, item) => total + item.amount, 0);
  indice_alfabetizacao.forEach((element) => {
    element.porcentagem = Math.round((element.amount / totalItems) * 100);
  });

  const colors = ['#009a50', '#d11400', '#006abc'];

  const chartSeries = indice_alfabetizacao.map((element) => element.amount);

  const getLegend = () => {
    return Object.entries(colors).map(([key, value]) => {
      return (
        <Stack
          key={`indice_alfabetizacao_component_card_${slugify(title)}_${key}`}
          direction="row"
          alignItems="center"
          sx={{ px: 0, my: 0.8 }}
        >
          <Box
            sx={{ width: 14, height: 14, borderRadius: 0.5, mr: 0.4, backgroundColor: value }}
          ></Box>
          <Box>
            <Typography variant="body2" fontSize={13} fontWeight="600" color="black">
              {indice_alfabetizacao[key]?.name ?? ''}
            </Typography>
          </Box>
        </Stack>
      );
    });
  };

  const chartOptions = useChart({
    labels: indice_alfabetizacao.map((element) => element.name),
    plotOptions: {
      pie: {
        donut: {
          hollow: {
            size: '20%',
          },
          labels: {
            show: true,
            name: {
              fontSize: '14px',
            },
            value: {
              fontSize: '24px',
            },
            total: { show: false },
          },
        },
      },
    },

    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return fPercent(val.toFixed(1));
      },
      dropShadow: {
        enabled: false,
      },
    },

    legend: {
      show: false,
    },
    colors: colors,
    tooltip: { enabled: false },

    ...options,
  });

  return (
    <Card {...other} sx={{ pb: 2 }}>
      <Typography variant="h4" fontWeight="400" sx={{ mb: 0, p: 3 }}>
        {title}
      </Typography>

      <Chart
        dir="ltr"
        width={'100%'}
        type="donut"
        series={chartSeries}
        options={chartOptions}
        height={300}
        sx={{ mb: 1 }}
      />

      <Stack direction="row" justifyContent={'space-evenly'}>
        {getLegend()}
      </Stack>
    </Card>
  );
}

IndiceAlfabetizacaoComponent.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  indice_alfabetizacao: PropTypes.array,
};