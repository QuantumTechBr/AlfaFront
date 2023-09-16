import PropTypes from 'prop-types';
import { _alunos } from 'src/_mock/';
import { ProfissionalEditView } from 'src/sections/profissional/view';

export const metadata = {
  title: 'Dashboard: Profissional',
};

export default function ProfissionalEditPage({ params }) {
  const { id } = params;

  return <ProfissionalEditView id={id} />;
}

export async function generateStaticParams() {
  return _profissionais.map((profissional) => ({
    id: profissional.id,
  }));
}

ProfissinalEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
