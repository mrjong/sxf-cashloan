import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { InputItem, Picker, List, Toast } from 'antd-mobile';
import { validators } from '../../../utils/validator';
import informationMore from '../../../assets/images/real_name/more.png';
import AsyncCascadePicker from '../../../components/async-cascad-picker/index.jsx';
import ButtonCustom from '../../../components/button';
import fetch from 'sx-fetch';
import { getLngLat } from '../../../utils/Address.js';
import style from './index.scss';
import { getFirstError } from 'utils/common';
import { buryingPoints } from "utils/buryPointMethods";

const API = {
  getProv: '/rcm/qryProv',
  getRelat: '/rcm/qryRelat',
  submitData: '/auth/personalData',
};

let urlQuery = '';
let isFetching = false;
@fetch.inject()
@createForm()
export default class essential_information extends PureComponent {
  state = {
    loading: false,
    relatData: [],                // 亲属联系人数据
    relatVisible: false,         // 联系人是否显示
    relatValue: [],              // 选中的联系人

    relatTwoData: [],             // 朋友联系人数据
    relatTwoVisible: false,      // 联系人是否显示
    relatTwoValue: [],

    provValue: [],             // 选中的省市区
    provLabel: [],
  };

  componentWillMount() {
    buryingPoints();
    urlQuery = this.props.history.location.search;
  }

  componentWillUnmount() {
    buryingPoints();
  }

