
export function savePlatform () {
  wx.getSystemInfo({
    success: function (res) {
      wx.setStorageSync('platform', res.platform)
      wx.setStorageSync('system', res)

      console.log('platform:' + JSON.stringify(res))
    }
  })
}
/**
 * 根据系统类型执行不同代码
 * @param {*} callback 对象类型内部包含函数，
 * {
 *  ios: function,
 *  android: function,
 *  devtools: function,
 *  default: function,
 * }
 */
export function switchWithOS (callback) {
  let platform = wx.getStorageSync('platform')
  if (!callback) {
    console.log('switchWithOS:callback为空')
    return
  }
  switch (platform) {
    case 'devtools':
      if (callback.devtools) {
        callback.devtools()
        console.log('switchWithOS:doDev')
      } else if (callback.default) {
        callback.default()
        console.log('switchWithOS:noDevDoDefault')
      }

      break
    case 'ios':
      if (callback.ios) {
        callback.ios()
      }
      break
    case 'android':
      if (callback.android) {
        callback.android()
      }
      break
    default:
      if (callback.default) {
        callback.default()
      }
      console.log('switchWithOS未知类型')

      break
  }
}
