'use client'

import PropTypes from 'prop-types';
import { AlunoEditView } from 'src/sections/aluno/view';

export const metadata = {
  title: 'Dashboard: Editar Aluno',
};

export default function AlunoEditPage({ params }) {
  const { id } = params;

  return <AlunoEditView id={id} />;
}

AlunoEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