  handleSubmit = () => {
    if (isFetching) {
      return;
    }
    const { loading } = this.state;
    if (loading) return; // 防止重复提交
    const city = this.state.provLabel[0];
    const prov = this.state.provLabel[1];
    // 调基本信息接口
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = `${city}${prov}${values.address}`;
        getLngLat(data).then(lngLat => {
          const params = {
            provNm: this.state.provLabel[0],
            cityNm: this.state.provLabel[1],
            usrDtlAddr: values.address,
            usrDtlAddrLctn: lngLat,
            cntRelTyp1: values.cntRelTyp1[0],
            cntUsrNm1: values.friendName,
            cntMblNo1: values.friendPhone,
            cntRelTyp2: values.cntRelTyp2[0],
            cntUsrNm2: values.relativesName,
            cntMblNo2: values.relativesPhone,
            credCorpOrg: '',
          };
          if (values.friendPhone === values.relativesPhone) {
            this.props.toast.info('联系人手机号重复，请重新填写');
            isFetching = false;
          } else {
            isFetching = true;
            // values中存放的是经过 getFieldDecorator 包装的表单元素的值
            this.props.$fetch.post(`${API.submitData}`, params).then((result) => {
              if (result && result.msgCode === 'PTM0000') {
                this.props.history.replace({ pathname: '/mine/credit_extension_page', search: urlQuery });
              } else {
                isFetching = false;
                this.props.toast.info(result.msgInfo);
              }
            });
          }
        });
      } else {
        isFetching = false;
        this.props.toast.info(getFirstError(err));
      }
    });
  };

  // 校验手机号
  validatePhone = (rule, value, callback) => {
    if (!validators.phone(value)) {
      callback('请输入正确的联系人手机号');
    } else {
      callback();
    }
  };
  // 校验姓名
  validateName = (rule, value, callback) => {
    if (!validators.name(value)) {
      callback('请输入正确的联系人的姓名');
    } else {
      callback();
    }
  };
  validateAddress = (rule, value, callback) => {
    if (value && (value).length > 50) {
      callback('请输入正确的常住地址');
    } else {
      callback();
    }
  };

  //input 获取焦点 width: 100%
  inputOnFocus(e) {
    console.log(e)
    buryingPoints({
      pageKey,
      trigger: 'focus',
      value: e.target.value,
      label: e.target.getAttribute('data-label')
    })
  }

  //input 失去焦点
  inputOnBlur(e) {
    buryingPoints({
      pageKey,
      trigger: 'blur',
      value: e.target.value,
      label: e.target.getAttribute('data-label')
    })
  }

  selectClick(obj) {
    buryingPoints({
      trigger: 'open',
      pageKey,
      ...obj
    })
  }
  selectSure(obj) {
    buryingPoints({
      trigger: 'sure',
      pageKey,
      ...obj
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={style.nameDiv}>
        <div className={style.infromationTitle}>个人信息</div>
        <div className={style.labelDiv}>
          {getFieldDecorator('city', {
            rules: [{ required: true, message: '请选择城市' }],
            onChange: (value, label) => {
              this.setState({ provValue: value });
              this.setState({ provLabel: label });
            },
          })(
            // 这里面的组件，要有 value onChange属性就行，一般都是表单组件，自定义组件，提供了value onChange 属性的也可以用，也可以通过 valuePropName 来指定，这个就是高级一点的用法了。
            <AsyncCascadePicker
              title="选择省市"
              loadData={[
                () => this.props.$fetch.get(`${API.getProv}`)
                  .then((result) => {
                    const prov = (result && result.data && result.data.length) ? result.data : [];
                    return prov.map(item => ({ value: item.key, label: item.value }));
                  }),
                (provCd) => this.props.$fetch.get(`/rcm/qryCity/${provCd}`)
                  .then(result => {
                    const city = (result && result.data && result.data.length) ? result.data : [];
                    return city.map(item => ({ value: item.value, label: item.value }));
                  }),
              ]}
              cols={2}
            >
              <List.Item>
                居住城市
              </List.Item>
            </AsyncCascadePicker>,
          )}
          <img className={style.informationMore} src={informationMore} />
        </div>
        <div className={`${style.inputDiv} ${style.noBorder}`} style={{ marginTop: 0 }}>
          {getFieldDecorator('address', {
            rules: [
              { required: true, message: '请输入常住地址' },
              { validator: this.validateAddress },
            ],
            onChange: (value) => {
              this.setState({ address: value });
            },
          })(
            <InputItem
              placeholder="xx市xx区县xx街道xx门牌号"
              type="text"
              onBlur={this.inputOnBlur}
              data-label="resident_address"
              onFocus={this.inputOnFocus}
            >
              常住地址
            </InputItem>,
          )}
        </div>
        <div className={style.infromationTitle}>亲属联系人信息</div>
        <div className={style.labelDiv}>
          {getFieldDecorator('cntRelTyp1', {
            initialValue: this.state.relatValue,
            rules: [{ required: true, message: '请选择联系人关系' }],
          })(
            <AsyncCascadePicker
              title="选择联系人"
              loadData={[
                () => this.props.$fetch.get(`${API.getRelat}/2`)
                  .then((result) => {
                    const prov = (result && result.data && result.data.length) ? result.data : [];
                    return prov.map(item => ({ value: item.key, label: item.value }));
                  }),
              ]}
              cols={1}
            >
              <List.Item>
                关系
              </List.Item>
            </AsyncCascadePicker>,
          )}
          <img className={style.informationMore} src={informationMore} />
        </div>
        <div className={style.labelDiv} style={{ marginTop: 0 }}>
          {getFieldDecorator('friendName', {
            rules: [
              { required: true, message: '请输入联系人姓名' },
              { validator: this.validateName }],
          })(
            <InputItem
              placeholder="请输入姓名(中文且至少2个汉字)"
              type="text"
              onBlur={this.inputOnBlur}
              data-label="contact_name_one"
              onFocus={(e) => {this.inputOnFocus(e)}}
            >
              联系人姓名
            </InputItem>,
          )}
        </div>
        <div className={`${style.labelDiv} ${style.noBorder}`} style={{ marginTop: 0 }}>
          {getFieldDecorator('friendPhone', {
            rules: [
              { required: true, message: '请输入联系人手机号' },
              { validator: this.validatePhone }],
          })(
            <InputItem
              type="number"
              maxLength="11"
              placeholder="联系人电话须与借款人有通话行为"
              onBlur={this.inputOnBlur}
              data-label="contact_tel_one"
              onFocus={this.inputOnFocus}
            >
              联系人电话
            </InputItem>,
          )}
        </div>

        <div className={style.infromationTitle}>朋友联系人信息</div>
        <div className={style.labelDiv}>
          {getFieldDecorator('cntRelTyp2', {
            initialValue: this.state.relatTwoValue, //  初始化回显 用这个字段
            rules: [{ required: true, message: '请选择联系人关系' }],
            onChange: () => 123, // value 和 onChange 都不用写，getFieldDecorator 已经处理了，如果需要写onChange，在这写
          })(
            <AsyncCascadePicker
              title="选择联系人"
              loadData={[
                () => this.props.$fetch.get(`${API.getRelat}/1`)
                  .then((result) => {
                    const prov = (result && result.data && result.data.length) ? result.data : [];
                    return prov.map(item => ({ value: item.key, label: item.value }));
                  }),
              ]}
              cols={1}
            >
              <List.Item>
                关系
              </List.Item>
            </AsyncCascadePicker>,
          )}
          <img className={style.informationMore} src={informationMore} />
        </div>
        <div className={style.labelDiv} style={{ marginTop: 0 }}>
          {getFieldDecorator('relativesName', {
            rules: [
              { required: true, message: '请输入联系人姓名' },
              { validator: this.validateName }],
          })(
            <InputItem
              placeholder="请输入姓名(中文且至少2个汉字)"
              type="text"
              onBlur={this.inputOnBlur}
              data-label="contact_name_two"
              onFocus={this.inputOnFocus}
            >
              联系人姓名
            </InputItem>,
          )}
        </div>
        <div className={`${style.labelDiv} ${style.noBorder}`} style={{ marginTop: 0 }}>
          {getFieldDecorator('relativesPhone', {
            rules: [
              { required: true, message: '请输入联系人手机号' },
              { validator: this.validatePhone }],
          })(
            <InputItem
              type="number"
              maxLength="11"
              placeholder="联系人电话须与借款人有通话行为"
              onBlur={this.inputOnBlur}
              data-label="contact_tel_two"
              onFocus={this.inputOnFocus}
            >
              联系人电话
            </InputItem>,
          )}
        </div>

        <div className={style.des}>
          <p className={style.desOne}>
            *输入有效的紧急联系人信息，有利于提升您的审批额度，我们将对您提供的信息严格保密
          </p>
        </div>
        <ButtonCustom onClick={this.handleSubmit} className={style.sureBtn}>完成</ButtonCustom>
      </div>
    );
  }
}
