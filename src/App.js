import React from 'react'
import produce from 'immer'
import classNames from 'classnames'

import Card from './components/Card'
import AddCard from './components/AddCard'
import styles from './App.module.css'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cards: [{}],
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

  isAllSideSelected = () => {
    return this.state.cards.reduce(
      (isPrevSelected, card) => isPrevSelected && card.front && card.back, 
      true
    )
  }

  renderH5() {
    const { cards } = this.state
    const isAllSideSelected = this.isAllSideSelected()
    return (
      <div className={styles.h5}>
        <div className={styles.h5Cards}>
          {
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
          }
        </div>
        {
          isAllSideSelected &&
          <div className={styles.h5AddCard}>
            <AddCard onClick={this.onAddCard}/>
          </div>
        }
        <div
          className={classNames({
            [styles.h5Button]: true,
            [styles.h5ButtonPrimary]: true,
            [styles.h5ButtonDisable]: !isAllSideSelected,
          })}
        >
          上 传
        </div>
      </div>
    );
  }

  renderPc() {
    const { cards } = this.state
    const isAllSideSelected = this.isAllSideSelected()
    return (
      <div className={styles.pc}>
        <div className={styles.pcHeader}>
          <div
            className={classNames({
              [styles.pcButton]: true,
              [styles.pcButtonPrimary]: true,
              [styles.pcButtonDisable]: !isAllSideSelected,
            })}
          >
            上 传
          </div>
        </div>
        <div className={styles.pcCards}>
          {
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
          }
          {
            isAllSideSelected &&
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
