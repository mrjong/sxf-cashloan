/*eslint-disable */
import React from 'react';
import { _addlisten } from './analytins';
export const domListen = () => (WrappedComponent) => {
	return class extends React.Component {
		componentDidMount() {
			_addlisten('99');
		}

		render() {
			return <WrappedComponent {...this.props} />;
		}
	};
};
