'use client';

import { useEffect, useState, useCallback, useContext } from 'react';

import PropTypes from 'prop-types';
// sections
import { ProfissionalEditView } from 'src/sections/profissional/view';
import { ProfissionaisContext } from 'src/sections/profissional/context/profissional-context';

// ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Edição do Profissional',
// };

export default function ProfissionalEditPage({ params }) {
  const { id } = params;

  return <ProfissionalEditView id={id} />;
}

export async function generateStaticParams() {
  
  const { profissionais, buscaProfissionais } = useContext(ProfissionaisContext);

  useEffect(() => {
    buscaProfissionais({force:true});
    setTableData(profissionais);
  }, []);

  return profissionais.map((profissional) => ({
    id: profissionais.id,
  }));
}

ProfissionalEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
