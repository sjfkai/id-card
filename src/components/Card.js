import React from 'react';

import CardSide from './CardSide'
import styles from './Card.module.css'

export default function Card ({ card, onCardChange, canDelete, onDelete }) {
  return (
    <div className={styles.card}>
      {
        canDelete &&
        <div onClick={onDelete} className={styles.closeIcon}/>
      }
      <CardSide
        side="front" 
        onChange={onCardChange('front')}
        src={card.front && card.front.src}
      />
      <CardSide 
        side="back" 
        onChange={onCardChange('back')}
        src={card.back && card.back.src}
      />
    </div>
  )
}

