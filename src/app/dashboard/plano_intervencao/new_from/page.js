import PropTypes from 'prop-types';
// sections
import { PlanoIntervencaoCreateFrowView } from 'src/sections/plano_intervencao/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Criar Plano a Partir de...',
};

export default function PlanoIntervencaoCreateFromPage({ params }) {
  const { id } = params;

  return <PlanoIntervencaoCreateFrowView id={id} />;
}

PlanoIntervencaoCreateFromPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
