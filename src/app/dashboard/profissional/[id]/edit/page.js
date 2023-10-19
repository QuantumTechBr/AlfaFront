import PropTypes from 'prop-types';
// sections
import { ProfissionalEditView } from 'src/sections/profissional/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Edição do Profissional',
};

export default function ProfissionalEditPage({ params }) {
  const { id } = params;

  return <ProfissionalEditView id={id} />;
}

ProfissionalEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
