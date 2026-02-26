import PropTypes from 'prop-types';
// sections
import { AnoLetivoEditView } from 'src/sections/ano_letivo/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Edição de Ano Letivo',
};

export default function AnoLetivoEditPage({ params }) {
  const { id } = params;

  return <AnoLetivoEditView id={id} />;
}

AnoLetivoEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
