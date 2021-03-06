module.exports = {
	extends: 'stylelint-config-standard',
	rules: {
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global']
			}
		],
		'at-rule-empty-line-before': null,
		'at-rule-name-newline-after': null,
		'at-rule-no-unknown': null,
		'comment-empty-line-before': null,
		'declaration-empty-line-before': null,
		'function-comma-newline-after': null,
		'function-name-case': null,
		'function-parentheses-newline-inside': null,
		'function-max-empty-lines': null,
		'function-whitespace-after': null,
		indentation: null,
		'number-leading-zero': null,
		'block-closing-brace-newline-after': null,
		'number-no-trailing-zeros': true,
		'rule-empty-line-before': null,
		'selector-combinator-space-after': null,
		'selector-list-comma-newline-after': null,
		'selector-pseudo-element-colon-notation': null,
		'unit-no-unknown': null,
		'value-list-max-empty-lines': null,
		'no-descending-specificity': null,
		'no-missing-end-of-source-newline': null,
		'no-duplicate-selectors': null,
		'block-opening-brace-space-before': null,
		'font-family-no-missing-generic-family-keyword': null,
		'length-zero-no-unit': null,
		'color-hex-case': null,
		'declaration-block-trailing-semicolon': null,
		'declaration-colon-newline-after': null,
		'value-list-comma-newline-after': null,
		'declaration-block-no-duplicate-properties': null
	}
};
