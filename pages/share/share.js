//index.js
const app = getApp()
const apiurl = 'https://pet.zealcdn.cn/index.php';
let sign = wx.getStorageSync('sign');
import tips from '../../utils/tips.js'
Page({
  data: {
    share:false, //分享好友
    bargain:false
  },
  //事件处理函数
  onLoad: function (option) {
    console.log("option:", option);
    this.setData({
      bargain_id: option.bargain_id
    })
  },
  onShow: function () {
    let that = this;
    app.getAuth(function () {
      let userInfo = wx.getStorageSync('userInfo');
      let sign = wx.getStorageSync('sign');
      wx.request({
        url: apiurl + "bargain/bargain-detail?sign=" + sign + '&operator_id=' + app.data.kid,
        data: {
          bargain_id: that.data.bargain_id
        },
        header: {
          'content-type': 'application/json'
        },
        method: "GET",
        success: function (res) {
          console.log("砍价详情", res.data.data);
          let goods_thumb = res.data.data.goods_thumb.split(",");
          let num1 = res.data.data.goods_price - res.data.data.bargain_price;
          that.setData({
            informAll: res.data.data,
            luobo: goods_thumb,
            width: (num1 / res.data.data.goods_price).toFixed(2) * 100,
            bargain_price: res.data.data.bargain_price
          })
          if (goods_thumb.length > 1) { //如果封面图length>1出现轮播点
            that.setData({
              indicatorDots: true,
              autoplay: true,
              interval: 3000,
              duration: 1000,
            })
          }
          wx.hideLoading()
        }
      })
    })
  },
  // 分享
  myself(){
    wx.switchTab({
      url: '../index/index'
    })
  },
  // 取消
  cancel(){
    this.setData({
      share: false
    })
  },
  //轮播图
  swipclick: function () { //图片预览
    const imgs = this.data.lunbo;
    console.log("const");
    wx.previewImage({
      current: imgs[this.data.currentIndex], // 当前显示图片的http链接
      urls: imgs // 需要预览的图片http链接列表
    })
  },
  // 海报
  poster(){
    wx.showLoading({
      title: '海报生成中',
    });
    console.log("prewImg:", this.data.imgUrl);
    wx.previewImage({
      current: this.data.imgUrl, // 当前显示图片的http链接
      urls: [this.data.imgUrl] // 需要预览的图片http链接列表
    })
    wx.hideLoading();
    this.setData({
      share: false
    })
  },
  mine(){
    this.setData({
        bargain:false
    })
  },
  help(){
    let that = this;
    let sign = wx.getStorageSync('sign');
    wx.request({
      url: apiurl + "bargain/bargain-detail?sign=" + sign + '&operator_id=' + app.data.kid,
      data: {
        bargain_id: that.data.bargain_id
      },
      header: {
        'content-type': 'application/json'
      },
      method: "GET",
      success: function (res) {
        console.log("砍价详情", res.data.data);
        let goods_thumb = res.data.data.goods_thumb.split(",");
        let num1 = res.data.data.goods_price - res.data.data.bargain_price;
        that.setData({
          informAll: res.data.data,
          luobo: goods_thumb,
          width: (num1 / res.data.data.goods_price).toFixed(2) * 100,
          bargain_price: res.data.data.bargain_price
        })
        if (goods_thumb.length > 1) { //如果封面图length>1出现轮播点
          that.setData({
            indicatorDots: true,
            autoplay: true,
            interval: 3000,
            duration: 1000,
          })
        }
        wx.hideLoading()
      }
    })
    this.setData({
       kanjia: true
    })
  },
  onShareAppMessage: function (e) {
    console.log(e);
    var that = this;
    return {
      title: '快来帮我砍价',
      path: '/pages/index/index',
      success: function (res) {
        console.log(res);
        that.setData({
          share: false
        })
        // 转发成功
      },
      fail: function (res) {
        console.log(res);
        // 转发失败
      }
    }
  }
  
  





})
