import React, { PureComponent } from 'react';
import { createForm } from 'rc-form';
import { InputItem, List } from 'antd-mobile';
import informationMore from 'assets/images/real_name/more.png';
import AsyncCascadePicker from 'components/AsyncCascadePicker';
import ButtonCustom from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import { getLngLat } from 'utils/Address.js';
import style from './index.scss';
import { getFirstError, validators, handleInputBlur } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import { buryingPoints } from "utils/buryPointMethods";
import qs from 'qs';
import { store } from 'utils/store';

const pageKey = home.basicInfoBury;

const API = {
  getProv: '/rcm/qryProv',
  getRelat: '/rcm/qryRelat',
  submitData: '/auth/personalData',
  qryCity: '/rcm/qryCity',
  queryUsrBasicInfo: '/auth/queryUsrBasicInfo'
};

const reducedFilter = (data, keys, fn) =>
  data.filter(fn).map((el) =>
    keys.reduce((acc, key) => {
      acc[key] = el[key];
      return acc;
    }, {})
  );

let urlQuery = '';
let isFetching = false;
@fetch.inject()
@createForm()
export default class essential_information_page extends PureComponent {
  state = {
    loading: false,
    relatData: [],                // 亲属联系人数据
    relatVisible: false,         // 联系人是否显示
    relatValue: [],              // 选中的联系人
    provValue: ['220000','2460'],             // 选中的省市区
    provLabel: [],
  };

  componentWillMount() {
    if (store.getBackFlag()) {
      store.removeBackFlag(); // 清除返回的flag
    }
    buryingPoints();
    urlQuery = this.props.history.location.search;

    // 获取基本信息
    this.props.$fetch.post(API.queryUsrBasicInfo).then(
      (res) => {
        if (res.msgCode === 'PTM0000') {
          // this.getProCode(res.data.provNm || store.getProvince(), res.data.cityNm || store.getCity());
          this.props.form.setFieldsValue({
            address: (res.data && res.data.usrDtlAddr) || store.getAddress() || '',
            linkman: (res.data && res.data.cntUsrNm1) || store.getLinkman() || '',
            linkphone: store.getLinkphone() || ''
          });
          this.setState({
            relatValue:
              res.data && res.data.cntRelTyp1
                ? [`${res.data.cntRelTyp1}`]
                : store.getRelationValue() ? store.getRelationValue() : []
          });
        } else {
          this.props.toast.info(res.msgInfo);
        }
      },
      (error) => { }
    );
  }

