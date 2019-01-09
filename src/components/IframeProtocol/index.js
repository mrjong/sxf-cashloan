import React from 'react'
import { headerIgnore, isMPOS } from 'utils'
import styles from './index.scss'

export default class IframeProtocol extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      prefix: '/disting/#/'
    }
  }

  componentWillMount() {

  }

  render() {
    const { title, name, postData } = this.props
    const ID = isMPOS() ? `mpos_${name}` : `${name}`
    return (
      <iframe
        className={headerIgnore() ? styles.container2 : styles.container}
        src={`${this.state.prefix}${ID}`}
        name={ID}
        id={ID}
        onLoad={() => { postData && window.frames[name].setData(postData) }}
        width="100%"
        height="100%"
        frameBorder="0"
      />
    )
  }
}