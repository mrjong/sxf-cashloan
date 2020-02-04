import imagesDefault from './imagesDefault';

const Theme = {
	themes: {
		default: imagesDefault
	},

	set(theme) {
		Object.assign(this, theme);
	}
};

Theme.set(imagesDefault);

module.exports = Theme;
