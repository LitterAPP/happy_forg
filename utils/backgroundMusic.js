const util = require('util.js')
const app = getApp() 

function instance(url,callback){
  var music = wx.getStorageSync('music')
  if (music && music.expireSecond > Date.parse(new Date()) / 1000){  
    callback(music)
    return
  } 
  if(!music){
    music = {
      musicOrginList: [],
      musicsList: [],
      selectedId: 0, 
      play: false,
      stopByMan: false,
      expireSecond:0
    }
  }
  app.innerAudioContext.autoplay = true
  app.innerAudioContext.obeyMuteSwitch = false 
  util.GET(url, { type: 1 }, function (res) {
    if (res && res.code == 1) {
      music.musicOrginList = res.data
      music.musicsList.splice(0, music.musicsList.length)
      for (let i in music.musicOrginList) {
        let tmp = music.musicOrginList[i]
        let one = {}
        one['id'] = i;
        one['value'] = tmp.name
        if (i == 0) {
          one['selected'] = true
        } else {
          one['selected'] = false
        }
        music.musicsList.push(one) 
      }
      console.log('重新加载音频url资源')
      var expireSecond = Date.parse(new Date()) / 1000 + 30 * 60;
      music.expireSecond = expireSecond
      wx.setStorageSync('music', music)
      callback(music)
    }
  }) 
} 
function playMusic(selectedId) {   
  var music = wx.getStorageSync('music') 
  if (!app.innerAudioContext) {
    console.log('playMusic','innerAudioContext不存在')
    return
  } 
  var playIndex = music.selectedId || 0
  if (selectedId){
    playIndex = selectedId
  } 
  music.selectedId = playIndex 
  var selected = music.musicOrginList[playIndex]
  if (!selected || !selected.url) {
    console.log('playMusic', 'selected 不存在', selected, selected.url)
    return
  }  
  console.log('playMusic', selectedId)
  app.innerAudioContext.src = selected.url 
  music.replay = true
  music.stopByMan = false
  wx.setStorageSync('music', music)
  app.innerAudioContext.play() 
}

function autoPlayMusic() {
  var music = wx.getStorageSync('music')
  console.log('autoPlayMusic', music)
  if (!app.innerAudioContext) {
    console.log('autoPlayMusic', 'innerAudioContext不存在')
    return
  }
  var playIndex = music.selectedId || 0
  var selected = music.musicOrginList[playIndex]
  if (!selected || !selected.url) {
    console.log('autoPlayMusic', 'selected 不存在', selected, selected.url)
    return
  }
  if(music.stopByMan){
    console.log('autoPlayMusic', '用户主动关闭的音乐', music.stopByMan)  
    app.innerAudioContext.pause()
    return 
  } 
  console.log('autoPlayMusic', music)
  music.replay=true
  music.selectedId = playIndex 
  wx.setStorageSync('music', music)
  app.innerAudioContext.src = selected.url 
  app.innerAudioContext.play() 
}
function stopMusic() {
  var music = wx.getStorageSync('music')
  var that = this
  if (music && app.innerAudioContext && !app.innerAudioContext.paused) {  
    music.stopByMan = true
    wx.setStorageSync('music', music)
    app.innerAudioContext.pause()
  } 
}

function listener(callback){ 
  app.innerAudioContext.onPlay(() => {
    var music = wx.getStorageSync('music')
    music.replay = false 
    music.play = true 
    music.stopByMan = false
    console.log('开始播放', callback) 
    wx.setStorageSync('music', music)
    callback(music)
  })
  app.innerAudioContext.onEnded(() => {
    var music = wx.getStorageSync('music')
    console.log('播放自动停止', callback)
    if (music.selectedId + 1 <= music.musicsList.length - 1) {
      music.selectedId = music.selectedId + 1
    }
    music.play = false 
    wx.setStorageSync('music', music)  
    callback(music) 
  })
  app.innerAudioContext.onStop(() => {
    var music = wx.getStorageSync('music')
    console.log('播放手动停止', callback)
    music.play = false  
    wx.setStorageSync('music', music)
    callback(music) 
  })   
  app.innerAudioContext.onPause(() => {
    var music = wx.getStorageSync('music')
    console.log('播放手动暂停', callback)
    music.play = false  
    wx.setStorageSync('music', music)
    callback(music) 
  }) 
  app.innerAudioContext.onError((res) => {
    console.log('播放错误', res, app.innerAudioContext.src)
    var music = wx.getStorageSync('music')
    if (music.selectedId + 1 <= music.musicsList.length - 1) {
      music.selectedId = music.selectedId + 1
    }
    music.play = false  
    wx.setStorageSync('music', music)
    callback(music) 
  })
}

module.exports = {
  instance: instance, 
  listener: listener,
  playMusic: playMusic,
  stopMusic: stopMusic,
  autoPlayMusic: autoPlayMusic
}