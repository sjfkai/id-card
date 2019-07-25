import React from 'react'

import styles from './AddCard.module.css'

export default function AddCard({ onClick }) {
  return (
    <div className={styles.addCard} onClick={onClick}>
      <div className={styles.icon} />
      <div className={styles.text}>添加一张</div>
    </div>
  )
}