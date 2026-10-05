// Usuário pode ter vários papéis (ex.: PROFESSOR + DIRETOR): a permissão é a união dos papéis.
export function temPermissaoModulo(user, nomeModulo, permissao) {
  if (!user || !user.permissao_usuario) {
    return null;
  }
  for (let index = 0; index < user.permissao_usuario.length; index++) {
    if (user.permissao_usuario[index].nome == 'SUPERADMIN') { return true; }
    const modulosPermitidos = user.permissao_usuario[index].permissao_modulo;
    if (!modulosPermitidos) { continue; }
    const moduloPermissao = modulosPermitidos.find(
      (item) => item.modulo.namespace == nomeModulo
    );
    if (moduloPermissao && moduloPermissao[permissao]) {
      return true;
    }
  }
  return false;
}
