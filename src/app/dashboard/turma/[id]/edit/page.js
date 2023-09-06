'use client';

import PropTypes from 'prop-types';
// _mock
import { _turmas } from 'src/_mock';
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

export async function generateStaticParams() {
  return _turmas.map((turma) => ({
    id: turma.id,
  }));
}

TurmaEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
