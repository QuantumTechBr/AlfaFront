import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';

// components
import Chart, { useChart } from 'src/components/chart';
import { CardHeader, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { percentageChange } from 'src/utils/functions';
import _ from 'lodash';
import './style.css';
import { useCallback } from 'react';

// ----------------------------------------------------------------------

export default function IndiceAlfabetizacaoBimestreComponent({
  title,
  grid_ddz = [],
  options,
  ...other
}) {
  const dados = grid_ddz.map((item) => {
    let _retorno = {
      zona_id: item.zona_id,
      zona_nome: item.zona_nome,
      qtd_avaliados: item.qtd_avaliados,
      qtd_alfabetizado: item.qtd_alfabetizado,
      percent_alfabetizado: item.qtd_alfabetizado.map((_, i) =>
        Math.floor(((item.qtd_alfabetizado[i] ?? 0) / (item.qtd_avaliados[i] ?? 0)) * 100)
      ),
    };
    return _retorno;
  });

  return (
    <Card {...other} sx={{ pb: 2 }}>
      <CardHeader title={title} sx={{ mb: 3 }}></CardHeader>

      <Grid container justifyContent={'space-around'}>
        {dados.map((item, index) => {
          return (
            <IndiceAlfabetizacaoBimestreUnicoComponent
              key={`indice_alfabetizacao_componente_unico_${index}`}
              dados={item}
            ></IndiceAlfabetizacaoBimestreUnicoComponent>
          );
        })}
      </Grid>
    </Card>
  );
}

IndiceAlfabetizacaoBimestreComponent.propTypes = {
  title: PropTypes.string,
  grid_ddz: PropTypes.array,
};

//

export function IndiceAlfabetizacaoBimestreUnicoComponent({ dados = {}, ...other }) {
  const theme = useTheme();

  const colorLinha = '#FFBF00';
  const colors = ['#d11400', '#134EB4', '#0DACEB', '#009a50'];

  const qtd_bimestres = dados.percent_alfabetizado.length;
  const hasData = useCallback((bimestre) => dados.percent_alfabetizado[bimestre] !== undefined);

  const chartSeries = [
    ...(hasData(0)
      ? [
          {
            name: 'Alfabetizados 1º Bi',
            type: 'column',
            data: [dados.percent_alfabetizado[0]],
          },
        ]
      : []),
    ...(hasData(1)
      ? [
          {
            name: 'Alfabetizados 2º Bi',
            type: 'column',
            data: [null, dados.percent_alfabetizado[1]],
          },
        ]
      : []),
    ...(hasData(2)
      ? [
          {
            name: 'Alfabetizados 3º Bi',
            type: 'column',
            data: [null, null, dados.percent_alfabetizado[2]],
          },
        ]
      : []),
    ...(hasData(3)
      ? [
          {
            name: 'Alfabetizados 4º Bi',
            type: 'column',
            data: [null, null, null, dados.percent_alfabetizado[3]],
          },
        ]
      : []),
    {
      name: 'Avanço',
      type: 'line',
      data: dados.percent_alfabetizado,
      color: colorLinha,
    },
  ];

  const chartOptions = useChart({
    markers: { size: 5 },
    colors: colors,
    chart: {
      toolbar: { show: true },
      stacked: true,
      stackOnlyBar: true,
    },

    xaxis: {
      categories: _.filter(
        [
          ...(hasData(0) ? ['1º Bi'] : [null]),
          ...(hasData(1) ? ['2º Bi'] : [null]),
          ...(hasData(2) ? ['3º Bi'] : [null]),
          ...(hasData(3) ? ['4º Bi'] : [null]),
        ],
        (v) => v !== null
      ),
    },
    plotOptions: {
      bar: {
        columnWidth: '100%',
        borderRadius: 11,
        borderRadiusApplication: 'end', // around
        borderRadiusWhenStacked: 'all', // last
      },
    },
    dataLabels: {
      enabled: true,
      // offsetY: 25,
      background: {
        enabled: true,
        padding: 7,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colorLinha,
        opacity: 0,
        dropShadow: {
          enabled: false,
        },
      },
      style: {
        fontSize: '12px',
        colors: [..._.fill(_.range(qtd_bimestres - 1), '#FFF', 0, qtd_bimestres - 1), '#000'],
      },
      formatter: function (value, opts) {
        if (value === null || value == 0) return '';
        if (opts.seriesIndex <= qtd_bimestres - 1) {
          if (opts.dataPointIndex <= qtd_bimestres - 1) {
            return value + '%';
          }
        }

        if (opts.seriesIndex == qtd_bimestres) {
          if (opts.dataPointIndex > 0) {
            let _percents = opts.w.config.series[opts.seriesIndex].data;
            let _percentPrev = _percents[opts.dataPointIndex - 1];
            let _percent = value;
            let _difference = percentageChange(_percentPrev, _percent);
            if (_difference == 0 || _difference == Infinity) return '';
            _difference = _difference > 0 ? `+${Math.floor(_difference)}` : Math.ceil(_difference);
            return _difference + '%';
          }
        }
        return '';
      },
    },
    stroke: {
      width: _.fill(_.range(qtd_bimestres + 1), 4, 0, qtd_bimestres + 1),
      colors: [..._.fill(_.range(qtd_bimestres), 'transparent', 0, qtd_bimestres - 1), colorLinha], // TODO USE LODASH FILL
      curve: 'straight',
      lineCap: 'round',
    },
    title: {
      text: dados.zona_nome,
      offsetX: 13,
      align: 'center',
      style: {
        fontSize: '13px',
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily,
        color: 'inherit',
      },
    },

    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },

    legend: {
      show: false,
    },

    yaxis: [{ show: true, min: 0, max: 100 }],

    tooltip: {
      enabled: false,
    },
  });

  return (
    <Grid item xs={12} lg={3} sx={{ my: 2 }}>
      <Chart
        dir="ltr"
        width="100%"
        type="bar"
        series={chartSeries}
        options={chartOptions}
        height={350}
      />
    </Grid>
  );
}

IndiceAlfabetizacaoBimestreUnicoComponent.propTypes = {
  dados: PropTypes.object,
};
