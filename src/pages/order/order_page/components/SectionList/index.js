import React, { Component } from 'react';
// import style from './index.scss';

class SectionList extends Component {
	render() {
		const { sections, renderSectionHeader, renderItem, ListFooterComponent } = this.props;
		return (
			<div>
				{sections.map((section, index) => {
					return (
						<div key={index}>
							{renderSectionHeader({ section })}

							<div>
								{section &&
									section.data.length > 0 &&
									section.data.map((v, i) => {
										return <div key={i}>{renderItem({ item: v, index: i })}</div>;
									})}
							</div>
							{ListFooterComponent}
						</div>
					);
				})}
			</div>
		);
	}
}

export default SectionList;
