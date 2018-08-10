import React from 'react';
import PropTypes from 'prop-types';
import styles from './listDesc.scss';

export default class ButtonCustom extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        active: PropTypes.bool,
        children: PropTypes.node,
        onClick: PropTypes.func,
    };

    static defaultProps = {
        className: '',
        active: false,
        children: '按钮',
        onClick: () => {
            
        },
    };

    render() {
        const { listdescinfo = [] } = this.props;
        return (
            <div>
                <ul className={styles.list_desc_container_box}>
                    {
                        listdescinfo.length > 0 && listdescinfo.map((item, index) => {
                            if (parseFloat(item.feeAmt) !== 0) {
                                return (
                                    <li key={index} className={`${styles.list_desc_container}`}>
                                        <div className={styles.list_desc_content}>
                                            <label>{item.feeNm}</label>
                                        </div>
                                        <div className={styles.list_desc_extra}>
                                            <span>
                                                {(parseFloat(item.feeAmt)).toFixed(2)}
                                            </span>
                                        </div>
                                    </li>
                                )
                            }
                        })
                    }
                </ul>
            </div>
        );
    }
}
