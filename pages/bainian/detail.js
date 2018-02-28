import Upload from '../../utils/upload.js'
const util = require('../../utils/util.js')
import Download from '../../utils/download.js'
const app = getApp()
var W, H,id
var player = wx.createInnerAudioContext()
player.autoplay = true
player.obeyMuteSwitch = false  

const recorderManager = wx.getRecorderManager()
const recordOptions = {
  duration: 20000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3'
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:{}
  },
  recordStart: function (e) {
    var that = this
    console.log('recordStart->currentReplayId', e.currentTarget.dataset.recordid)
    app.innerAudioContext.stop()
    that.setData({ currentReplayId: e.currentTarget.dataset.recordid })
    recorderManager.start(recordOptions) 
  },
  recordEnd: function (e) {
    var that = this
    console.log('recordEnd->currentReplayId', e.currentTarget.dataset.recordid)
    that.setData({ currentReplayId: e.currentTarget.dataset.recordid })
    recorderManager.stop()
  },
  recordListener: function () {
    var that = this
    recorderManager.onStart(() => {
      wx.showLoading({
        title: '录音中...',
      })
      that.setData({ recordBtnText: '停止' })
    });
    //错误回调
    recorderManager.onError((res) => {
      that.setData({ recordBtnText: '回福', currentReplayId: -1  }) 
      wx.showToast({
        title: '录音出错！',
      })
    })
    recorderManager.onStop((res) => {
      console.log('录音停止')
      that.setData({ recordBtnText: '...' })
      var uploadUrl = app.globalData.host + '/Upload/uploadFile'
      let recordUploadTask = new Upload([res.tempFilePath])
      recordUploadTask.upload(uploadUrl, function (keys0) {
        if (!keys0 || keys0.length == 0 || !keys0[0]) {
          that.setData({ currentReplayId: -1 })
          util.showToast('上传失败', 'error')
          return
        }
        util.GET(app.globalData.host + '/ForgNewYear/replay',
          {
            session: wx.getStorageSync('session'),
            recordId: that.data.currentReplayId,
            ossKey: keys0[0]
          }, function (res) {
            if (res && res.code == 1) {
              util.showToast('回福成功', 'success')

              that.onPullDownRefresh()
            } else {
              util.showToast('音频上传失败', 'error')
            }
            that.setData({ currentReplayId: -1 })
            wx.hideLoading()
          })
      })
    })
  },
  sendZhufu:function(e){
    util.GET(app.globalData.host + '/FormId/collect',
      {
        session: wx.getStorageSync('session'),
        appId: app.globalData.appid,
        formId: e.detail.formId
      }, function () { 
        wx.redirectTo({
          url: '/pages/bainian/index',
        })
      })
  },
  stopBgMusic: function () {
    app.bgmusicplayer.pause()
    this.setData({ playingBgMusic: false })
  },
  playBgMusic: function () {
    app.bgmusicplayer.play()
    this.setData({
      playingBgMusic: true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    id = options.id || 0
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
            app.bgmusicplayer.src = locals[0]
            that.setData({
              playingBgMusic: true
            })
          })
        }
      })


    util.GET(app.globalData.host + '/ForgNewYear/getOneBainian',
      {
        session: wx.getStorageSync('session'),
        id:id
      }, function (res) {
        console.log(res)
        if (!res && res.code != 1) {
          util.showToast('网络错误', 'error')
        } else { 
          that.setData({ item: res.data || {} })
          that.playListener()
          that.recordListener()
        }
      })
    that.setData({ W: W, H: H, itemW: W - 100, userinfo: wx.getStorageSync('userinfo') })
  },
  playVoice: function (e) {
    player.stop()
    app.innerAudioContext.stop(); 
    let logdown = new Download([e.currentTarget.dataset.recordurl], '')
    logdown.download(function (locals) {
      // 
      console.log('下载文件到本地播放', locals[0])
      player.src = locals[0]
      player.play()
    }) 
  },
  playListener: function () {
    player.onPlay(() => {
      wx.showLoading({
        title: '报福中...',
        mask: true
      })
      console.log('开始播放')
    })
    player.onEnded(() => {
      console.log('播放自动停止')
      wx.hideLoading()
    })
    player.onStop(() => {
      console.log('播放手动停止')
      wx.hideLoading()
    })
    player.onPause(() => {
      console.log('播放手动暂停')
      wx.hideLoading()
    })
    player.onError((res) => {
      console.log('播放错误', res, player.src)
      wx.hideLoading()
    })
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
    var that = this
    util.GET(app.globalData.host + '/ForgNewYear/getOneBainian',
      {
        session: wx.getStorageSync('session'),
        id: id
      }, function (res) {
        console.log(res)
        if (!res && res.code != 1) {
          util.showToast('网络错误', 'error')
        } else {
          that.setData({ item: res.data || {} }) 
        }
        setTimeout(function () {
          wx.stopPullDownRefresh()
        }, 200)
      })
    
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
    var userinfo = wx.getStorageSync('userinfo')
    return {
      title: userinfo.nickName+',给你送福拜年了！',
      path: '/pages/bainian/detail?id='+id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  } 
})