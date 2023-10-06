// components
import PropTypes from 'prop-types';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function ChartColumnStacked({ series, options }) {

  return <Chart dir="ltr" type="bar" series={series} options={options} height={320} width={'100%'} />;
}

ChartColumnStacked.propTypes = {
  series: PropTypes.array,
  options: PropTypes.object,
};
