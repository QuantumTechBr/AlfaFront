'use client';
import { useEffect, useState, useCallback, useContext } from 'react';

import PropTypes from 'prop-types';
// sections
import { TurmaEditView } from 'src/sections/turma/view';
import { TurmasContext } from 'src/sections/turma/context/turma-context';

// ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Edição de Turma',
// };

export default function TurmaEditPage({ params }) {
  const { id } = params;

  return <TurmaEditView id={id} />;
}

export async function generateStaticParams() {
  
  const { turmas, buscaTurmas } = useContext(TurmasContext);

  useEffect(() => {
    buscaTurmas({force:true});
    buscaEscolas();
    setTableData(turmas);
  }, []);

  return turmas.map((turma) => ({
    id: turma.id,
  }));
}

TurmaEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
