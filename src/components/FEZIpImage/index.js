import React, { Component } from 'react';
import lrz from 'lrz';
import styles from './index.scss';

export default class FEZIpImage extends Component {
	static defaultProps = {
		accept: 'image/*',
		onChange: () => true,
		beforeCompress: () => true,
		afterCompress: () => true,
		activeClassName: styles.imageUploadBtnActive
	};

	componentDidMount() {
		const { onChange, beforeCompress, afterCompress } = this.props;
		this.fileSelectorInput.addEventListener('change', function(e) {
			e.preventDefault();
			const files = this.files;
			const file = files[0];
			const quality = file && file.size > 500000 ? 0.4 : 1;
			beforeCompress();
			// if (file) {
			// 	beforeCompress();
			// }
			// else {
			// 	afterCompress();
			// }
			lrz(file, { quality })
				.then((rst) => {
					const base64Data = rst.base64;
					const size = rst.fileLen;
					const fileName = file.name;
					onChange({ base64Data, size, fileName });
				})
				.catch(console.error)
				.always(() => {
					afterCompress();
				});
		});
	}

	handleChange = (e) => {
		const { disabledupload } = this.props;
		if (disabledupload === 'true') {
			return;
		}
		e.preventDefault();
		const { onChange, beforeCompress, afterCompress } = this.props;
		const fileSelectorEl = this.fileSelectorInput;

		if (fileSelectorEl && fileSelectorEl.files && fileSelectorEl.files.length) {
			const files = fileSelectorEl.files;
			const file = files[0];
			const quality = file && file.size > 500000 ? 0.4 : 1;
			beforeCompress();

			lrz(file, { quality })
				.then((rst) => {
					const base64Data = rst.base64;
					const size = rst.fileLen;
					const fileName = file.name;

					onChange({ base64Data, size, fileName });
					fileSelectorEl.value = '';
					afterCompress();
				})
				.catch((err) => {
					console.error(err);
					afterCompress();
				});
		}
		fileSelectorEl.value = '';
	};

	render() {
		const {
			className,
			style,
			onChange, // eslint-disable-line
			beforeCompress, // eslint-disable-line
			afterCompress, // eslint-disable-line
			activeClassName, // eslint-disable-line
			disabledupload,
			accept,
			value,
			...others
		} = this.props;

		return (
			<div
				style={{ ...style, backgroundImage: `url(${value})` }}
				className={`${styles.imageUploadBtn} ${className}`}
				{...others}
			>
				<input
					ref={(input) => (this.fileSelectorInput = input)}
					type="file"
					disabled={disabledupload === 'false' ? false : true}
					accept={accept}
					value=""
					capture="camera"
				/>
			</div>
		);
	}
}
