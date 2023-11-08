'use client';

import PropTypes from 'prop-types';
// sections
import { ZonaEditView } from 'src/sections/zona/view';

// ----------------------------------------------------------------------

// export const metadata = {
//   title: 'Dashboard: Edição de Zona',
// };

export default function ZonaEditPage({ params }) {
  const { id } = params;

  return <ZonaEditView id={id} />;
}

ZonaEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
