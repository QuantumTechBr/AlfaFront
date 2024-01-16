import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';

// components
import Chart, { useChart } from 'src/components/chart';
import { Box, Stack, Typography } from '@mui/material';
import { px } from 'framer-motion';
import { slugify } from 'src/utils/functions';

// ----------------------------------------------------------------------

export default function IndiceAprovacaoComponent({ title, subheader, series, options, ...other }) {
  const totalItems = series.reduce((total, item) => total + item.amount, 0);
  series.forEach((element) => {
    element.porcentagem = Math.round((element.amount / totalItems) * 100);
  });

  const colors = ['#009a50', '#d11400', '#006abc'];

  const chartSeries = series.map((element) => element.porcentagem);

  const getLegend = () => {
    return Object.entries(colors).map(([key, value]) => {
      return (
        <Stack
          key={`indice_aprovacao_component_item_card_${slugify(title)}_${key}`}
          direction="row"
          sx={{ px: 3, my: 0.8 }}
        >
          <Box
            sx={{ width: 20, height: 20, borderRadius: 0.5, mr: 2, backgroundColor: value }}
          ></Box>
          <Box>
            <Typography variant="body2" fontWeight="600" color="black">
              {series[key]?.name ?? ''}
            </Typography>
          </Box>
        </Stack>
      );
    });
  };

  const chartOptions = useChart({
    labels: series.map((element) => element.name),
    total: { show: false },

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
        height={270}
        sx={{ mb: 2 }}
      />

      {getLegend()}
    </Card>
  );
}

IndiceAprovacaoComponent.propTypes = {
  series: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
