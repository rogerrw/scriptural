import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_LOGIN_REDIRECT } from '../routes.ts';

test('Google sign-in keeps DEFAULT_LOGIN_REDIRECT at /', () => {
  assert.equal(DEFAULT_LOGIN_REDIRECT, '/');
});
