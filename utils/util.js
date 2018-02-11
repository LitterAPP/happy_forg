const app = getApp() 
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTime2(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-');
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function showToast(content, iconstr) { 

  var imageurl = '';
  if (iconstr == 'success') {
    imageurl = '/images/success_icon.png';
  }
  else if (iconstr == 'info') {
    imageurl = '/images/tips_icon.png';
  }
  else if (iconstr == 'tip') {
    imageurl = '/images/tips_icon.png';
  }
  else if (iconstr == 'warn') {
    imageurl = '/images/warn_icon.png';
  }
  else if (iconstr == 'error') {
    imageurl = '/images/error_icon.png';
  }else{
    imageurl ='/images/tips_icon.png'
  }
  wx.showToast({
    title: content,
    mask:true,
    image: imageurl
  })
}
function isMobile(mobile) {
  var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
  return myreg.test(mobile)
}
function showModal(content, iconstr) {
  var title = "提示";
  if (iconstr == 'success') {
    title = '成功';
  }
  if (iconstr == 'info') {
    title = '提示';
  }
  if (iconstr == 'warn') {
    title = '警告';
  }
  if (iconstr == 'error') {
    title = '错误';
  }
  wx.showModal({
    title: title,
    content: content,
    showCancel: false,
    confirmText: '我知道了',
    confirmColor: '#2c2c2c'
  })
  /* if (wx.canIUse('showToast.object.image')){
     var imagepath = '/images/icon-info.png';
     if (iconstr == 'success') {
       imagepath = '/images/icon-success.png';
     }
     if (iconstr == 'info') {
       imagepath = '/images/icon-info.png';
     }
     if (iconstr == 'warn') {
       imagepath = '/images/icon-warn.png';
     }
     if (iconstr == 'error') {
       imagepath = '/images/icon-error.png';
     }
     wx.showToast({
       title: title,
       image: imagepath,
       mask: true
     })
   }else{
     wx.showToast({
       title: title
     })
   } */
}

function showWindow(title, content, showCancel, confirmFun, cancelFun) {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    success: function (res) {
      console.log('confirm....', res);
      if (res.confirm) {
        typeof confirmFun == "function" && confirmFun();
      } else {
        typeof cancelFun == "function" && cancelFun();
      }
    }
  });
}

function GET(url, data, callback) {
  /*wx.showLoading({
    title: '请稍后...',
    mask: true
  })*/
  wx.showNavigationBarLoading()
  wx.request({
    url: url,
    dataType: 'json',
    data: data,
    method: 'GET',
    header: {
      'content-type': 'x-www-form-urlencoded'
    },
    complete: function (res) {
      console.log('GET', url, data, res)
      wx.hideNavigationBarLoading()
      if (res && res.statusCode == 200 && res.data) {
        typeof callback == "function" && callback(res.data);
      } else {
        showToast('网络不稳定，请稍后再试', 'error');
        typeof callback == "function" && callback(null)
      }
      //wx.hideLoading()
    }
  })
}

function POST(url, data, callback) {
  wx.showNavigationBarLoading()
  wx.request({
    url: url,
    dataType: 'json',
    data: data,
    method: 'POST',
    header: {
      'content-type': 'application/json'
    },
    complete: function (res) {
      console.log('POST', url, data, res)
      if (res && res.statusCode == 200 && res.data) {
        typeof callback == "function" && callback(res.data);
      } else {
        showToast('网络不稳定，请稍后再试', 'error');
        typeof callback == "function" && callback(null)
      }
      setTimeout(function () {
        wx.hideNavigationBarLoading()
      }, 500) 
    }
  })
}
const downRes = (url, successCallback) => {
  wx.downloadFile({
    url: url,
    success: function (data) {
      console.log('download', url, data.tempFilePath)
      typeof successCallback == "function" && successCallback(data.tempFilePath)
    },
    fail: function (res) {
      console.log('downRes fail.', res, url);
      myShowToast('资源下载失败，请稍后再试', 'error');
      typeof successCallback == "function" && successCallback(null)
    }
  })
}

function settingRecord(callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.record']) {
          typeof callback == "function" && callback(res);
        } else {
          settingRecord(callback);
        }
      },
      fail: function (res) {
        settingRecord(callback);
      }
    });
  } else {
    util.myShowToast('微信版本太低，请升级', 'warn');
  }
}
function settingLocation(callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.userLocation']) {
          typeof callback == "function" && callback(res);
        } else {
          settingLocation(callback);
        }
      },
      fail: function (res) {
        settingLocation(callback);
      }
    });
  } else {
    util.myShowToast('微信版本太低，请升级', 'warn');
  }
}

