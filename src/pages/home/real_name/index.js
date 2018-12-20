import React, { Component } from 'react';
import Cookie from 'js-cookie';
import { createForm } from 'rc-form';
import updateLeft from '../../../assets/images/real_name/left.png';
import updateRight from '../../../assets/images/real_name/right.png';
import updateBottom from '../../../assets/images/real_name/bottom.png';
import FEZipImage from '../../../components/fzp-image';
import { InputItem, List } from 'antd-mobile';
import ButtonCustom from '../../../components/button';
import style from './index.scss';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { getDeviceType } from 'utils/common';
import { validators } from '../../../utils/validator';
import { buriedPointEvent } from 'utils/Analytins';
import { home, mine } from 'utils/AnalytinsType';
import qs from 'qs';
import { handleInputBlur } from 'utils'


const isEquipment = window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
let timer
const API = {
  getImgUrl: '/auth/ocrIdChk',
  submitName: '/auth/idChk',
};

let urlQuery = '';
let isFetching = false;
@fetch.inject()
@createForm()
export default class real_name_page extends Component {
  state = {
    idName: '',
    idNo: '',
    ocrZhengData: {},
    ocrFanData: {},
    selectFlag: false,
    leftValue: updateLeft,
    rightValue: updateRight,
    footerValue: updateBottom,
    leftUploaded: false,
    rightUploaded: false,
    footerUploaded: false,
    showState: false,
    disabledupload: 'false',
  };

  componentWillMount() {
    if (store.getBackFlag()) {
      store.removeBackFlag(); // 清除返回的flag
    }
    urlQuery = this.props.history.location.search;
    let userInfo = store.getUserInfo();
    if (userInfo && JSON.stringify(userInfo) !== '{}') {
      this.setState({
        userInfo,
        showState: true,
      });
    } else {
      this.setState({
        showState: true,
      });
    }
  }

  handleNameChange = value => {
    this.setState({ idName: value });
  };
  handleNumberChange = value => {
    this.setState({ idNo: value });
  };

  // 上传身份证正面
  handleChangePositive = ({ base64Data }) => {
    if (!base64Data) {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
    }
    if (!(isEquipment)) {
      this.props.toast.info('请使用手机设备');
      return;
    }
    this.setState({ showFloat: true });
    buriedPointEvent(home.informationMyselfFrontCard);
    this.setState({ leftValue: base64Data });
    const params = {
      imageBase64: this.state.leftValue, //身份证正面图片信息
      ocrType: '2',
    };
    this.props.$fetch.post(`${API.getImgUrl}`, params, { timeout: 30000 }).then((result) => {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
      if (result.msgCode === 'PTM0000') {
        this.setState({ ocrZhengData: result.data });
        this.setState({ idName: result.data.idName || '' });
        this.setState({ idNo: result.data.idNo || '' });
        this.setState({ showFloat: false });
        this.setState({ leftUploaded: true });
      } else {
        this.props.toast.info(result.msgInfo);
        this.setState({ leftUploaded: false, leftValue: updateLeft, showFloat: false });
      }
    }).catch(() => {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
      this.setState({ leftUploaded: false, leftValue: updateLeft, showFloat: false });
    });
  };

  // 上传身份证反面
  handleChangeSide = ({ base64Data }) => {
    if (!base64Data) {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
    }
    if (!(isEquipment)) {
      this.props.toast.info('请使用手机设备');
      return;
    }
    this.setState({ showFloat: true });
    buriedPointEvent(home.informationMyselfBackCard);
    this.setState({ rightValue: base64Data });
    const params1 = {
      imageBase64: this.state.rightValue, //身份证反面图片信息
      ocrType: '3',
    };
    this.props.$fetch.post(`${API.getImgUrl}`, params1, { timeout: 30000 }).then((res) => {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
      if (res.msgCode === 'PTM0000') {
        this.setState({ ocrFanData: res.data });
        this.setState({ rightUploaded: true });
        this.setState({ showFloat: false });
      } else {
        this.props.toast.info(res.msgInfo);
        this.setState({ rightUploaded: false, rightValue: updateRight, showFloat: false });
      }
    }).catch(() => {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
      this.setState({ rightUploaded: false, rightValue: updateRight, showFloat: false });
    });
  };
  // 手持身份证照片
  handleChangeBottom = ({ base64Data }) => {
    if (!base64Data) {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
    }
    if (!(isEquipment)) {
      this.props.toast.info('请使用手机设备');
      return;
    }
    this.setState({ showFloat: true });
    buriedPointEvent(home.informationTapHoldIdCard);
    this.setState({ footerValue: base64Data });
    const params1 = {
      imageBase64: this.state.footerValue, //手持身份证照片
      ocrType: '1',
    };
    this.props.$fetch.post(`${API.getImgUrl}`, params1, { timeout: 30000 }).then((res) => {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
      if (res.msgCode === 'PTM0000') {
        this.setState({ ocrData: res.data });
        this.setState({ footerUploaded: true });
        this.setState({ showFloat: false });
      } else {
        this.props.toast.info(res.msgInfo);
        this.setState({ footerUploaded: false, footerValue: updateBottom });
      }
    }).catch(() => {
      this.props.SXFToast.hide()
      this.setState({
        disabledupload: 'false'
      })
      this.setState({ showFloat: false, footerValue: updateBottom });
    });
  };

