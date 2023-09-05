'use client';

import PropTypes from 'prop-types';
// _mock
import { _turmas } from 'src/_mock';
// sections
import { AlunoEditView } from 'src/sections/aluno/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Aluno Edit',
};

export default function AlunoEditPage({ params }) {
  const { id } = params;

  return <AlunoEditView id={id} />;
}

export async function generateStaticParams() {
  return _turmas.map((turma) => ({
    id: turma.id,
  }));
}

AlunoEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
