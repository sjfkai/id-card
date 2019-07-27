
function removeTime(str) {
  return str.replace('00:00:00', '').trim()
}

export async function recognize(frontFiles, backFiles) {
  if (
    !frontFiles 
    || !backFiles
    || !frontFiles.length
    || !backFiles.length
    || frontFiles.length !== backFiles.length
  ) {
    return {
      isError: true,
      msg: '文件数量不一致'
    }
  }
  try {
    const formData = new FormData();
    for (let i = 0; i < frontFiles.length; i++) {
      formData.append('idCardFront', frontFiles[i])
      formData.append('idCardBack', backFiles[i])
    }
    const response = await fetch('/oa/personal/savePersonByDiscern', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      return {
        isError: true,
        msg: `code: ${response.status}`,
      }
    }
    const data = await response.json()
    data.isError = data.code !== 0
    if (data.data) {
      data.data = data.data.map(card => ({
        ...card,
        birthday: removeTime(card.birthday),
        expiryDate: removeTime(card.expiryDate),
        issueDate: removeTime(card.issueDate),
      }))
    }
    return data
  } catch (error) {
    console.error(error)
    return {
      isError: true,
      msg: error.message,
    }
  }
}

const confirmKeys = [
  'address',
  'birthday',
  'code',
  'expiryDate',
  'issue',
  'issueDate',
  'name',
  'nation',
  'sex',
]

export async function confirm(info) {
  const formData = new FormData();
  confirmKeys.forEach(k => {
    formData.append(k, info[k])
  })
  const response = await fetch('/oa/personal/add', {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error(`code: ${response.status}`)
  }
  const data = await response.json()
  if (!data || data.code !== 0) {
    throw new Error(data.msg || '请求错误')
  }
  return data
}


