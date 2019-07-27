import React from 'react';
import classNames from 'classnames'

import styles from './Confirm.module.css'

function Input({ label, value, onChange, disabled }) {
  const onInputChange = (e) => {
    e.preventDefault()
    onChange(e.target.value)
  }
  return (
    <div className={styles.input}>
      <div className={styles.inputLabel}>{label}：</div>
      <input
        className={styles.inputInput}
        value={value}
        onChange={onInputChange}
        disabled={disabled}
      />
    </div>
  )
}

const inputs = [
  {
    label: '姓名',
    key: 'name',
  }, {
    label: '性别',
    key: 'sex',
  }, {
    label: '民族',
    key: 'nation',
  }, {
    label: '出生',
    key: 'birthday',
  },{
    label: '住址',
    key: 'address',
  }, {
    label: '身份证号',
    key: 'code',
  }, {
    label: '签发机关',
    key: 'issue',
  }, {
    label: '签发日期',
    key: 'issueDate',
  }, {
    label: '有效日期',
    key: 'expiryDate',
  }
]

export default function Confirm ({ info, onInfoChange, onConfirm }) {
  const { isConfirmed, isConfirming } = info
  const isInputAndButtonDisabled = isConfirmed || isConfirming
  let buttonText = '确  认'
  if (isConfirmed) {
    buttonText = '已确认'
  } else if(isConfirming) {
    buttonText = '确认中'
  }
  const onInputChange = key => value => {
    onInfoChange({
      ...info,
      [key]: value.trim(),
    })
  }
  return (
    <div className={styles.confirm}>
      {
        inputs.map(input => {
          return (
            <Input 
              key={input.key}
              label={input.label} 
              value={info[input.key]}
              onChange={onInputChange(input.key)}
              disabled={isInputAndButtonDisabled}
            />
          )
        })
      }

      <div
        className={classNames({
          [styles.button]: true,
          [styles.buttonPrimary]: true,
          [styles.buttonDisable]: isInputAndButtonDisabled,
        })}
        onClick={onConfirm}
      >
          {buttonText}
      </div>
    </div>
  )
}

