import security from 'eslint-plugin-security';

export default [
  security.configs.recommended,
  { languageOptions: { ecmaVersion: 2023, sourceType: 'module' } },
];
