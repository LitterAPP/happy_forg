// components/autocomplete/autocomplete.js

Component({
  //behaviors: ['wx://form-field'],
  /**
   * 组件的属性列表
   */
  properties: {
    mode: {
      type: String,
      value: 'static'/**2种类型 static （必填source）， remote（必填sourceUrl） */
    },
    source: {
      type: Array,
      value: null,/**JSON对象数组，格式{id:1,value:'',sort:1,selected:false} */
      observer: '_sourceChanged'
    },
    sourceUrl: String,/**远程接口响应的data数据为JsonArray:[{id:1,value:''}] */
    keyword: String,/**远程接口查询数据源关键字，以get请求带上keyword参数 */
    placeholderText: String,
    selectedId: {
      type: Number,
      value: 0,
      observer: '_selectedIdChanged'
    },
    selecteds: {
      type: Array,
      value: [0]
    },
    filter: {/**是否带过滤文本框搜索过滤 */
      type: Boolean,
      value: false
    },
    required: {
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  ready: function () {
    /**根据属性selected value 选择item */
    if (this.data.mode === 'static') {
      var copys = this.data.source
      if (!this.data.selectedId || this.data.selectedId.length == 0) {
        if (this.data.required) {
          this.setData({ selectedItem: this.data.source[0], selecteds: [0], preSelectedIdx: 0 })
        }
      } else {
        for (var i in copys) {
          if (copys[i].id == this.data.selectedId) {
            copys[i]['selected'] = true
            this.setData({ selectedItem: copys[i], selecteds: [i], preSelectedIdx: i })
            break
          }
        }
      }

    } else if (this.data.mode === 'remote') {
      var that = this
      //console.log('Get source from remote', that.data.sourceUrl)
      var oldHolderText = this.data.placeholderText
      that.setData({ placeholderText: '数据源加载中...' })
      wx.request({
        url: that.data.sourceUrl,
        data: { keyword: that.data.keyword },
        success: function (res) {
          that.setData({ source: res.data })
          var copys = that.data.source
          console.log('that.data.selectedId', that.data.selectedId, copys)
          if (!that.data.selectedId || that.data.selectedId.length == 0) {
            if (that.data.required) {
              that.setData({ selectedItem: that.data.source[0], selecteds: [0], preSelectedIdx: 0 })
            }
          } else {
            for (var i in copys) {
              if (copys[i].id == that.data.selectedId) {
                copys[i]['selected'] = true
                that.setData({ selectedItem: copys[i], selecteds: [i], preSelectedIdx: i })
                break
              }
            }
          }
          that.setData({ placeholderText: oldHolderText })
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _sourceChanged: function (newVal, oldVal) {
      this.setData({ source: this.data.source })
    },
    _selectedIdChanged: function (newVal, oldVal) {
      if (!newVal || newVal > this.data.source.lenght - 1) {
        return
      }
      console.log(newVal, oldVal, this.data.source[newVal])
      var myEventDetail = this.data.source[newVal]
      var myEventOption = {}
      this.setData({ selectedItem: myEventDetail, selecteds: [newVal] })
      this.triggerEvent('item-selected', myEventDetail, myEventOption)
    },
    showScroll: function () {
      this.setData({ showScroll: true })
    },
    inputfocus: function (e) {

    },
    itemSelected: function (e) {
      const selectedIdx = e.detail.value[0]
      this.setData({ preSelectedIdx: selectedIdx })

      var myEventDetail = this.data.source[this.data.preSelectedIdx]
      this.setData({ selectedItem: myEventDetail, selecteds: [this.data.preSelectedIdx] })
      var myEventOption = {}
      this.triggerEvent('item-selected', myEventDetail, myEventOption)
    },
    inputed: function (e) {
      var inputVal = e.detail.value
      if (!inputVal || inputVal.length <= 0) {
        return
      }
      var copySource = this.data.source
      for (var i in copySource) {
        var value = copySource[i].value
        var idx = value.indexOf(inputVal)
        if (idx != -1) {          //
          for (var j in copySource) {
            copySource[j].selected = false
          }
          copySource[i].selected = true
          this.setData({ selectedItem: copySource[i], selecteds: [i], preSelectedIdx: i })
          break
        }
      }
    },
    confirmClick: function () {
      if (!this.data.preSelectedIdx) {
        this.setData({ preSelectedIdx: 0 })
      }
      var myEventDetail = this.data.source[this.data.preSelectedIdx]

      var myEventOption = {}
      this.setData({ selectedItem: myEventDetail, selecteds: [this.data.preSelectedIdx], showScroll: false })
      this.triggerEvent('item-selected', myEventDetail, myEventOption)
    },
    cancelClick: function (e) {
      this.setData({ showScroll: false })
    },
    clearClick: function () {
      var myEventDetail = {}
      var myEventOption = {}
      this.setData({ selectedItem: myEventDetail, showScroll: false })
      this.triggerEvent('item-selected', myEventDetail, myEventOption)
    },
    hideMask: function () {
      this.setData({ showScroll: false })
    },
    dononthing: function () { }
  }
})
