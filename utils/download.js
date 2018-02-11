/**按顺序下载下载完，置换为本地的文件路径 */
export default class Download{
  constructor(_urls,_flag){
    this.urls = _urls
    this.count = 0
    this.locals = []
    this.flag = _flag
    console.log('初始化下载文件列表', _flag,this.urls)
  }
  download(callback){
      var that = this
      if (that.count >= that.urls.length ){
        console.log('下载文件列表完成', that.flag,that.urls, '返回', that.locals)
        callback(that.locals)
        return 
      }
      var url = that.urls[that.count]
      console.log('开始下载url',url)
      if (url && url.length > 0 && url.startsWith('http')){
        wx.downloadFile({
          url: url,
          complete: function (res) {
            if (res && res.statusCode === 200) {
              that.locals.push(res.tempFilePath)
            } else {
              that.locals.push('')
            }
            that.count++
            that.download(callback)
          }
        })
      }else{
        that.locals.push('')
        that.count++
        that.download(callback)
      }      
  }
}