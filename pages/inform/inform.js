//index.js
const app = getApp()
const apiurl = 'https://pet.zealcdn.cn/index.php/';
let sign = wx.getStorageSync('sign');
import tips from '../../utils/tips.js'
Page({
  data: {
    index: 1 //tab切换
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
      let userInfo = wx.getStorageSync('userInfo');
      let sign = wx.getStorageSync('sign');
      that.setData({
        goods_desc: wx.getStorageSync('goods_desc'),
        userInfo:userInfo
      })
      wx.request({
        url: apiurl + "bargain/bargain-detail?sign=" + sign + '&operator_id=' + app.data.kid,
        data:{
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
            width: (num1 / res.data.data.goods_price).toFixed(2)*100,
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
      // 客服号
      wx.request({
        url: apiurl + "bargain/kf?sign=" + sign + '&operator_id=' + app.data.kid,
        header: {
          'content-type': 'application/json'
        },
        method: "GET",
        success: function (res) {
          console.log("客服号", res);
          let status = res.data.status;
          if (status==1){
              that.setData({
                kf:res.data.data
              })
          }else{
            tips.alert(res.data.msg);
          }
          wx.hideLoading()
        }
      })
   
  },
  // 切换
  checkTap(e) {
    this.setData({
      index: e.currentTarget.dataset.index
    })
  },
  // 分享
  friends() {
    this.setData({
      share: true
    })
  },
  // 砍价记录
  keep(){
    wx.navigateTo({
      url: '../keep/keep'
    })
  },
  // 取消
  cancel() {
    this.setData({
      share: false
    })
  },
  // 领取
  receive(e) {
    // 获取客服号码
    let that = this;
    let sign = wx.getStorageSync('sign');
    console.log('bargain_price:', parseInt(that.data.bargain_price));
    console.log('bargain_price:', that.data.bargain_price);
    if (parseInt(that.data.bargain_price)==0){
      //获取领取码
      wx.request({
        url: apiurl + "bargain/get-code?sign=" + sign + '&operator_id=' + app.data.kid,
        header: {
          'content-type': 'application/json'
        },
        method: "GET",
        success: function (res) {
          console.log("获取领取码", res);
          let status = res.data.status;
          if (status == 1) {
            that.setData({
              ReceiveCode: res.data.data
            })
          } else {
            tips.alert(res.data.msg);
          }
        }
      })
        wx.showModal({
          content: '请添加客服微信' + that.data.kf + '加好友领取商品！领取码为' + that.data.ReceiveCode,
          confirmText: "知道了",
          cancelText: "复制",
          success: function (res) {
            if (res.confirm) { //ok
              console.log(1);
            } else { //copy
              console.log(2);
              wx.setClipboardData({
                data: '客服微信:' + that.data.kf + ',领取码为' + that.data.ReceiveCode,
                success: function (res) {
                  wx.getClipboardData({
                    success: function (res) {
                      console.log(res.data) // data
                      tips.success('复制成功，快去添加微信好友领取！')
                    }
                  })
                }
              })
            }
          }
        });
        wx.showLoading({
          title: '领取码生成中！',
        })
        
    }else{
        wx.showModal({
          content: '您还未邀请' + that.data.informAll.bargain_count + '个好友帮忙砍价，（可以继续邀请，满'+ that.data.informAll.bargain_count +'个好友可免费获得，或支付剩余金额获得商品）',
          confirmText: "去邀请",
          cancelText: "去支付",
          success: function (res) {
            if (res.confirm) { //ok
              console.log('ok');
            } else { //go pay 
              console.log('go pay');
              wx.request({
                url: apiurl + "bargain/buy?sign=" + sign + '&operator_id=' + app.data.kid,
                data:{
                  bargain_id: that.data.bargain_id
                },
                header: {
                  'content-type': 'application/json'
                },
                method: "GET",
                success: function (res) {
                  console.log("购买", res);
                  let status = res.data.status;
                  if (status == 1) {
                    console.log(res.data.data);
                    wx.requestPayment({
                      timeStamp: res.data.data.timeStamp,
                      nonceStr: res.data.data.nonceStr,
                      package: res.data.data.package,
                      signType: res.data.data.signType,
                      paySign: res.data.data.paySign,
                      'success': function (res) {  //成功
                          tips.success('支付成功！');
                          wx.showLoading({
                            title: '领取码生成中！',
                          })
                          //获取领取码
                          wx.request({
                            url: apiurl + "bargain/get-code?sign=" + sign + '&operator_id=' + app.data.kid,
                            header: {
                              'content-type': 'application/json'
                            },
                            method: "GET",
                            success: function (res) {
                              console.log("获取领取码", res);
                              let status = res.data.status;
                              if (status == 1) {
                                that.setData({
                                  ReceiveCode: res.data.data
                                })
                              } else {
                                tips.alert(res.data.msg);
                              }
                              
                            }
                          })
                          wx.showModal({
                            content: '请添加客服微信' + that.data.kf + '加好友领取商品！领取码为' + that.data.ReceiveCode,
                            confirmText: "知道了",
                            cancelText: "复制",
                            success: function (res) {
                              if (res.confirm) { //ok
                                console.log(1);
                              } else { //copy
                                console.log(2);
                                wx.setClipboardData({
                                  data: '客服微信:' + that.data.kf + ',领取码为' + that.data.ReceiveCode,
                                  success: function (res) {
                                    wx.getClipboardData({
                                      success: function (res) {
                                        console.log(res.data) // data
                                        tips.success('复制成功，快去添加微信好友领取！')
                                      }
                                    })
                                  }
                                })
                              }
                            }
                          });
                      },
                      'fail': function (res) {  //失败
                        tips.alert('支付失败！')
                      }
                      
                    })
                    wx.hideLoading()
                  } else {
                    tips.alert(res.data.msg);
                  }
                }
              })
            }
          }
        })
    }
    
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
  poster() {
    console.log('poster');
    let that = this;
    let sign = wx.getStorageSync('sign');
    wx.showLoading({
      title: '海报生成中',
    });
    console.log(apiurl + "bargain/share?sign=" + sign + '&operator_id=' + app.data.kid)
    wx.request({
      url: apiurl + "bargain/share?sign=" + sign + '&operator_id=' + app.data.kid,
      data: {
        bargain_id: that.data.bargain_id
      },
      header: {
        'content-type': 'application/json'
      },
      method: "GET",
      success: function (res) {
        console.log("海报", res.data.data);
        that.setData({
          imgUrl: res.data.data,
        })
        console.log("prewImg:", that.data.imgUrl);
        wx.previewImage({
          current: that.data.imgUrl, // 当前显示图片的http链接
          urls: [that.data.imgUrl] // 需要预览的图片http链接列表
        })
        wx.hideLoading();
        that.setData({
          share: false
        })
        wx.hideLoading()
      }
    })
   
  },
  onShareAppMessage: function (e) {
    console.log(e);
    var that = this;
    return {
      title: '快来帮我砍价',
      path: '/pages/share/share?bargain_id=' + that.data.bargain_id,
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
