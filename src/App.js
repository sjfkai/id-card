import React from 'react'
import produce from 'immer'
import classNames from 'classnames'

import Card from './components/Card'
import AddCard from './components/AddCard'
import Confirm from './components/Confirm'
import { recognize, confirm } from './services'
import styles from './App.module.css'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cards: [{}],
      results: [],
      error: '',
      isRecognizing: false,
      width: window.innerWidth,
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
      error: '',
    })
    recognize(frontFiles, backFiles).then(data => {
      // 识别失败
      if(data.isError) {
        this.setState({
          isRecognizing: false,
          error: `识别失败… 错误：${data.msg}`,
        })
        return
      }
      // 识别成功
      this.setState({
        isRecognizing: false,
        results: data.data
      })
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

  isAllSideSelected = () => {
    return this.state.cards.reduce(
      (isPrevSelected, card) => isPrevSelected && card.front && card.back, 
      true
    )
  }

  isShowConfirm = () => {
    return this.state.results.length > 0
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
            {isRecognizing ? '识别中' : '识 别'}
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
            {isRecognizing ? '识别中' : '识 别'}
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
