import PropTypes from 'prop-types';
// sections
import { PlanoIntervencaoEditView } from 'src/sections/plano_intervencao/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Edição de Plano de Intervenção',
};

export default function PlanoIntervencaoEditPage({ params }) {
  const { id } = params;

  return <PlanoIntervencaoEditView id={id} />;
}

PlanoIntervencaoEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
