'use client';

import PropTypes from 'prop-types';
// sections
import { TurmaEditView } from 'src/sections/turma/view';

// ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Edição de Turma',
// };

export default function TurmaEditPage({ params }) {
  const { id } = params;

  return <TurmaEditView id={id} />;
}

TurmaEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
