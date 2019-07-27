import React from 'react';
import styles from './CardSide.module.css'

const side2DefaultImg = {
  front: require('../assets/front.png'),
  back: require('../assets/back.png'),
}

export default class CardSide extends React.Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }

  onInputChange = e => {
    const file = e.target.files[0]
    if (!file) {
      return
    }
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file);
    fileReader.onload = event => {
      this.props.onChange({
        file,
        src: event.target.result,
      })      
    }
  }

  onImgClick = e => {
    e.preventDefault()
    this.inputRef.current.click()
  }

  render() {
    const { side } = this.props
    const imgSrc = this.props.src || side2DefaultImg[side]
    return (
      <div className={styles.cardSide}>
        <input
          ref={this.inputRef}
          className={styles.input}
          type="file" 
          accept="image/*"
          onChange={this.onInputChange} 
        />
        <img
          alt=""
          className={styles.cardImg}
          src={imgSrc}
          onClick={this.onImgClick}
        />
      </div>
    )
  }
}

