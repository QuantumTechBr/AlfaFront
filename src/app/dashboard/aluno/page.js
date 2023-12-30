// sections
import { AlunoListView, AlunoProfileView } from 'src/sections/aluno/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Estudantes',
};

export default function AlunoProfilePage() {
  return <AlunoListView />;
}
