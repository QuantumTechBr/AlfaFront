// components
import PropTypes from 'prop-types';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function ChartColumnStacked({ series, options, ...other }) {
  

  return <Chart dir="ltr" type="bar" series={series} options={options} />;
}

ChartColumnStacked.propTypes = {
  series: PropTypes.array,
  options: PropTypes.object,
};