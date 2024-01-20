import PropTypes from 'prop-types';
// sections
import { PlanoIntervencaoFileManagerView } from 'src/sections/plano_intervencao/view';


// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Documento de Plano de Intervenção',
};

export default function PlanoIntervencaoFileManagerPage({ params }) {
  const { id } = params;

  return <PlanoIntervencaoFileManagerView planoId={id} />;
}

PlanoIntervencaoFileManagerPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