  componentDidMount() {
    // 安卓键盘抬起会触发resize事件，ios则不会
    window.addEventListener("resize", function () {
      if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
        window.setTimeout(function () {
          document.activeElement.scrollIntoViewIfNeeded();
        }, 0);
      }
    })
  }

  componentWillUnmount() {
    buryingPoints();
    window.removeEventListener('resize', function () {
      if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
        window.setTimeout(function () {
          document.activeElement.scrollIntoViewIfNeeded();
        }, 0);
      }
    })
  }

  // 获取城市标签反显
  getProCode = (pro, city) => {
    console.log(pro, city)
    let proPattern = new RegExp(`^[\\u4E00-\\u9FA5]*${pro}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
    let cityPattern = new RegExp(`^[\\u4E00-\\u9FA5]*${city}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
    this.props.$fetch.get(`${API.getProv}`).then((result) => {
      if (result && result.data) {
        const provItem = reducedFilter(result.data, ['key', 'value'], (item) => {
          let proPattern2 = new RegExp(`^[\\u4E00-\\u9FA5]*${item.value}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
          if (proPattern.test(item.value) || proPattern2.test(pro)) {
            return item;
          }
        });
        this.props.$fetch.get(`${API.qryCity}/${provItem[0].key}`).then((result2) => {
          const cityItem = reducedFilter(result2.data, ['key', 'value'], (item2) => {
            let cityPattern2 = new RegExp(`^[\\u4E00-\\u9FA5]*${item2.value}[a-zA-Z0-9\\u4E00-\\u9FA5]*$`);
            if (cityPattern.test(item2.value) || cityPattern2.test(city)) {
              return item2;
            }
          });
        // console.log(provItem[0].key + '', cityItem[0].key + '')
          this.setState({
            provValue: provItem && cityItem && [provItem[0].key + '', cityItem[0].key + '']
          },()=>{
            console.log(this.state.provValue)
          })
          // this.props.form.setFieldsValue({
          //   city: provItem && cityItem && [provItem[0].key + '', cityItem[0].key + '']
          // });
        });
      }
    });
  };


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
      console.log(values)
      if (!err) {
        const data = `${city}${prov}${values.address}`;
        getLngLat(data).then(lngLat => {
          const params = {
            provNm: this.state.provLabel[0],
            cityNm: this.state.provLabel[1],
            usrDtlAddr: values.address,
            usrDtlAddrLctn: lngLat,
            cntRelTyp1: values.cntRelTyp1[0],
            cntUsrNm1: values.linkman,
            cntMblNo1: values.linkphone,
            credCorpOrg: '',
          };
          if (values.linkphone === values.relativesPhone) {
            this.props.toast.info('联系人手机号重复，请重新填写');
            isFetching = false;
          } else {
            isFetching = true;
            // values中存放的是经过 getFieldDecorator 包装的表单元素的值
            this.props.$fetch.post(`${API.submitData}`, params).then((result) => {
              if (result && result.msgCode === 'PTM0000') {
                store.setBackFlag(true);
                // 埋点-基本信息页-确定按钮
                this.confirmBuryPoint(true);
                buriedPointEvent(mine.creditExtensionBack, {
                  current_step: '基本信息认证',
                });
                this.props.history.replace({ pathname: '/mine/credit_extension_page', search: urlQuery });
              } else {
                this.confirmBuryPoint(false, result.msgInfo);
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

  // 点击确定按钮埋点
  confirmBuryPoint = (isSucc, failInf) => {
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    // 是否是从我的里面进入
    const isFromMine = query.isShowCommit;
    buriedPointEvent(home.basicInfoComplete, {
      entry: !isFromMine || isFromMine === 'false' ? '我的' : '风控授信项',
      is_success: isSucc,
      fail_cause: failInf,
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
  inputOnFocus(val, lab) {
    buryingPoints({
      pageKey,
      trigger: 'focus',
      value: val,
      label: lab,
    })
  }

  //input 失去焦点
  inputOnBlur(val, lab) {
    handleInputBlur();
    buryingPoints({
      pageKey,
      trigger: 'blur',
      value: val,
      label: lab,
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
            initialValue: this.state.provValue,
            rules: [{ required: true, message: '请选择城市' }],
            onChange: (value, label) => {
              console.log(value, label)
              this.selectSure({
                value: JSON.stringify(value),
                label: 'resident_city',
              });
              store.setProvince(label[0])
              store.setCity(label[1])
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
                (provCd) => this.props.$fetch.get(`${API.qryCity}/${provCd}`)
                  .then(result => {
                    const city = (result && result.data && result.data.length) ? result.data : [];
                    return city.map(item => ({ value: item.value, label: item.value }));
                  }),
              ]}
              onVisibleChange={(bool) => {
                if (bool) {
                  this.selectClick({
                    value: JSON.stringify(this.state.provValue),
                    label: 'resident_city',
                  });
                }
              }}
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
              // 本地缓存常住地址
              store.setAddress(value)
              this.setState({ address: value });
            },
          })(
            <InputItem
              placeholder="xx市xx区县xx街道xx门牌号"
              type="text"
              onBlur={(v) => { this.inputOnBlur(v, 'resident_address') }}
              onFocus={(v) => { this.inputOnFocus(v, 'resident_address') }}
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
            onChange: (value, label) => {
              store.setRelationValue(value)
              this.selectSure({
                value: JSON.stringify(value),
                label: 'clan_relation',
              });
            },
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
              onVisibleChange={(bool) => {
                if (bool) {
                  this.selectClick({
                    value: JSON.stringify(this.state.relatValue),
                    label: 'clan_relation',
                  });
                }
              }}
            >
              <List.Item>
                关系
              </List.Item>
            </AsyncCascadePicker>,
          )}
          <img className={style.informationMore} src={informationMore} />
        </div>
        <div className={style.labelDiv} style={{ marginTop: 0 }}>
          {getFieldDecorator('linkman', {
            rules: [
              { required: true, message: '请输入联系人姓名' },
              { validator: this.validateName }],
            onChange: (value) => {
              store.setLinkman(value)
              this.setState({ linkman: value });
            }
          })(
            <InputItem
              placeholder="请输入姓名(中文且至少2个汉字)"
              type="text"
              onBlur={(v) => { this.inputOnBlur(v, 'contact_name_one') }}
              onFocus={(v) => { this.inputOnFocus(v, 'contact_name_one') }}
            >
              联系人姓名
            </InputItem>,
          )}
        </div>
        <div className={`${style.labelDiv} ${style.noBorder}`} style={{ marginTop: 0 }}>
          {getFieldDecorator('linkphone', {
            rules: [
              { required: true, message: '请输入联系人手机号' },
              { validator: this.validatePhone }],
            onChange: (value) => {
              store.setLinkphone(value)
              this.setState({ linkphone: value });
            }
          })(
            <InputItem
              type="number"
              maxLength="11"
              placeholder="联系人电话须与借款人有通话行为"
              onBlur={(v) => { this.inputOnBlur(v, 'contact_tel_one') }}
              onFocus={(v) => { this.inputOnFocus(v, 'contact_tel_one') }}
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
