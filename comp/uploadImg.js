import Download from '../utils/download.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    groups: {
      type: Array,
      value: [],/**{logo: '', remoteUrl: '' }*/ 
    },
    uploadButtonText: {
      type: String,
      value: '上传Logo图片（600x600）'
    },
    deleteImgSrc: String,
    w:Number,
    h:Number,
    max:{
      type: Number,
      value: 1
    },
    admin:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  attached: function () {
    /**下载远程图片到本地*/
    var that = this
     
    if (that.data.groups && that.data.groups.length > 0) {
      var downloadUrls = []
      for (let i in that.data.groups) {
        downloadUrls.push(that.data.groups[i]['remoteUrl'])
      }
      let logdown = new Download(downloadUrls, 'groups')
      logdown.download(function (locals) {
        var copys = that.data.groups
        for (let j in locals) {
          if (locals[j]) {
            copys[j]['logo'] = locals[j]
          }
        }
        that.setData({ groups: copys })

        var myEventDetail = that.data.groups
        var myEventOption = {} // 触发事件的选项 
        that.triggerEvent('item-changed', myEventDetail, myEventOption)
      })
    }else{
      //that.setData({ groups: [{ logo: '', remoteUrl: '' }]})
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    deleteInput: function (e) {
      var that = this
      wx.showModal({
        title: '删除确认',
        content: '请确认是否删除？',
        success: function (rsp) {
          if (rsp.confirm) {
            var idx = e.currentTarget.dataset.index
            var copys = that.data.groups
            copys.splice(idx, 1)
            that.setData({ groups: copys }) 
            var myEventDetail = that.data.groups
            var myEventOption = {} // 触发事件的选项 
            that.triggerEvent('item-changed', myEventDetail, myEventOption)
          }
        }
      })
    },
    addInput: function () {
      var copys = this.data.groups
      copys.push({ remoteUrl: '', logo: '' })
      this.setData({ groups: copys })
      var that = this
      var myEventDetail = that.data.groups
      var myEventOption = {} // 触发事件的选项 
      that.triggerEvent('item-changed', myEventDetail, myEventOption)
    },
    uploadLogo: function (e) {
      var idx = e.currentTarget.dataset.index
      var copys = this.data.groups
      var that = this
     // copys.splice(0,copys.length)
      wx.chooseImage({
        count: 9,
        success: function (res) {
          var selected = res.tempFilePaths
          for(let i in selected){
            var tmp = {logo:selected[i],remoteUrl:''}
            copys.push(tmp)
          } 
          that.setData({ groups: copys })
          var myEventDetail = that.data.groups
          var myEventOption = {} // 触发事件的选项 
          that.triggerEvent('item-changed', myEventDetail, myEventOption)
        },
      })
    },
    preview: function (e) {
      var that = this
      var idx = e.currentTarget.dataset.index
      var copys = that.data.groups
      wx.previewImage({
        urls: [copys[idx].logo || copys[idx].remoteUrl],
      })
    },
    deleteLogo: function (e) {
      var that = this
      var idx = e.currentTarget.dataset.index
      var copys = that.data.groups
      copys.splice(idx,1) 
      if(copys.length <= 0){
        //var tmp = { logo: '', remoteUrl: '' }
        //copys.push(tmp)
      }
      that.setData({ groups: copys })    
      var myEventDetail = that.data.groups
      var myEventOption = {} // 触发事件的选项 
      that.triggerEvent('item-changed', myEventDetail, myEventOption)
    } 
  }
})
