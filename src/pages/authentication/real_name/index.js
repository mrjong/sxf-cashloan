import React, {PureComponent } from 'react';
import { setBackGround } from '../../../utils/Background';
import { createForm } from 'rc-form';
import updateLeft from '../../../assets/images/real_name/1@2x.png';
import updateRight from '../../../assets/images/real_name/2@2x.png';
import updateBottom from '../../../assets/images/real_name/@2x.png';
import FEZipImage from '../../../components/fzp-image';
import { InputItem,Toast } from 'antd-mobile';
import style from './index.scss';

@createForm()
@setBackGround('#F5F5F5')

export default class RealName extends PureComponent {
  state = {
    selectFlag: false,
    leftValue: updateLeft,
    rightValue: updateRight,
    footerValue: updateBottom,
    leftUploaded: false,
    rightUploaded: false,
    footerUploaded: false,
  };

  componentWillMount() {

  }

  componentDidMount() {

  }

  handleSure = (e) => {
    e.preventDefault();
    const { loading } = this.state;
    if (loading) return; // 防止重复提交

    this.props.form.validateFields((err, values) => {
      if (!err) {
        // values中存放的是经过 getFieldDecorator 包装的表单元素的值
        console.log(values);
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
    const { idName, idNo } = getFieldsValue();
    let selectFlag = true;
    if (this.state.leftUploaded && this.state.rightUploaded && this.state.footerUploaded) {
      selectFlag = false;
    }
    return (
      <div className={style.nameDiv}>
        <div className={style.updateTitle}>上传身份证正 、反面</div>
        <div className={style.updateContent}>
          <div className={style.updateImgLeft}>
            <FEZipImage
              style={{ width: '3.26rem', height: '2rem', borderRadius: '3px', border: '1px solid #eee', margin: '0 auto' }}
              value={this.state.leftValue}
              // onChange={this.handleChangePositive}
              // beforeCompress={this.handleBeforeCompress}
              // afterCompress={this.handleAfterCompress}
            />
            <p>拍摄身份证正面</p>
          </div>
          <div className={style.updateImgRight}>
            <FEZipImage
              style={{ width: '3.26rem', height: '2rem', borderRadius: '3px', border: '1px solid #eee', margin: '0 auto' }}
              value={this.state.rightValue}
              // onChange={this.handleChangeSide}
              // beforeCompress={this.handleBeforeCompress}
              // afterCompress={this.handleAfterCompress}
            />
            <p>拍摄身份证反面</p>
          </div>
          <div className={style.clear}/>
        </div>
        <div className={style.clear}/>
        <div className={style.labelDiv}>
          {
            getFieldDecorator('idName', {
              rules: [
                { required: true, message: '请输入姓名' },
                { max: 3, message: '最长3个字符' },
              ],
            })(
              <InputItem
                placeholder="借款人本人姓名"
                type="text"
              >
                姓名
              </InputItem>,
            )
          }
        </div>
        <div className={style.clear}/>
        <div className={style.inline} style={{ height: '0.04rem' }}/>
        <div className={style.labelDiv} style={{ marginTop: 0 }}>
          {
            getFieldDecorator('idNo', {
              rules: [
                { required: true, message: '请输入身份证号' },
                { max: 25, message: '最长15-25个字符' },
              ],
            })(
              <InputItem
                placeholder="借款人身份证号"
                type="text"
              >
                身份证号
              </InputItem>,
            )
          }
        </div>
        <div className={style.clear}/>
        <div className={style.updateTitle}>上传本人手持身份证照片</div>
        <div className={style.updateContent}>
          <div className={style.updateImgLeft}>
            <FEZipImage
              style={{ width: '3.26rem', height: '2rem', borderRadius: '3px', border: '1px solid #eee', margin: '0 auto' }}
              value={this.state.footerValue}
              // onChange={this.handleChangeBottom}
              // beforeCompress={this.handleBeforeCompress}
              // afterCompress={this.handleAfterCompress}
            />
            <p>上传手持身份证</p>
          </div>
          <div className={style.updateTop}>
            <div className={style.examples}>参考示例</div>
            <div className={style.examplesDes}>
              照片上的身份证信息和持证人脸部须清晰可辨。照片格式支持jpg、png等格式。
            </div>
          </div>
          <div className={style.clear}/>
        </div>
        <div className={style.des}>
          <p className={style.desOne}>*为保障您的借款资金安全与合法性，借款前需要进行实名认证</p>
          <p className={style.desOne}>*实名信息一旦认证，不可修复</p>
        </div>
        <div className={selectFlag ? style.sureBtn : style.sureSelectBtn} onClick={this.handleSure}>
          确定
        </div>
      </div>
    );
  }
}
