import Upload from '../../utils/upload.js'
const util = require('../../utils/util.js')
import Download from '../../utils/download.js'
const app = getApp()
const recorderManager = wx.getRecorderManager()
const recordOptions = {
  duration: 20000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3'
}
var W, H, templateId
Page({
  /**
   * 页面的初始数据
   */
  data: {
    templateId: -1,
    recordBtnText: '点击说祝福',
    templates: []
  },
  stopBgMusic:function(){
    app.bgmusicplayer.pause()
    this.setData({ playingBgMusic:false})
  },
  playBgMusic: function () {
    app.bgmusicplayer.play()
    this.setData({
      playingBgMusic: true
    })
  },
  recordStart: function (e) {
    var that = this
    console.log('recordStart->templateId', e.currentTarget.dataset.id)
    app.innerAudioContext.stop()
    that.setData({ templateId: e.currentTarget.dataset.id }) 
    recorderManager.start(recordOptions)
  },
  recordEnd: function (e) {
    var that = this
    console.log('recordEnd->templateId', e.currentTarget.dataset.id)
    that.setData({ templateId: e.currentTarget.dataset.id }) 
    recorderManager.stop()
  },
  myBainianBang: function (e) {
    util.GET(app.globalData.host + '/FormId/collect',
      {
        session: wx.getStorageSync('session'),
        appId: app.globalData.appid,
        formId: e.detail.formId
      }, function () {
        wx.navigateTo({
          url: '/pages/bainian/mylist',
        })
      })
  },
  recordListener: function () {
    var that = this
    recorderManager.onStart(() => {
      wx.showLoading({
        title: '录音中...',
      })
      that.setData({ recordBtnText: '点击完成录音' })
    });
    //错误回调
    recorderManager.onError((res) => {
      wx.hideLoading()
      that.setData({ recordBtnText: '点击说祝福' })
      that.setData({ templateId: -1 })
      wx.showToast({
        title: '录音出错！',
      })
    })
    recorderManager.onStop((res) => {
      console.log('录音停止')
      that.setData({ recordBtnText: '祝福上传中...' })
      var uploadUrl = app.globalData.host + '/Upload/uploadFile'
      let recordUploadTask = new Upload([res.tempFilePath])
      wx.hideLoading()
      recordUploadTask.upload(uploadUrl, function (keys0) {
        if (!keys0 || keys0.length==0 || !keys0[0]){
          that.setData({ templateId: -1 })
          util.showToast('上传失败','error')
          return
        }
        util.GET(app.globalData.host + '/ForgNewYear/voiceCommit',
          {
            session: wx.getStorageSync('session'),
            templateId: that.data.templateId,
            ossKey: keys0[0]
          }, function (res) {
            if (res && res.code == 1) {
              that.setData({ templateId: -1 })
              util.showToast('在祝福榜查看', 'success')
              wx.navigateTo({
                url: '/pages/bainian/mylist',
              })
            } else {
              util.showToast('音频上传失败', 'error')
            }
          })
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    W = wx.getSystemInfoSync().windowWidth
    H = wx.getSystemInfoSync().windowHeight

    util.GET(app.globalData.host + '/ForgNewYear/getBgMusic',
      {}, function (res) {
        if (res && res.code == 1) {
          let logdown = new Download([res.data], '')
          logdown.download(function (locals) {
            // 
            console.log('下载文件到本地播放', locals[0])
            app.bgmusicplayer.title = '新年好' 
            app.innerAudioContext.stop() 
            app.bgmusicplayer.epname = 'unknow'
            app.bgmusicplayer.singer = 'unknow'
            app.bgmusicplayer.src = locals[0]
            that.setData({
              playingBgMusic: true
            })
          })
        }
      })

    util.GET(app.globalData.host + '/ForgNewYear/listTemplate',
      {
        session: wx.getStorageSync('session')
      }, function (res) {
        console.log(res)
        if (!res && res.code != 1) {
          util.showToast('网络错误', 'error')
        } else {
          that.recordListener()
          that.setData({ templates: res.data })
        }
      })
    that.setData({ W: W, H: H, itemW: W - 100, userinfo: wx.getStorageSync('userinfo') })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})