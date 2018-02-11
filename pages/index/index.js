import Upload from '../../utils/upload.js'
const util = require('../../utils/util.js')
const backgroundMusic = require('../../utils/backgroundMusic.js')
const app = getApp()
const playVoice = wx.createInnerAudioContext()
playVoice.autoplay = true
const recorderManager = wx.getRecorderManager()
var recording = false, forgOuting = false, playVoiceing = false
var tmpMp3
var forgs = ['/images/forg-1.png', '/images/forg-2.png', '/images/forg-3.png', '/images/forg-4.png'
  , '/images/forg-5.png', '/images/forg-6.png', '/images/forg-7.png', '/images/forg-8.png'
]
var recordTiming
var recordTimingValue = 0
var W
var H
var ItemW
var startX, startY, endX, endY

const recordOptions = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3'
}

var soundScale1, soundScale2, soundScale3, soundScale4, soundScale5, soundScale6, soundScale7
Page({
  /**
   * 页面的初始数据
   */
  data: {
    voices: [

    ],
    currentVoice: -1,
    card:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this

    W = wx.getSystemInfoSync().windowWidth
    H = wx.getSystemInfoSync().windowHeight
    ItemW = W - 50
    that.shareUserId = options.shareUserId || 0
    that.bookId = options.bookId || 0
    that.setData({ W: W, H: H, ItemW: ItemW, ItemH: Math.sqrt(ItemW * ItemW + ItemW * ItemW), scrollHeight: H - W })
    util.showToast('加载中...', 'info') 
    recorderManager.onStart(() => {
      clearInterval(recordTiming)
      that.setData({recordTimingValue:'0分0秒'})
      if (app.innerAudioContext && !app.innerAudioContext.paused) {
        app.innerAudioContext.pause()
      }
      wx.showToast({
        title: '开始录音...',
      })
      recordTimingValue = 0
      recordTiming = setInterval(function () {
        recordTimingValue++;
        if (recordTimingValue >= 10 * 60) {
          recorderManager.stop()
        }
        that.setData({ recordTimingValue: Math.floor(recordTimingValue / 60) + '分' + (recordTimingValue%60)+'秒' })
      }, 1000)
    });
    //错误回调
    recorderManager.onError((res) => {
      clearInterval(recordTiming)
      var music = wx.getStorageSync('music')
      if (music && !music.stopByMan && app.innerAudioContext.paused && app.innerAudioContext.src) {
        app.innerAudioContext.play()
      }
      wx.showToast({
        title: '录音出错！',
      })
    })

    recorderManager.onStop((res) => {
      clearInterval(recordTiming)
      console.log('录音停止')
      var music = wx.getStorageSync('music')
      if ( !music.stopByMan && app.innerAudioContext.paused && app.innerAudioContext.src) {
        app.innerAudioContext.play()
      }
      if (recordTimingValue < 5) {
        util.showToast('录音太短', 'warn')
        return
      }
      wx.showLoading({
        title: '音频上传中...',
      })
      var uploadUrl = app.globalData.host + '/Upload/uploadFile'
      let recordUploadTask = new Upload([res.tempFilePath])
      recordUploadTask.upload(uploadUrl, function (keys0) {
        util.GET(app.globalData.host + '/Forg/recordCommit',
          {
            session: wx.getStorageSync('session'),
            bookId: that.data.book.id,
            recordUrl: keys0[0],
            recordTimingValue: recordTimingValue
          }, function (res) {
            if (res && res.code == 1) {
              util.showToast('音频上传成功', 'success')
              //重新加载录音                 
              util.GET(app.globalData.host + '/Forg/getBook',
                {
                  session: wx.getStorageSync('session'),
                  bookId: that.data.book.id,
                  record: true,
                  shareUserId: that.shareUserId
                },
                function (res) {
                  if (res && res.code == 1) {
                    that.setData(
                      {
                        userId: wx.getStorageSync('userinfo').id,
                        book: res.data.book,
                        selfRecord: res.data.selfRecord || null,
                        otherRecords: res.data.otherRecords || null,
                        shareRecord: res.data.shareRecord || null,
                        pageshow: true
                      })
                    var animation1 = wx.createAnimation({
                      duration: 1000,
                      timingFunction: 'ease',
                    })
                    that.animation1 = animation1

                    var animation2 = wx.createAnimation({
                      duration: 1000,
                      timingFunction: 'ease',
                    })
                    that.animation2 = animation2

                    animation1.rotateY(180).opacity(0).step()
                    animation2.rotateY(0).opacity(1).step()
                    that.setData({
                      animationData1: animation1.export(),
                      animationData2: animation2.export()
                    })
                    setTimeout(function () {
                      that.setData({ card: -1 })
                    }, 1000)
                  }
                })
            } else {
              util.showToast('音频上传失败', 'error')
            }
            wx.hideLoading()
          })
      })
    })


    setInterval(function () {
      var flowSlowMove = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      that.flowSlowMove = flowSlowMove

      flowSlowMove.skew(-5).step()
      flowSlowMove.skew(0).step()
      that.setData({
        flowSlowMoveData: flowSlowMove.export(),
      })
      that.setData({
        flowSlowMoveData: null,
      })
    }, 5000)

    that.voiceListener()

  },
  goHome:function(e){
    util.GET(app.globalData.host + '/FormId/collect',
      {
        session: wx.getStorageSync('session'),
        appId: app.globalData.appid,
        formId: e.detail.formId
      }, function () {
        wx.navigateTo({
          url: '/pages/list/list',
        })
      })
  },
  reflush: function (e) {
    var that = this

    util.GET(app.globalData.host + '/FormId/collect',
      {
        session: wx.getStorageSync('session'),
        appId: app.globalData.appid,
        formId: e.detail.formId
      }, function () {

      })

    let shots = that.data.shots
    for (let i in shots) {
      shots[i]['X'] = 0;
      shots[i]['Y'] = 10;
      let deg = (i - 3) * 2;
      if (deg > 10) {
        deg = 10
      }
      if (deg < -10) {
        deg = -10
      }
      shots[i]['DEG'] = deg;
    }
    that.setData(
      {
        shots: shots,
      })
  },
  moveItemStart: function (e) {
    if (!e || !e.changedTouches || !e.changedTouches[0]) return
    startX = e.changedTouches[0].pageX
    startY = e.changedTouches[0].pageY
    console.log('moveItemStart-->', startX, startY)
  },
  movingItem: function (e) {
    if (!e || !e.changedTouches) return
    endX = e.changedTouches[0].pageX
    endY = e.changedTouches[0].pageY
    console.log('moveItemEnd-->', endX, endY)
    let absX = Math.abs(endX - startX)
    let absY = Math.abs(endY - startY)
    let offset = Math.sqrt(absX * absX + absY * absY)
    if (offset < 20) {
      console.log('moveItem-->小于20，不运动', endX, endY)
      return
    }
    //判断运动方向8个方向
    //正东 东南 正南 南西 正西 西北 正北 东北
    /**
     */
    var that = this
    var idx = e.currentTarget.dataset.idx
    var copyList = that.data.shots
    var maxOffset = Math.sqrt(ItemW * ItemW + ItemW * ItemW)
    let piancha = 40
    console.log(idx, copyList.length)
    if (idx == 0) {
      that.setData({ nothing: true })
      setTimeout(function () {
        let shots = that.data.shots
        for (let i in shots) {
          shots[i]['X'] = 0;
          shots[i]['Y'] = 10;
          let deg = (i - 3) * 2;
          if (deg > 10) {
            deg = 10
          }
          if (deg < -10) {
            deg = -10
          }
          shots[i]['DEG'] = deg;
        }
        that.setData(
          {
            shots: shots,
            nothing: false
          })
      }, 2000)
    }

    if (endX - startX > 0 && absY < piancha) {//正东
      console.log('正东')
      copyList[idx].X = W + maxOffset
      copyList[idx].Y = 0
    } else if (endX - startX > 0 && endY - startY > 0 && absY > piancha) {//东南
      console.log('东南')
      copyList[idx].X = W + maxOffset
      copyList[idx].Y = H + maxOffset
    } else if (endY - startY > 0 && absX < piancha) {//正南
      console.log('正南')
      copyList[idx].X = 0
      copyList[idx].Y = H + maxOffset
    } else if (endX - startX < 0 && endY - startY > 0 && absX > piancha) {//南西
      console.log('南西')
      copyList[idx].X = maxOffset * -1 - 100
      copyList[idx].Y = maxOffset
    } else if (endX - startX < 0 && absY < piancha) {//正西
      console.log('正西')
      copyList[idx].X = maxOffset * -1 - 100
      copyList[idx].Y = 0
    } else if (endY - startY < 0 && endX - startX < 0 && absY > piancha) {//西北
      console.log('西北')
      copyList[idx].X = (W + maxOffset) * -1
      copyList[idx].Y = (H + maxOffset) * -1
    } else if (endY - startY < 0 && absX < piancha) {//正北 
      console.log('正北')
      copyList[idx].X = 0
      copyList[idx].Y = (H + maxOffset) * -1
    } else if (endY - startY < 0 && endX - startX > 0 && absX > piancha) {//东北
      console.log('东北')
      copyList[idx].X = W + maxOffset
      copyList[idx].Y = (H - maxOffset) * -1
    } else {
      console.log('没触发任何方向')
    }
    copyList[idx].DEG = copyList[idx].DEG + 45
    that.setData({ shots: copyList })
  },
  moveItemEnd: function (e) {
   
  },
  addBookFlow: function () {
    var that = this
    util.GET(app.globalData.host + '/Forg/getBook',
      {
        session: wx.getStorageSync('session'),
        bookId: that.data.book.id,
        addBookFlow: true
      },
      function (res) {
        if (res && res.code == 1) {

          that.setData(
            {
              userId: wx.getStorageSync('userinfo').id,
              book: res.data.book,
              pageshow: true
            })

          var animationBookFlow = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          that.animationBookFlow = animationBookFlow
          animationBookFlow.scale(1.5, 1.5).step()
          animationBookFlow.scale(1, 1).step()
          that.setData({
            animationBookFlowData: animationBookFlow.export(),
          })
          setTimeout(function () {
            that.setData({
              animationBookFlowData: null,
            })
          }, 1000)
        }
      })
  },
  editBook: function (e) {
    var bookId = e.currentTarget.dataset.bookid

    util.GET(app.globalData.host + '/FormId/collect',
      {
        session: wx.getStorageSync('session'),
        appId: app.globalData.appid,
        formId: e.detail.formId
      }, function () {
        wx.navigateTo({
          url: '/pages/create/create?bookId=' + bookId,
        })
      })
  },
  playVoice: function (e) {
    var that = this
    console.log('playVoice')
    var idx = e.currentTarget.dataset.idx
    that.setData({ currentVoice: idx,loadingVoice:true })
    util.GET(app.globalData.host + '/Forg/getRecordUrl',
      {
        session: wx.getStorageSync('session'),
        recordId: idx
      }, function (res) {
        if(res && res.data && res.code == 1){
          playVoice.src = res.data 
          playVoice.play() 
        }else{
          util.showToast('录音损坏','error')
        }
      })
    
  },
  stopVoice: function (e) {
    console.log('stopVoice')
    var that = this
    playVoice.stop()
  },
  addFlow: function (e) {
    var that = this
    var idx = e.currentTarget.dataset.idx
    util.GET(app.globalData.host + '/Forg/recordAddFlow',
      {
        session: wx.getStorageSync('session'),
        recordId: idx
      }, function (res) {
        if (res && res.code == 1) {
          util.GET(app.globalData.host + '/Forg/getBook',
            {
              session: wx.getStorageSync('session'),
              bookId: that.data.book.id,
              record: true,
              shareUserId: that.shareUserId
            },
            function (res) {
              if (res && res.code == 1) {
                that.setData(
                  {
                    userId: wx.getStorageSync('userinfo').id,
                    book: res.data.book,
                    selfRecord: res.data.selfRecord || null,
                    otherRecords: res.data.otherRecords || null,
                    shareRecord: res.data.shareRecord || null,
                    pageshow: true,
                    animationFlowIdx: idx
                  })
              }
              var animationFlow = wx.createAnimation({
                duration: 1000,
                timingFunction: 'ease',
              })
              that.animationFlow = animationFlow
              animationFlow.scale(1.5, 1.5).step()
              animationFlow.scale(1, 1).step()
              that.setData({
                animationFlowData: animationFlow.export(),
              })
              setTimeout(function () {
                that.setData({
                  animationFlowData: null,
                })
              }, 1000)
            })
        } else {
          util.showToast('送花失败', 'error')
        }
      })
  },
  record: function (e) {
    var that = this
    var flag = e.currentTarget.dataset.flag

    util.GET(app.globalData.host + '/FormId/collect',
      {
        session: wx.getStorageSync('session'),
        appId: app.globalData.appid,
        formId: e.detail.formId
      }, function () {
      })
    if (flag == 1 && !recording) {//开始录音
      var time = 3
      recording = true
      that.setData({ time: time })
      var recodTimeDownAnimation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })
      that.recodTimeDownAnimation = recodTimeDownAnimation
      recodTimeDownAnimation.scale(5, 5).opacity(1).step()
      recodTimeDownAnimation.scale(0, 0).opacity(0).step()
      that.setData({
        recodTimeDownAnimationData: recodTimeDownAnimation.export(),
      })

      var recodTimeDownHandler = setInterval(function () {
        time--
        if (time <= 0) {
          clearInterval(recodTimeDownHandler)
          recorderManager.start(recordOptions)
          that.setData({ flag: flag })
        } else {
          that.setData({ time: time })
          var recodTimeDownAnimation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
          })
          that.recodTimeDownAnimation = recodTimeDownAnimation
          recodTimeDownAnimation.scale(5, 5).opacity(1).step()
          recodTimeDownAnimation.scale(0, 0).opacity(0).step()
          that.setData({
            recodTimeDownAnimationData: recodTimeDownAnimation.export(),
          })
        }
      }, 800)
    } else if (flag == -1 && recording) {//暂停录音
      recorderManager.stop()
      recording = false
      that.setData({ flag: flag })
    } else {
      return;
    }
  },

  forgOut1: function () {
    if (forgOuting) { return }
    forgOuting = true;
    var w = wx.getSystemInfoSync().windowWidth
    var h = wx.getSystemInfoSync().windowHeight
    var that = this
    var idx = Math.floor(Math.random() * forgs.length)
    that.setData({ forg1url: forgs[idx] })
    var forg1Move = wx.createAnimation({
      duration: 1500,
      timingFunction: 'ease-in-out',
    })
    that.forg1Move = forg1Move
    forg1Move.translate(w / 2 - 15, 30).scale(5, 5).opacity(1).rotate(360).step()
    that.setData({
      forg1MoveData: forg1Move.export(),
    })
    setTimeout(function () {
      forg1Move.translate(w - 5, -30).scale(1, 1).opacity(0).rotate(-360).step()
      forg1Move.translate(w * -1 + 5, -30).scale(1, 1).opacity(0).rotate(-360).step()
      that.setData({
        forg1MoveData: forg1Move.export(),
      })
    }, 3000)
    setTimeout(function () { forgOuting = false }, 6000)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this

    util.checkLogin(false, function () {
      backgroundMusic.instance(app.globalData.host + '/Forg/listMusic', function (music) {
       
        that.setData({ music: music })
        that.soundScale()
        that.linsternAudioEvent()
        backgroundMusic.autoPlayMusic()

        util.GET(app.globalData.host + '/Forg/getBook',
          {
            session: wx.getStorageSync('session'),
            bookId: that.bookId,
            record: true,
            shareUserId: that.shareUserId
          },
          function (res) {
            if (res && res.code == 1) {
              let shots = res.data.shots
              for (let i in shots) {
                shots[i]['X'] = 0;
                shots[i]['Y'] = 10;
                let deg = (i - 3) * 2;
                if (deg > 10) {
                  deg = 10
                }
                if (deg < -10) {
                  deg = -10
                }
                shots[i]['DEG'] = deg;
              }
              that.setData(
                {
                  userId: wx.getStorageSync('userinfo').id,
                  book: res.data.book,
                  shots: shots,
                  selfRecord: res.data.selfRecord || null,
                  otherRecords: res.data.otherRecords || null,
                  shareRecord: res.data.shareRecord || null,
                  pageshow: true
                })

              if (that.data.book.musicId != -1) {
                var music = wx.getStorageSync('music')
                for (let k in music.musicOrginList) {
                  if (that.data.book.musicId === music.musicOrginList[k].id) {
                    backgroundMusic.playMusic(k)
                  }
                }
              }
              //优先显示分享人的录音，默认显示自己的录音
              if (that.data.shareRecord) {
                that.setData({ selfRecord: that.data.shareRecord, card: -1, scrollHeight: H - W })
              }
              setTimeout(function () {
                wx.setNavigationBarTitle({
                  title: that.data.book.bookName,
                })
              }, 300)
            }
            wx.hideToast()
          })
      }) 
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
    playVoice.stop()
  },
  showMoreRecords: function () {
    var that = this 
  },
  changeCard: function (e) { 
    var that = this
    if (!that.data.selfRecord && !that.data.otherRecords) {
      util.showToast('还没人朗读','info')
      return
    } 
    var card = e.currentTarget.dataset.card 
    var animation1 = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    that.animation1 = animation1 
    var animation2 = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    console.log('changeCard',card)
    that.animation2 = animation2
    if (card == -1) {
      animation1.rotateY(180).opacity(0).step()
      animation2.rotateY(0).opacity(1).step()
      that.setData({
        animationData1: animation1.export(),
        animationData2: animation2.export()
      })
      setTimeout(function () {
        that.setData({ card: card,   scrollHeight: H - W })
      }, 1000)
    } else if (card == 1) {
      animation2.rotateY(180).opacity(0).step()
      animation1.rotateY(0).opacity(1).step()
      that.setData({
        animationData2: animation2.export(),
        animationData1: animation1.export()
      })
      setTimeout(function () {
        that.setData({ card: card })
      }, 1000)
    }
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
    var that = this
    return {
      title: '[@我]' + that.data.book.bookName,
      path: '/pages/index/index?shareUserId=' + that.data.userId + '&bookId=' + that.data.book.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  stopMusic: function () {
    backgroundMusic.stopMusic()
  },
  playMusic: function () {
    backgroundMusic.playMusic()
  },
  soundScale: function () {
    var that = this
    let count = 0
    soundScale1 = setInterval(function () {
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
  linsternAudioEvent: function () {
    var that = this
    backgroundMusic.listener(function (music) {
      that.setData({ music: music })
    })
  },
  selectedMusic: function (e) {
    var that = this
    console.log('selectedMusic', e.detail)
    let musicIndx = e.detail.id
    if (!musicIndx) return
    backgroundMusic.playMusic(musicIndx)
  },
  voiceListener: function () {
    var that = this
    playVoice.onPlay(() => {
      console.log('开始播放声音')
      app.innerAudioContext.pause()
      that.setData({ loadingVoice: false })
      util.GET(app.globalData.host + '/Forg/recordAddPlayTimes',
        {
          session: wx.getStorageSync('session'),
          recordId: that.data.currentVoice
        }, function () { })
    })
    playVoice.onEnded(() => {
      console.log('播放声音自动停止', app.innerAudioContext.paused, app.innerAudioContext.currentTime)
      that.setData({ currentVoice: -1 })
      if (app.innerAudioContext.paused && app.innerAudioContext.src) {
        app.innerAudioContext.play()
      }
    })
    playVoice.onStop(() => {
      console.log('播放手动停止')
      that.setData({ currentVoice: -1 })
      if (app.innerAudioContext.paused && app.innerAudioContext.src) {
        app.innerAudioContext.play()
      }
    })
    playVoice.onError(() => {
      wx.showToast({
        title: '声音损坏',
      })
      that.setData({ currentVoice: -1 })
      that.setData({ loadingVoice: false })
      if (app.innerAudioContext.paused && app.innerAudioContext.src) {
        app.innerAudioContext.play()
      }
    })
  }

})