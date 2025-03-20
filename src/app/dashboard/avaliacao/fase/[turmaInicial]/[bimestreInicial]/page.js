// sections

import { AvaliacaoFaseFormListView } from "src/sections/avaliacao/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Acompanhamentos de Fases',
};

export default function AvaliacaoFaseFormListPage({ params }) {
  const { turmaInicial, bimestreInicial } = params;
  return <AvaliacaoFaseFormListView turmaInicial={turmaInicial} bimestreInicial={bimestreInicial} />;
}
