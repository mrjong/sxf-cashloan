import React, { PureComponent } from 'react';
import Lists from 'components/Lists';
import QuestionModal from '../help_center_page/components/QuestionModal';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';

const API = {
	questionList: '/question/questionListByType'
};

@setBackGround('#fff')
@fetch.inject()
export default class question_category_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showQuestionModal: false,
			question: {},
			questionList: []
		};
	}

	componentDidMount() {
		document.title = this.props.history.location.state.pageTitle;
		this.qryQuestionList();
	}

	qryQuestionList = () => {
		const { state } = this.props.history.location;
		this.props.$fetch
			.post(API.questionList, {
				type: state.value
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000' && res.data) {
					let arr = res.data.map((v, i) => {
						return {
							label: {
								name: `${i + 1}. ${v.question}`,
								answer: v.answer
							},
							bizId: v.bizId
						};
					});
					this.setState({
						questionList: arr
					});
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
	};

	closeModal = () => {
		this.setState({
			showQuestionModal: false
		});
	};

	// realname: `${prefix}_REALNAME_CLICKQUESTION`,
	// basic: `${prefix}_BASIC_CLICKQUESTION`,
	// operators: `${prefix}_OPERATORS_CLICKQUESTION`,
	// creditCard: `${prefix}_CREDIT_CARD_CLICKQUESTION`,
	// submission: `${prefix}_SUBMISSION_CLICKQUESTION`,
	// toexamine: `${prefix}_TOEXAMINE_CLICKQUESTION`,
	// quota: `${prefix}_QUOTA_CLICKQUESTION`,
	// repayment: `${prefix}_REPAYMENT_CLICKQUESTION`
	listItemClick = (item) => {
		this.setState({
			showQuestionModal: true,
			question: {
				title: item.label.name,
				answer: item.label.answer,
				bizId: item.bizId
			}
		});
	};

	render() {
		const { showQuestionModal, question } = this.state;
		return (
			<div>
				<Lists clickCb={this.listItemClick} listsInf={this.state.questionList} />
				<QuestionModal
					visible={showQuestionModal}
					question={question}
					onClose={this.closeModal}
					{...this.props}
				/>
			</div>
		);
	}
}
