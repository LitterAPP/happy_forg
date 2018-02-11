/**
 * 按照顺序上传文件
 */
export default class Upload{
  constructor(_files=[],_flag){
    this.count = 0
    this.files = _files
    this.keys = []
    this.flag = _flag
    console.log('初始化上传文件列表', this.files, this.flag)    
  }  

  upload(url,callback){ 
    var that = this   
    if(that.count >= this.files.length){
      console.log('上传文件列表完成', this.files,'返回keys',that.keys,this.flag)
      callback(that.keys)
      return 
    }
    let file = that.files[that.count]
    console.log('开始上传文件', file,  this.flag)
    if(file ){
      wx.uploadFile({
        url: url,
        filePath: file,
        name: 'file',
        formData: {
          session: wx.getStorageSync('session')
        },
        complete: function (res) {
         
          if (res && res.statusCode == 200) {
            var resJson = JSON.parse(res.data);
            if (resJson.data) {
              that.keys.push(resJson.data)
            }
          }else{
            console.log('---->upload error->',res)
            that.keys.push(null)
          }
          that.count++
          that.upload(url, callback)         
        }
      }) 
    }else{
      that.keys.push(null)
      that.count++
      that.upload(url, callback)
    }    
  }
}