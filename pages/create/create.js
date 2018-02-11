import Upload from '../../utils/upload.js'
const util = require('../../utils/util.js')
const backgroundMusic = require('../../utils/backgroundMusic.js')
const app = getApp()
var covers, shots

var soundScale1, soundScale2, soundScale3, soundScale4, soundScale5, soundScale6, soundScale7
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  coverImgChanged: function (e) {
    console.log(e.detail)
    covers = e.detail
  },
  shotsImgChanged: function (e) {
    console.log(e.detail)
    shots = e.detail
  },
  formSumbit: function (e) {
    var that = this
    let bookName = e.detail.value.bookName

    util.GET(app.globalData.host + '/FormId/collect',
      {
        session: wx.getStorageSync('session'),
        appId: app.globalData.appid,
        formId: e.detail.formId
      }, function () {
      })

    if (!bookName || bookName.length === 0) {
      util.showToast('书名为空', 'error')
      return
    }
    if (!covers || covers.length != 1 || !covers[0].logo) {
      util.showToast('封面为空', 'error')
      return
    }
    if (!shots || shots.length < 1) {
      util.showToast('截图至少1张', 'error')
      return
    }

    var shotFiles = []
    for (let i in shots) {
      if (!shots[i].logo || shots[i].logo.length == 0) {
        util.showToast('截图不存在', 'error')
        return
      }
      shotFiles.push(shots[i].logo)
    }

    var uploadUrl = app.globalData.host + '/Upload/uploadFile'
    //上传截图
    wx.showLoading({
      title: '保存中...',
      mask: true
    })
    var music = wx.getStorageSync('music')
    let coverUploadTask = new Upload([covers[0].logo])
    coverUploadTask.upload(uploadUrl, function (keys0) {
      let coverUploadTask = new Upload(shotFiles)
      coverUploadTask.upload(uploadUrl, function (keys1) {
        var bookCover = keys0[0]
        var shots = keys1.join(',') 
        util.GET(app.globalData.host + '/Forg/createBooks',
          {
            session: wx.getStorageSync('session'),
            bookName: bookName,
            bookCover: bookCover,
            shots: shots,
            bookId: that.data.bookId,
            musicId: music.musicOrginList[music.selectedId].id
          }, function (res) {
            if (res && res.code == 1) {
              util.showToast('保存成功', 'success')
              wx.redirectTo({
                url: '/pages/index/index?bookId=' + res.data,
              })
            } else if (res.code == 1) {
              util.showToast('保存失败', 'error')
            }
            setTimeout(function () { wx.hideLoading() }, 2000)
          })
      })
    })
  },
  stopMusic: function () {
    backgroundMusic.stopMusic()
  },
  playMusic: function () {
    backgroundMusic.playMusic()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this 
    var bookId = options.bookId
    util.showToast('加载中...', 'info')
    util.checkLogin(false, function () {
      if (bookId) {
        util.GET(app.globalData.host + '/Forg/getBook', { session: wx.getStorageSync('session'), bookId: bookId }, function (res) {
          if (res && res.code == 1) {
            var covers = []
            covers.push({ logo: '', remoteUrl: res.data.book.bookCover })
            var shots = []
            for (let i in res.data.shots) {
              shots.push({ logo: '', remoteUrl: res.data.shots[i].pageShot })
            }
            that.setData({ W: wx.getSystemInfoSync().windowWidth, bookId: res.data.book.id, bookName: res.data.book.bookName, shots: shots, covers: covers, pageshow: true })
          }
          wx.hideLoading()
        })
      } else {
        console.log('login callback')
        that.setData({ W: wx.getSystemInfoSync().windowWidth, pageshow: true })
        wx.hideLoading()
      }
    })

  },
  linsternAudioEvent: function () {
    var that = this
    backgroundMusic.listener(function (music) {
      that.setData({ music: music })
    })
  },
  soundScale: function () {
    var that = this
    let count = 0
    soundScale1 =  setInterval(function () {
      if (count % 2 == 0) {
        that.setData({ musicSoundScaleY1: Math.floor(Math.random() * 5 + 1) + 1 })
      } else {
        that.setData({ musicSoundScaleY1: 1 })
      }
      count++
    }, 600)
    soundScale2 = setInterval(function () {
      if (count % 2 == 0) {
        that.setData({ musicSoundScaleY2: Math.floor(Math.random() * 5 + 1) + 1 })
      } else {
        that.setData({ musicSoundScaleY2: 1 })
      }
    }, 650)

    soundScale3 = setInterval(function () {
      if (count % 2 == 0) {
        that.setData({ musicSoundScaleY3: Math.floor(Math.random() * 5 + 1) + 1 })
      } else {
        that.setData({ musicSoundScaleY3: 1 })
      }
    }, 750)

    soundScale4 = setInterval(function () {
      if (count % 2 == 0) {
        that.setData({ musicSoundScaleY4: Math.floor(Math.random() * 5 + 1) + 1 })
      } else {
        that.setData({ musicSoundScaleY4: 1 })
      }
    }, 600)

    soundScale5 = setInterval(function () {
      if (count % 2 == 0) {
        that.setData({ musicSoundScaleY5: Math.floor(Math.random() * 5 + 1) + 1 })
      } else {
        that.setData({ musicSoundScaleY5: 1 })
      }
    }, 700)

    soundScale6 = setInterval(function () {
      if (count % 2 == 0) {
        that.setData({ musicSoundScaleY6: Math.floor(Math.random() * 5 + 1) + 1 })
      } else {
        that.setData({ musicSoundScaleY6: 1 })
      }
    }, 710)

    soundScale7 = setInterval(function () {
      if (count % 2 == 0) {
        that.setData({ musicSoundScaleY7: Math.floor(Math.random() * 5 + 1) + 1 })
      } else {
        that.setData({ musicSoundScaleY7: 1 })
      }
    }, 630)
  },
  selectedMusic: function (e) {
    var that = this
    console.log('selectedMusic', e.detail)
    let musicIndx = e.detail.id
    if (!musicIndx) return
    backgroundMusic.playMusic(musicIndx)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    backgroundMusic.instance(app.globalData.host + '/Forg/listMusic', function (music) {
      that.setData({ music: music })
      that.soundScale()
      that.linsternAudioEvent()
      backgroundMusic.autoPlayMusic()
    }) 
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
      console.log('clear interval')
      clearInterval(soundScale1)
      clearInterval(soundScale2)
      clearInterval(soundScale3)
      clearInterval(soundScale4)
      clearInterval(soundScale5)
      clearInterval(soundScale6)
      clearInterval(soundScale7)
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