'use client';

import PropTypes from 'prop-types';
// sections
import { EscolaEditView } from 'src/sections/escola/view';

// ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Edição de Escola',
// };

export default function EscolaEditPage({ params }) {
  const { id } = params;

  return <EscolaEditView id={id} />;
}

EscolaEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
