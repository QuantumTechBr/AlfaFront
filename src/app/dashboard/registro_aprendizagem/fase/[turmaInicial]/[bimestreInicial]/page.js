// sections

import { RegistroAprendizagemFaseFormListView } from "src/sections/registro_aprendizagem/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Acompanhamentos de Fases',
};

export default function RegistroAprendizagemFaseFormListPage({ params }) {
  const { turmaInicial, bimestreInicial } = params;
  return <RegistroAprendizagemFaseFormListView turmaInicial={turmaInicial} bimestreInicial={bimestreInicial} />;
}
