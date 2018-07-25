import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { setBackGround } from '../../../utils/Background';
import { InputItem, Picker, List, Toast } from 'antd-mobile';
import informationMore from '../../../assets/images/real_name/更多-1@2x.png';
import AsyncCascadePicker from '../../../components/async-cascad-picker/index.jsx';
import fetch from 'sx-fetch';
import style from './index.scss';

@fetch.inject()
@createForm()
@setBackGround('#F5F5F5')
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
  };

  componentWillMount() {

  }

  componentDidMount() {

  }

  //  亲属联系人点击
  handleRelatItemClick = () => {
    let { relatData, relatValue } = this.state;
    this.setState({ relatVisible: true });
    if (!relatData || !relatData.length) return;

    if (!relatValue || !relatValue.length) {
      const firstProv = relatData[0];
      relatValue = [firstProv.value];
      this.setState({ relatValue });
    }
  };

  // 朋友联系人点击
  handleRelatItemClickTwo = () => {
    let { relatTwoData, relatTwoValue } = this.state;
    this.setState({ relatTwoVisible: true });
    if (!relatTwoData || !relatTwoData.length) return;

    if (!relatTwoValue || !relatTwoValue.length) {
      const firstProv = relatTwoData[0];
      relatTwoValue = [firstProv.value];
      this.setState({ relatTwoValue });
    }
  };

  // 获取item中亲属联系人显示用的label
  getRelatLabel() {
    const { relatData, relatValue } = this.state;
    return relatValue.map(item => {
      const rel = relatData.find(it => it.value === item);
      if (rel) return rel.name;
    });
  }

  // 获取item中朋友联系人显示用的label
  getRelatLabellTwo() {
    const { relatTwoData, relatTwoValue } = this.state;
    return relatTwoValue.map(item => {
      const rel = relatTwoData.find(it => it.value === item);
      if (rel) return rel.name;
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { loading } = this.state;
    if (loading) return; // 防止重复提交

    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params ={
          provNm:values.provValue[0],
          cityNm:values.provValue[1],
          usrDtlAddr:values.address,
          usrDtlAddrLctn:'',
          cntRelTyp1:values.cntRelTyp1[0],
          cntUsrNm1:values.friendName,
          cntMblNo1:values.friendPhone,
          cntRelTyp2:values.cntRelTyp2[0],
          cntUsrNm2:values.relativesName,
          cntMblNo2:values.relativesPhone,
          credCorpOrg:''
        }
        // values中存放的是经过 getFieldDecorator 包装的表单元素的值
        console.log(values);
        this.props.$fetch.post(`/wap/auth/personalData`, params).then((res) => {

        })
        // TODO 发送请求等操作
      } else {
        // 如果存在错误，获取第一个字段的第一个错误进行提示
        const keys = Object.keys(err);
        if (keys && keys.length) {
          const errs = err[keys[0]].errors;
          if (errs && errs.length) {
            const errMessage = errs[0].message;
            Toast.info(errMessage);
          }
        }
      }
    });

  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={style.nameDiv}>
        <div className={style.infromationTitle}>个人信息</div>
        <div className={style.labelDiv}>
          {getFieldDecorator('city', {
            initialValue: this.state.provValue,
            rules: [{ required: true, message: '请选择城市' }],
            onChange :(value, label)=>{
              this.setState({provValue: value});
            }
          })(
            // 这里面的组件，要有 value onChange属性就行，一般都是表单组件，自定义组件，提供了value onChange 属性的也可以用，也可以通过 valuePropName 来指定，这个就是高级一点的用法了。
            <AsyncCascadePicker
              title="选择省市"
              loadData={[
                () => this.props.$fetch.post(`/wap/rcm/qryProv`)
                  .then((result) => {
                    const prov = (result && result.data && result.data.length) ? result.data : [];
                    return prov.map(item => ({ value: item.key, label: item.value }));
                  }),
                (provCd) => this.props.$fetch.get(`/wap/rcm/qryProv?pid=${provCd}`)
                  .then(result => {
                    const city = (result && result.data && result.data.length) ? result.data : [];
                    return city.map(item => ({ value: item.key, label: item.value }));
                  }),
              ]}
              cols={2}
            >
              <List.Item>
                居住城市
              </List.Item>
            </AsyncCascadePicker>
          )}
          <img className={style.informationMore} src={informationMore}/>
        </div>
        <div className={`${style.inputDiv} ${style.noBorder}`} style={{ marginTop: 0 }}>
          {getFieldDecorator('address', {
            rules: [
              { required: true, message: '请输入常住地址' },
              {
                // 自定义校验规则
                validator: (rule, value, callback) => {
                  if (value && value[0] === '10') return callback('不能选择亲属');
                  callback();
                },
              },
            ],
          })(
            <InputItem
              placeholder="xx市xx区县xx街道xx门牌号"
              type="text"
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
            <Picker
              title="选择联系人"
              cols={1}
              data={[
                { value: '01', label: '配偶' },
                { value: '02', label: '父母' },
                { value: '03', label: '子女' },
                { value: '04', label: '兄弟姐妹' },
              ]}
            >
              <List.Item
                extra={this.getRelatLabel()}
                onClick={this.handleRelatItemClick}
              >
                关系
              </List.Item>
            </Picker>,
          )}
          <img className={style.informationMore} src={informationMore}/>
        </div>
        <div className={style.labelDiv} style={{ marginTop: 0 }}>
          {getFieldDecorator('friendName', {
            rules: [{ required: true, message: '请输入姓名' }],
          })(
            <InputItem
              placeholder="请输入姓名(中文且至少2个汉字)"
              type="text"
            >
              联系人姓名
            </InputItem>,
          )}
        </div>
        <div className={`${style.labelDiv} ${style.noBorder}`} style={{ marginTop: 0 }}>
          {getFieldDecorator('friendPhone', {
            rules: [{ required: true, message: '请输入联系人电话' }],
          })(
            <InputItem
              placeholder="联系人电话须与借款人有通话行为"
              type="text"
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
            <Picker
              title="选择联系人"
              cols={1}
              data={[
                { value: '10', label: '亲属' },
                { value: '11', label: '同事' },
                { value: '12', label: '同学' },
                { value: '13', label: '朋友' },
              ]}
            >
              <List.Item
                extra={this.getRelatLabellTwo()}
                onClick={this.handleRelatItemClickTwo}
              >
                关系
              </List.Item>
            </Picker>,
          )}
          <img className={style.informationMore} src={informationMore}/>
        </div>
        <div className={style.labelDiv} style={{ marginTop: 0 }}>
          {getFieldDecorator('relativesName', {
            rules: [{ required: true, message: '请输入姓名' }],
          })(
            <InputItem
              placeholder="请输入姓名(中文且至少2个汉字)"
              type="text"
            >
              联系人姓名
            </InputItem>,
          )}
        </div>
        <div className={`${style.labelDiv} ${style.noBorder}`} style={{ marginTop: 0 }}>
          {getFieldDecorator('relativesPhone', {
            rules: [{ required: true, message: '请输入联系人电话' }],
          })(
            <InputItem
              placeholder="联系人电话须与借款人有通话行为"
              type="text"
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
        <div className={style.sureBtn} onClick={this.handleSubmit}>
          下一步
        </div>
      </div>
    );
  }
}