function settingPhoto(callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          typeof callback == "function" && callback(res);
        } else {
          settingPhoto(callback);
        }
      },
      fail: function (res) {
        settingPhoto(callback);
      }
    });
  } else {
    util.myShowToast('微信版本太低，请升级', 'warn');
  }
}

function setting(scope, url, callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          typeof callback == "function" && login(url, callback);
        } else {
          setting(scope, url, callback);
        }
      },
      fail: function (res) {
        setting(scope, url, callback);
      }
    });
  } else {
    util.myShowToast('微信版本太低，请升级', 'warn');
  }
}

function getUserInfo() {
  return wx.getStorageSync('userinfo')
}

function login(url, callback) {
  if (typeof callback != "function") {
    console.log(callback, 'is not function');
    return;
  }
  var userInfo = wx.getStorageSync('userinfo');
  var currentMills = new Date().getTime();
  //用户登录信息1小时过期
  if (userInfo && currentMills - userInfo['login_time'] < 1 * 60 * 60 * 1000) {
    callback(wx.getStorageSync('userinfo'));
    return;
  }
  //console.log('登录态过期');
  wx.showNavigationBarLoading()
  wx.login({
    success: function (loginRes) {
      wx.getUserInfo({
        withCredentials: true,
        complete: function (res) {
          wx.hideNavigationBarLoading()
        },
        success: function (userinfoRes) {
          GET(url,
            {
              code: loginRes.code,
              rawData: userinfoRes.rawData,
              encryptedData: userinfoRes.encryptedData,
              signature: userinfoRes.signature,
              iv: userinfoRes.iv,
              pch: wx.getStorageSync('pch')
            },
            function (data) {
              if (data) {
                data['login_time'] = new Date().getTime();
                wx.setStorageSync('userinfo', data);
                callback(data);
              }
            }
          );
        },
        fail: function (res) {
          if (wx.authorize && wx.getSetting) {
            wx.getSetting({
              success(res) {
                if (!res['scope.userInfo']) {
                  wx.authorize({
                    scope: 'scope.userInfo',
                    success() {
                      login(url, callback);
                    }
                  })
                  setting('scope.userInfo', url, callback);
                }
              }
            })
          }
          //
        }
      })
    }
  })
}
//一分钟拉取一次活动提醒显示在顶部，提前半小时提醒
function pullNotifyOnTop() {
  /*if (wx.setTopBarText) {
    setInterval(function () { 
        wx.setTopBarText(
        {
            text: '测试置顶信息' + new Date().getSeconds(),
            complete: function (res) {
              console.log(res)
            }
        }); 
    }, 60000); 
  } */
}

function formatDate(date, addDay) {
  if (addDay > 0) {
    date.setTime(date.getTime() + addDay * 24 * 60 * 60 * 1000);
  }
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-');
}

function formatCurrentTimeMinute(date) {
  var hour = date.getHours()
  var minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}


function getStartDate() {
  return formatDate(new Date(), 0);
}

function getEndDate() {
  return formatDate(new Date(), 365);
}

function getStartTime() {
  return formatCurrentTimeMinute(new Date());
}

function goHome() {
  wx.switchTab({
    url: '../index/index',
  })
}

function getSysInfo() {
  return wx.getSystemInfoSync();
}

