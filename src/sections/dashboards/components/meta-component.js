import PropTypes from 'prop-types';
// @mui
import { alpha, useTheme } from '@mui/material/styles';

import Typography from '@mui/material/Typography';

// components
import Chart, { useChart } from 'src/components/chart';
import { Box, Card } from '@mui/material';

// ----------------------------------------------------------------------

export default function MetaComponent({
  title,
  meta,
  alfabetizados,
  total,
  color = 'primary',
  sx,
  ...other
}) {
  const theme = useTheme();

  // CALCULO DO TOTAL DA META
  let _percentAlfabetizados = (alfabetizados / total) * 100;
  let _percentDaMeta = +(_percentAlfabetizados / meta * 100).toFixed(2);
  if(_percentDaMeta > 100) { _percentDaMeta = 100; }

  const chartOptions = useChart({
    chart: {
      offsetY: -21,
      sparkline: {
        enabled: true,
      },
    },
    grid: {
      padding: { top: 0, bottom: 18 },
    },
    legend: {
      show: false,
    },

    stroke: {
      lineCap: 'square',
    },
    states: {
      hover: {
        filter: {
          type: 'none' /* none, lighten, darken */,
        },
      },
      active: {
        filter: {
          type: 'none' /* none, lighten, darken */,
        },
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: alpha(theme.palette.common.white, 0.2),
          strokeWidth: '97%',
        },
        hollow: {
          size: '50%',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: 0,
            color: theme.palette.common.white,
            fontWeight: 400,
          },
        },
      },
    },
    color: theme.palette.error.main,
    fill: {
      colors: [theme.palette.common.white],
    },
  });

  return (
    <Card
      direction="row"
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        py: 0,
        px: 0,
        color: `white`,
        backgroundColor: theme.palette[color].main,
        ...sx,
      }}
      {...other}
    >
      <Box>
        <Typography variant="h3" fontWeight="600">
          {title}
        </Typography>
        <Typography variant="body2" fontWeight="500">
          sobre a meta de {meta}% alfabetizados
        </Typography>
      </Box>

      <Chart
        type="radialBar"
        series={[_percentDaMeta]}
        options={chartOptions}
        height={250}
        width={190}
      />
    </Card>
  );
}

MetaComponent.propTypes = {
  color: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.string,
  meta: PropTypes.number,
  alfabetizados: PropTypes.number,
  total: PropTypes.number,
};
