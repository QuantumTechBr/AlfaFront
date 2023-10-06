// sections
import { AlunoListView, AlunoProfileView } from 'src/sections/aluno/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Alunos',
};

export default function AlunoProfilePage() {
  return <AlunoListView />;
}
