import eslintPluginSvelte from 'eslint-plugin-svelte'
import globals from 'globals'
import js from '@eslint/js'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	// add more generic rule sets here, such as:
	js.configs.recommended,
	...eslintPluginSvelte.configs['flat/recommended'],
	{
		ignores: ['**/*.ts', 'Safari/**'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				browser: 'readonly',
				'API_URL': 'readonly'
			}
		},
		rules: {

			// Generic Rules
			indent: ['error', 'tab'],
			quotes: ['error', 'single'],
			semi: ['warn', 'never'],
			'no-case-declarations': 0,
			'no-undef': 'error',
			'no-unused-vars': [
				'warn',
				{
					'vars': 'all',
					'args': 'after-used',
					'ignoreRestSiblings': true,
					'argsIgnorePattern': '^_',
					'destructuredArrayIgnorePattern': '^_'
				}
			],
			// Svelte Rules
			'svelte/button-has-type': [
				'error',
				{
					'button': true,
					'submit': true,
					'reset': true
				}
			],
			'svelte/html-quotes': [
				'warn',
				{
					'prefer': 'single',
					'dynamic': {
						'quoted': false,
						'avoidInvalidUnquotedInHTML': false
					}
				}
			],
			'svelte/indent': [
				'warn',
				{
					'indent': 'tab',
					'ignoredNodes': [],
					'switchCase': 0,
					'alignAttributesVertically': false
				}
			],
			'svelte/valid-compile': [
				'error',
				{
					'ignoreWarnings': true
				}
			],
			'svelte/max-attributes-per-line': 'warn',
			'svelte/sort-attributes': 'warn',
			'svelte/first-attribute-linebreak': 'warn',
			'svelte/html-closing-bracket-spacing': [
				'error',
				{
					'selfClosingTag': 'ignore'
				}
			],
			'svelte/no-spaces-around-equal-signs-in-attribute': 'warn',
			'svelte/shorthand-attribute': 'warn',
			'svelte/shorthand-directive': 'warn',
			'svelte/no-target-blank': 'warn',
			'svelte/no-at-html-tags': 'off',
			'svelte/no-trailing-spaces': 'warn'
		}
	}
]
