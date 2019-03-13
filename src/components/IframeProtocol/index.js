import React from 'react'
import { headerIgnore } from 'utils'
import { isMPOS } from 'utils/common';
import styles from './index.scss'

export default class IframeProtocol extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      prefix: '/disting/#/'
    }
  }

  render() {
    const { name, postData } = this.props
    // const ID = isMPOS() ? `mpos_${name}` : `${name}`
    const ID = name;
    
    return (
      <iframe
        className={headerIgnore() ? styles.container2 : styles.container}
        src={`${this.state.prefix}${ID}`}
        name={ID}
        id={ID}
        onLoad={()=>{
          postData && window.frames[ID].setData(postData)
        }}
        width="100%"
        height="100%"
        frameBorder="0"
      />
    )
  }
}