const copyData = data => {
  if (wx.setClipboardData) {
    wx.setClipboardData({
      data: data,
      success: function () {
        wx.showToast({
          title: '复制成功',
        })
      },
      fail: function () {
       wx.showToast({
         title: '复制失败',
       })
      }
    })
  } else {
    wx.showModal({
      showCancel: false,
      title: '提示',
      content: '当前微信版本过低，无法使用复制功能,' + data
    })
  }
}
function getWXUserInfo(again, loginSucFun) {
  var session = wx.getStorageSync('session')
  session = session || ''
  var logined = wx.getStorageSync('logined')
  if (logined && logined == 1){
    loginSucFun()
    console.log('logined')
    return 
  }
  wx.getSetting({
    success(res) {
      if (!res['scope.userInfo']) {
        wx.authorize({
          scope: 'scope.userInfo',
          success() {
            wx.login({
              success: function (loginRes){
                if (loginRes.code) {
                  wx.getUserInfo({
                    withCredentials: true,
                    lang: 'zh_CN',
                    success: function (userinfoRes) {
                      var userInfo = res.userInfo
                      GET(app.globalData.host + '/CookBook/loginByWeixin', {
                        session: session,
                        code: loginRes.code,
                        rawData: userinfoRes.rawData,
                        encryptedData: userinfoRes.encryptedData,
                        signature: userinfoRes.signature,
                        iv: userinfoRes.iv,
                        appid: app.globalData.appid
                      }, function (res) {
                        if (res && res.code == 1) {
                          wx.setStorageSync('logined', 1)
                          wx.setStorageSync('userinfo', res.data)
                          wx.setStorageSync('session', res.data.session)
                        } else {
                          console.log('getWXUserInfo fail:res=', res)
                        }
                        loginSucFun()
                      })
                    },
                    fail: function () {
                      console.log('getUserInfo fail')
                      getDefaultUserSession(loginSucFun)
                    }
                  })
                }else{
                  console.log('wx.login0 fail')
                  getDefaultUserSession(loginSucFun)
                }
              },
              fail:function(){
                console.log('wx.login fail')
                getDefaultUserSession(loginSucFun)
              }
            }) 
          },
          fail: function () {
            console.log('authorize fail')
            
            wx.showModal({
              title: '授权提示',
              content: '授权仅获取用户昵称头像数据，拒绝授权将无法保存数据，请同意!',
              cancelText:'不授权',
              confirmText:'继续授权',
              showCancel: false,
              success: function (res) { 
                if (res.confirm) {
                  getWXUserInfo(true, loginSucFun)
                } else {
                   
                }
              }
            });

            if (typeof (again) ==='boolean' && again==true) {
              wx.openSetting({
                success: function () {
                  getDefaultUserSession(loginSucFun)
                }
              })
            }else{
              getDefaultUserSession(loginSucFun)
            }
          }
        })
      }
    },
    fail: function () {
      console.log('getSetting  fail')
      getDefaultUserSession(loginSucFun)

    }
  })
}
function getDefaultUserSession(loginSucFun) {
  var session = wx.getStorageSync('session')
  session = session || ''
  GET(app.globalData.host + '/CookBook/getUserSession', {
    session: session,
    "nickName": "默认",
    "gender": 0,
    "city": "CITY",
    "province": "PROVINCE",
    "country": "COUNTRY",
    "avatarUrl": "https://91loving.cn/proxy/cook/public/images/avatar_default.png"
  }, function (res) {
    if (res && res.code == 1) {
      wx.setStorageSync('userinfo', res.data)
      wx.setStorageSync('session', res.data.session)
    } else {
      console.log('getDefaultUserSession fail:res=', res)
    }
    loginSucFun()
  })
}
function checkLogin(again, loginSucFun) {
  var userinfo = getWXUserInfo(again, loginSucFun)
}
var uploadFileKeys = []
var copyTmpFiles = []
function uploadFiles(url,session,tmpfiles,callback){
  //console.log('uploadFiles', url, session,tmpfiles, uploadFileKeys)
  copyTmpFiles = tmpfiles
  if (!copyTmpFiles || copyTmpFiles.length == 0){
    var copy = uploadFileKeys
    uploadFileKeys = []
    callback(copy) 
    return
  }
  wx.uploadFile({
    url: url,
    filePath: copyTmpFiles.shift() || '',
    name: 'file',
    formData: {
      session: session
    },
    success: function (res) {
      //console.log('uploadFiles Res ', url, session,tmpfiles, res)
      if (res && res.statusCode == 200) {
        var resJson = JSON.parse(res.data);        
        if (resJson.data) {
          uploadFileKeys.push(resJson.data)          
        }
      }else{
        uploadFileKeys.push('')  
      } 
      uploadFiles(url, session, copyTmpFiles, callback)
    },
    fail:function(res){
      console.log(res)
      copyTmpFiles.pop()
      uploadFileKeys.push('')    
      uploadFiles(url, session, copyTmpFiles, callback)
    }       
  })
}

module.exports = {
  formatTime: formatTime,
  showModal: showModal,
  GET: GET,
  POST: POST,
  getUserInfo: getUserInfo,
  setting: setting,
  login: login,
  settingLocation: settingLocation,
  settingRecord: settingRecord,
  getStartDate: getStartDate,
  getEndDate: getEndDate,
  getStartTime: getStartTime,
  showWindow: showWindow,
  formatDate: formatDate,
  formatCurrentTimeMinute: formatCurrentTimeMinute,
  goHome: goHome,
  getSysInfo: getSysInfo,
  copyData: copyData,
  downRes: downRes,
  settingPhoto: settingPhoto,
  formatTime2: formatTime2,
  checkLogin: checkLogin,
  showToast: showToast,
  isMobile: isMobile,
  uploadFiles:uploadFiles
}
