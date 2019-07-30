import React from 'react'
import produce from 'immer'
import classNames from 'classnames'

import Card from './components/Card'
import AddCard from './components/AddCard'
import Confirm from './components/Confirm'
import { upload, recognize, confirm } from './services'
import styles from './App.module.css'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cards: [{}],
      results: [],
      // folder:'idCard',
      error: '',
      isRecognizing: false,
      recognizeStatus: '',
      width: window.innerWidth,
      timer: 0,
    }
  }

  componentDidMount() {
      window.addEventListener("resize", this.updateWidth);
  }
  componentWillUnmount() {
      window.removeEventListener("resize", this.updateWidth);
  }

  updateWidth = () => {
    this.setState({ width: window.innerWidth });
  }

  onCardChange = index => side => file => {
    const cards = produce(this.state.cards, draftState => {
      draftState[index][side] = file
    })
    this.setState({
      cards,
    })
  }

  onAddCard = () => {
    this.setState(prevState => ({
      cards: [
        ...prevState.cards,
        {},
      ]
    }))
  }

  onDeleteCard = index => () => {
    this.setState(({ cards }) => {
      const copyCards = [...cards]
      copyCards.splice(index, 1)
      return {
        cards: copyCards
      }
    })
  }

  onRecognize = () => {
    if (!this.isAllSideSelected()) {
      return
    }
    const { cards } = this.state
    const frontFiles = cards.map(card => card.front.file)
    const backFiles = cards.map(card => card.back.file)
    this.setState({
      isRecognizing: true,
      recognizeStatus: '上传中',
      error: '',
    })
    // 开始上传计时
    let timer = setInterval(() => {
      this.setState(prevState => ({
        timer: prevState.timer + 0.1,
      }))
    }, 100)
    upload(frontFiles, backFiles).then(data => {
      clearInterval(timer) // 清除计时
      // 上传失败
      if(data.isError) {
        this.setState({
          isRecognizing: false,
          recognizeStatus: '',
          error: `上传失败… 错误：${data.msg}`,
          timer: 0,
        })
        return Promise.reject('上传失败')
      }
      // 识别
      this.setState({
        recognizeStatus: '识别中',
        timer: 0
      })
      // 开始识别计时
      timer = setInterval(() => {
        this.setState(prevState => ({
          timer: prevState.timer + 0.1,
        }))
      }, 100)
      return recognize(data.filePath)
    }).then(resultData => {
      clearInterval(timer) // 清除计时
      if(resultData.isError) {
        this.setState({
          isRecognizing: false,
          recognizeStatus: '',
          error: `上传失败… 错误：${resultData.msg}`,
          timer: 0,
        })
        return Promise.reject('识别失败')
      }
      // 识别成功
      this.setState({
        isRecognizing: false,
        recognizeStatus: '',
        results: resultData.data,
        timer: 0,
      })
    }).catch(e => {
      console.error(e)
    })
  }

  onBack = () => {
    this.setState({
      cards: [{}],
      results: [],
    })
  }

  onInfoChange = index => data => {
    const results = produce(this.state.results, draftState => {
      draftState[index] = data
    })
    this.setState({
      results,
    })
  }

  onConfirm = index => () => {
    const info = this.state.results[index]
    if (info.isConfirming || info.isConfirmed) {
      return
    }
    const results = produce(this.state.results, draftState => {
      draftState[index].isConfirming = true
    })
    this.setState({
      error: '',
      results,
    })
    confirm(info).then(data => {
      // 确认成功
      const results = produce(this.state.results, draftState => {
        draftState[index].isConfirming = false
        draftState[index].isConfirmed = true
      })
      this.setState({
        results,
      })
    }).catch(e => {
      // 确认失败
      const results = produce(this.state.results, draftState => {
        draftState[index].isConfirming = false
      })
      this.setState({
        error: e.message,
        results,
      })
    })
  }

  // onFolderChange = e => {
  //   this.setState({
  //     folder: e.target.value,
  //   })
  // }

  isAllSideSelected = () => {
    return this.state.cards.reduce(
      (isPrevSelected, card) => isPrevSelected && card.front && card.back, 
      true
    )
  }

  isShowConfirm = () => {
    return this.state.results.length > 0
  }

  getRecognizeButtonText = () => {
    const { isRecognizing, recognizeStatus, timer } = this.state
    if (!isRecognizing) {
      return '上传识别'
    }
    return `${recognizeStatus}... ${timer.toFixed(1)}s`
  }

  renderH5() {
    const { cards, results, error, isRecognizing } = this.state
    const isAllSideSelected = this.isAllSideSelected()
    const isShowConfirm = this.isShowConfirm()
    return (
      <div className={styles.h5}>
        {
          error && <div className={styles.h5Error}>{error}</div>
        }
        <div className={styles.h5Cards}>
          {
            isShowConfirm ? (
              results.map((result, index) => (
                <div key={index} className={styles.h5Card}>
                  <Confirm 
                    info={result}
                    onInfoChange={this.onInfoChange(index)}
                    onConfirm={this.onConfirm(index)}
                  />
                </div>
              ))
            ) : (
              cards.map((card, index) => (
                <div key={index} className={styles.h5Card}>
                  <Card 
                    card={card}
                    onCardChange={this.onCardChange(index)}
                    canDelete={index !== 0}
                    onDelete={this.onDeleteCard(index)}
                  />
                </div>
              ))
            )
          }
        </div>
        {
          !isShowConfirm && isAllSideSelected &&
          <div className={styles.h5AddCard}>
            <AddCard onClick={this.onAddCard}/>
          </div>
        }
        {/* {
          !isShowConfirm &&
          <div className={styles.h5Folder}>
            <div className={styles.h5FolderLabel}>文件夹：</div>
            <input 
              className={styles.h5FolderInput} 
              value={folder}
              onChange={this.onFolderChange}
            />
          </div>
          
        } */}
        {
          // 识别按钮
          !isShowConfirm &&
          <div
            className={classNames({
              [styles.h5Button]: true,
              [styles.h5ButtonPrimary]: true,
              [styles.h5ButtonDisable]: !isAllSideSelected || isRecognizing,
            })}
            onClick={this.onRecognize}
          >
            {this.getRecognizeButtonText()}
          </div>
        }
        {
          // 返回按钮
          isShowConfirm &&
          <div
            className={classNames({
              [styles.h5Button]: true,
            })}
            onClick={this.onBack}
          >
            {'返 回'}
          </div>
        }
        
      </div>
    );
  }

  renderPc() {
    const { cards, results, error, isRecognizing } = this.state
    const isAllSideSelected = this.isAllSideSelected()
    const isShowConfirm = this.isShowConfirm()
    return (
      <div className={styles.pc}>
        {
          error && <div className={styles.pcError}>{error}</div>
        }
        <div className={styles.pcHeader}>
        {/* {
          !isShowConfirm &&
          <div className={styles.pcFolder}>
            <div className={styles.pcFolderLabel}>文件夹：</div>
            <input 
              className={styles.pcFolderInput} 
              value={folder}
              onChange={this.onFolderChange}
            />
          </div>
          
        } */}
        {
          // 识别按钮
          !isShowConfirm &&
          <div
            className={classNames({
              [styles.pcButton]: true,
              [styles.pcButtonPrimary]: true,
              [styles.pcButtonDisable]: !isAllSideSelected || isRecognizing,
            })}
            onClick={this.onRecognize}
          >
            {this.getRecognizeButtonText()}
          </div>
        }
        {
          // 返回按钮
          isShowConfirm &&
          <div
            className={classNames({
              [styles.pcButton]: true,
            })}
            onClick={this.onBack}
          >
            {'返 回'}
          </div>
        }
        </div>
        <div className={styles.pcCards}>
          {
            isShowConfirm ? (
              results.map((result, index) => (
                <div key={index} className={styles.pcCard}>
                  <Confirm 
                    info={result}
                    onInfoChange={this.onInfoChange(index)}
                    onConfirm={this.onConfirm(index)}
                  />
                </div>
              ))
            ) : (
              cards.map((card, index) => (
                <div key={index} className={styles.pcCard}>
                  <Card 
                    card={card}
                    onCardChange={this.onCardChange(index)}
                    canDelete={index !== 0}
                    onDelete={this.onDeleteCard(index)}
                  />
                </div>
              ))
            )
          }
          {
            !isShowConfirm && isAllSideSelected &&
            <div className={styles.pcAddCard}>
              <AddCard onClick={this.onAddCard}/>
            </div>
          }
        </div>
      </div>
    )
  }

  render() {
    if (window.innerWidth < 800) {
      return this.renderH5()
    }
    return this.renderPc()
  }
}

export default App;
