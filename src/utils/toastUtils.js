(function () {
  function show (msg) {
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  }
  module.exports = {
    show: show
  }
})()
