App({   
  onLaunch: function () { 
  },  
  bgmusicplayer: wx.getBackgroundAudioManager(),
  innerAudioContext: wx.createInnerAudioContext(),
  globalData: {     
    appid: 'wxecaa3ad929e8dfd1',
    //host: 'http://192.168.31.144:9020'
    host: 'https://91loving.cn/proxy/cook'
  }
})
/**
 * 配色方案
 *  红色系
 * 	FF0000		BF3030		A60000		FF4040		FF7373
 *  橙色系	
 *  FF4F00		BF5D30		A63400		FF7B40		FF9E73
 *  绿色系
 *  25D500		3DA028		188A00		59EA3A		80EA69
 *  蓝色系
 *  2E16B1		3B2E84		180773		604BD8		8070D8
 *  紫色系
 *  CD0074		992667		85004B		E6399B		E667AF
 *  黄色系
 *  FFF500		BFBA30		A69F00		FFF840		FFFA73
 */