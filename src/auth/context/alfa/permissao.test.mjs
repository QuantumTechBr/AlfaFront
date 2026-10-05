// Rodar: node --test src/auth/context/alfa/permissao.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { temPermissaoModulo } from './permissao.js';

const papel = (nome, cadastrar, namespace = 'registro_aprendizagem') => ({
  nome,
  permissao_modulo: [{ modulo: { namespace }, cadastrar }],
});

const MOD = 'registro_aprendizagem';

test('sem usuário ou sem permissao_usuario retorna null', () => {
  assert.equal(temPermissaoModulo(null, MOD, 'cadastrar'), null);
  assert.equal(temPermissaoModulo({}, MOD, 'cadastrar'), null);
});

test('SUPERADMIN tem qualquer permissão', () => {
  const user = { permissao_usuario: [{ nome: 'SUPERADMIN' }] };
  assert.equal(temPermissaoModulo(user, MOD, 'cadastrar'), true);
});

test('papel único com permissão retorna true; sem permissão retorna false', () => {
  assert.equal(temPermissaoModulo({ permissao_usuario: [papel('PROFESSOR', true)] }, MOD, 'cadastrar'), true);
  assert.equal(temPermissaoModulo({ permissao_usuario: [papel('DIRETOR', false)] }, MOD, 'cadastrar'), false);
});

test('DIRETOR sem permissão antes de PROFESSOR com permissão -> true (bug original)', () => {
  const user = { permissao_usuario: [papel('DIRETOR', false), papel('PROFESSOR', true)] };
  assert.equal(temPermissaoModulo(user, MOD, 'cadastrar'), true);
});

test('ordem dos papéis não importa', () => {
  const user = { permissao_usuario: [papel('PROFESSOR', true), papel('DIRETOR', false)] };
  assert.equal(temPermissaoModulo(user, MOD, 'cadastrar'), true);
});

test('nenhum papel com a permissão -> false', () => {
  const user = { permissao_usuario: [papel('DIRETOR', false), papel('PROFESSOR', false)] };
  assert.equal(temPermissaoModulo(user, MOD, 'cadastrar'), false);
});

test('papel sem o módulo ou sem permissao_modulo não encerra a checagem', () => {
  const user = {
    permissao_usuario: [
      { nome: 'DIRETOR' },
      papel('X', true, 'outro_modulo'),
      papel('PROFESSOR', true),
    ],
  };
  assert.equal(temPermissaoModulo(user, MOD, 'cadastrar'), true);
});

test('SUPERADMIN depois de outros papéis ainda libera', () => {
  const user = { permissao_usuario: [papel('DIRETOR', false), { nome: 'SUPERADMIN' }] };
  assert.equal(temPermissaoModulo(user, MOD, 'cadastrar'), true);
});
