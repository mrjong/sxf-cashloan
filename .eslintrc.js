const eslintrc = {
	extends: ['eslint:recommended', 'plugin:react/recommended'],
	plugins: ['prettier'],
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
		ecmaFeatures: {
			experimentalObjectRestSpread: true,
			legacyDecorators: true
		}
	},
	env: {
		es6: true,
		browser: true,
		node: true,
		jquery: true,
		mocha: true
	},
	rules: {
		'prettier/prettier': 'error',
		'guard-for-in': 0,
		'max-len': 0,
		'no-nested-ternary': 0,
		'no-console': 0,
		'global-require': 0,
		'new-cap': 0,
		'class-methods-use-this': 0,
		'jsx-a11y/label-has-for': 0,
		semi: [2, 'always'],
		'no-use-before-define': 2,
		'no-plusplus': 0,
		'space-before-function-paren': 0,
		'no-param-reassign': 0,
		'func-names': 0,
		'no-debugger': 0,
		'arrow-parens': 0,
		'jsx-a11y/click-events-have-key-events': 0,
		'prefer-template': 0,
		'click-events-have-key-events': 0,
		'no-string-ref/jsx-indent-props': 0,
		'comma-style': [2, 'last'],
		'no-return-assign': 2,
		'no-underscore-dangle': 0,
		'no-unused-expressions': 0,
		'one-var': 0,
		'no-tabs': 0,
		eqeqeq: 0,
		'comma-dangle': [2, 'never'],
		'prefer-const': 0,
		'consistent-return': 0,
		'jsx-a11y/no-static-element-interactions': 0,

		'eol-last': 0,
		'one-var-declaration-per-line': 0,
		'no-script-url': 0,
		'no-alert': 0,
		indent: [0, 2],
		'jsx-a11y/alt-text': 0,
		'linebreak-style': 2,
		'object-curly-newline': 0,
		'jsx-a11y/no-noninteractive-element-interactions': 0,
		'jsx-a11y/no-noninteractive-element-to-interactive-role': 0,
		'no-restricted-syntax': 0,
		'prefer-arrow-callback': 0,
		'spaced-comment': 0,
		'no-else-return': 2,
		'no-empty': 2,
		camelcase: 0,
		'no-mixed-spaces-and-tabs': 0,
		'no-case-declarations': 2,
		'no-async-promise-executor': 1,
		'no-useless-escape': 1,

		'import/prefer-default-export': 0,
		'import/imports-first': 0,
		'import/no-mutable-exports': 0, // 可导出对象禁止用let或者var修饰 ->const
		'import/no-unresolved': 0,
		'import/extensions': 0,
		'import/no-absolute-path': 0,
		'import/no-duplicates': 0, //此规则要求从单个模块进行的所有导入都以单一import语句存在
		'import/no-extraneous-dependencies': 0,
		'import/no-named-as-default': 0,
		'import/no-named-as-default-member': 0,
		'import/newline-after-import': 0,
		'import/no-dynamic-require': 0,

		'react/jsx-indent-props': [0, 2],
		'react/no-array-index-key': 0,
		'react/no-danger': 0,
		'react/sort-comp': [
			0,
			{
				order: ['static-methods', 'lifecycle', '/^on.+$/', 'everything-else', 'render']
			}
		],
		'react/jsx-indent': 0,
		'react/no-string-refs': 2,
		'react/no-unused-prop-types': 0,
		'react/jsx-filename-extension': 0,
		'react/prefer-stateless-function': 0,
		'react/forbid-prop-types': 0,
		'react/react-in-jsx-scope': 2,
		'react/jsx-no-bind': 0,
		'react/prop-types': 0,
		'react/no-unescaped-entities': 0,
		'react/no-find-dom-node': 0,
		'react/no-direct-mutation-state': 0
	},
	globals: {},
	settings: {
		react: {
			version: 'detect'
		}
	}
};
if (process.env.NODE_ENV === 'development') {
	Object.assign(eslintrc.rules, {
		'no-console': 0,
		'no-unused-vars': 2
	});
}

module.exports = eslintrc;
