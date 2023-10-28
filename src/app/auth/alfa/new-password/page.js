import PropTypes from 'prop-types';

// sections
import { AlfaForgotNewView } from 'src/sections/auth/alfa';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Nova Senha',
};

export default function NewPasswordPage() {

  return <AlfaForgotNewView email={email} secret={secret}/>;
}

NewPasswordPage.propTypes = {
    params: PropTypes.shape({
      email: PropTypes.string,
      secret: PropTypes.string,
    }),
  };