  handleSubmit = () => {
    if (isFetching) {
      console.log('不可点击');
      return;
    }
    if (!this.state.leftUploaded) {
      this.props.toast.info('请上传身份证正面');
      return false;
    }
    if (!this.state.rightUploaded) {
      this.props.toast.info('请上传身份证反面');
      return false;
    }
    if (!validators.name(this.state.idName)) {
      this.props.toast.info('请输入正确的姓名');
      return false;
    }
    if (!validators.iDCardNumber(this.state.idNo)) {
      this.props.toast.info('请输入正确的身份证号');
      return false;
    }
    if (!this.state.footerUploaded) {
      this.props.toast.info('请上传手持身份证');
      return false;
    }
    isFetching = true;
    const { ocrZhengData = {}, ocrFanData = {}, ocrData = {}, idName, idNo } = this.state;
    const osType = getDeviceType();
    const params = {
      idCardFrontUrl: ocrZhengData.imgUrl,    //正面URL
      idCardBackUrl: ocrFanData.imgUrl,     //反面URL
      handCardImgUrl: ocrData,    //手持正面URL
      idNo: idNo.toLocaleUpperCase(),                       // 证件号码
      idNoOld: ocrZhengData.idNo && ocrZhengData.idNo.toLocaleUpperCase(),       // 修改前证件号码
      usrNm: idName,                     //证件姓名
      usrNmOld: ocrZhengData.idName,    //修改前证件姓名
      usrGender: ocrZhengData.sex,      //性别
      usrNation: ocrZhengData.nation,   //民族
      usrBirthDt: ocrZhengData.birthday, //出生年月日
      issuAuth: ocrFanData.signOrg,     //签发机关
      idEffDt: ocrFanData.signTime,     //证件有效期起始日期
      idExpDt: ocrFanData.signEndTime,  //证件有效期截止日期
      idAddr: ocrZhengData.address,     //居住地址
      osType: osType,        //操作系统类型
      idAddrLctn: '',         //身份证户籍地经纬度
      usrBrowInfo: '',        //授信浏览器信息
    };
    this.props.$fetch.post(`${API.submitName}`, params).then((result) => {
      if (result && result.msgCode === 'PTM0000') {
        store.setBackFlag(true);
        buriedPointEvent(mine.creditExtensionBack, {
          current_step: '实名认证',
        });
        this.confirmBuryPoint(true);
        // store.removeAuthFlag();
        Cookie.remove('authFlag');
        // TODO: 这里成功之后有两个地方去，一个是我的页面 一个是四项认证页。直接 goBack 应该能带上参数吧
        this.props.history.goBack();
        // this.props.history.replace({ pathname: '/mine/credit_extension_page', search: urlQuery });
      }
      else {
        this.confirmBuryPoint(false, result.msgInfo);
        isFetching = false;
        this.props.toast.info(result.msgInfo);
      }
    });
  };
  handleBeforeCompress = (type) => {
    store.setDisableBack(true);
    this.setState({
      disabledupload: 'true'
    }, () => {
      this.props.SXFToast.loading('压缩图片中...', 0)
    })
  }
  // 点击确定按钮埋点
  confirmBuryPoint = (isSucc, failInf) => {
    const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
    // 是否是从我的里面进入
    const isFromMine = query.isShowCommit;
    buriedPointEvent(home.informationConfirm, {
      entry: !isFromMine || isFromMine === 'false' ? '我的' : '风控授信项',
      is_success: isSucc,
      fail_cause: failInf,
    });
  };
  handleAfterCompress = () => {
    store.removeDisableBack();
    // this.props.toast.hide();
  }
  render() {
    const { disabledupload } = this.state
    // let selectFlag = true;
    // if (this.state.leftUploaded && this.state.rightUploaded && this.state.footerUploaded) {
    //   selectFlag = false;
    // }
    return (
      <div className={style.real_name_page}>
        {this.state.showState && (!this.state.userInfo || !this.state.userInfo.nameHid) ? <div>
          <div className={style.updateTitle}>上传身份证正 、反面</div>
          <div className={style.updateContent}>
            <div className={style.updateImgLeft}>
              <FEZipImage
                disabledupload={disabledupload}
                style={{ width: '3.26rem', height: '2rem', borderRadius: '3px', margin: '0 auto' }}
                value={this.state.leftValue}
                onChange={this.handleChangePositive}
                beforeCompress={this.handleBeforeCompress}
                afterCompress={this.handleAfterCompress}
              />
              <p>拍摄身份证正面</p>
            </div>
            <div className={style.updateImgRight}>
              <FEZipImage
                disabledupload={disabledupload}
                style={{ width: '3.26rem', height: '2rem', borderRadius: '3px', margin: '0 auto' }}
                value={this.state.rightValue}
                onChange={this.handleChangeSide}
                beforeCompress={this.handleBeforeCompress}
                afterCompress={this.handleAfterCompress}
              />
              <p>拍摄身份证反面</p>
            </div>
            <div className={style.clear} />
          </div>
          <div className={style.clear} />
          <div className={style.labelDiv}>
            <InputItem onChange={this.handleNameChange}
              placeholder="借款人本人姓名"
              value={this.state.idName}
              onFocus={ () => {buriedPointEvent(home.informationTapNameInp)} }
							onBlur={() => {handleInputBlur()}}
          >
            姓名
            </InputItem>
        </div>
          <div className={style.clear} />
          <div className={style.inline} style={{ height: '0.04rem' }} />
          <div className={style.labelDiv} style={{ marginTop: 0 }}>
            <InputItem onChange={this.handleNumberChange}
              placeholder="借款人身份证号"
              value={this.state.idNo}
              maxLength="18"
              onFocus={ () => {buriedPointEvent(home.informationTapIDInp)} }
              onBlur={() => {handleInputBlur()}}
            >
              身份证号
            </InputItem>
          </div>
          <div className={style.clear} />
          <div className={style.updateTitle}>上传本人手持身份证照片</div>
          <div className={style.updateContent}>
            <div className={style.updateImgLeft}>
              <FEZipImage
                disabledupload={disabledupload}
                style={{ width: '3.26rem', height: '2rem', borderRadius: '3px', margin: '0 auto' }}
                value={this.state.footerValue}
                onChange={this.handleChangeBottom}
                beforeCompress={this.handleBeforeCompress}
                afterCompress={this.handleAfterCompress}
              />
              <p>上传手持身份证</p>
            </div>
            <div className={style.updateTop}>
              <div className={style.examples}>参考示例</div>
              <div className={style.examplesDes}>
                照片上的身份证信息和持证人脸部须清晰可辨。照片格式支持jpg、png等格式。
              </div>
            </div>
            <div className={style.clear} />
          </div>
          <div className={style.des}>
            <p className={style.desOne}>*为保障您的借款资金安全与合法性，借款前需要进行身份认证</p>
            <p className={style.desOne}>*身份信息一旦认证，不可修改</p>
          </div>
          <ButtonCustom onClick={this.handleSubmit} className={style.sureBtn}>确定</ButtonCustom>
        </div> : null}
        {
          this.state.showState && (this.state.userInfo && this.state.userInfo.nameHid) ? <div>
            <List className={style.is_true}>
              <InputItem value={this.state.userInfo && this.state.userInfo.name} editable={false}>姓名</InputItem>
              <InputItem value={this.state.userInfo && this.state.userInfo.idNoHid} editable={false}>身份证号</InputItem>
            </List>
          </div> : null
        }
      </div>
    );
  }
}
