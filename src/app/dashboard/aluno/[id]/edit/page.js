import PropTypes from 'prop-types';
import { _alunos } from 'src/_mock/';
import { AlunoEditView } from 'src/sections/aluno/view';

export const metadata = {
  title: 'Dashboard: Edição do Aluno',
};

export default function AlunoEditPage({ params }) {
  const { id } = params;

  return <AlunoEditView id={id} />;
}

export async function generateStaticParams() {
  return _alunos.map((aluno) => ({
    id: aluno.id,
  }));
}

AlunoEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
