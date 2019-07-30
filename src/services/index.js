import qs from 'qs'

export async function upload(frontFiles, backFiles, folder = 'idCard') {
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

  if (!folder) {
    return {
      isError: true,
      msg: '文件夹不能为空'
    }
  }

  try {
    const formData = new FormData();
    for (let i = 0; i < frontFiles.length; i++) {
      formData.append('idCardFront', frontFiles[i])
      formData.append('idCardBack', backFiles[i])
    }
    formData.append('fileFolder', folder)
    const response = await fetch('http://148.70.216.226:9999/upload/uploadIdCards', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      return {
        isError: true,
        msg: `上传失败，code: ${response.status}`,
      }
    }
    const data = await response.json()
    data.isError = data.code !== 0
    return data
  } catch (error) {
    console.error(error)
    return {
      isError: true,
      msg: error.message,
    }
  }

}

export async function recognize(filePath) {
  try {
    const body = qs.stringify({
      filePath: JSON.stringify(filePath),
      fileFolder: '406ea476-aeaf-4223-b75c-a72a8d55bb07',
    })
    const response = await fetch('http://47.95.204.210:8088/cardDiscern/savePersonByDiscern', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body,
    })
    if (!response.ok) {
      return {
        isError: true,
        msg: `code: ${response.status}`,
      }
    }
    const data = await response.json()
    data.isError = data.status !== 0
    return data
  } catch (error) {
    console.error(error)
    return {
      isError: true,
      msg: error.message,
    }
  }
}

// const confirmKeys = [
//   'id',
//   'address',
//   'birthday',
//   'code',
//   'expiryDate',
//   'issue',
//   'issueDate',
//   'name',
//   'nation',
//   'sex',
// ]

export async function confirm(info) {
  console.log(info)
  const response = await fetch('http://47.95.204.210:8088/cardDiscern/checkDiscern', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify({
      ...info,
      fileFolder: '406ea476-aeaf-4223-b75c-a72a8d55bb07',
    }),
  })
  if (!response.ok) {
    throw new Error(`code: ${response.status}`)
  }
  const data = await response.json()
  if (!data || data.status !== 0) {
    throw new Error(data.msg || '请求错误')
  }
  return data
}


