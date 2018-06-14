<template>
   
  <div  :class="isCrop?'image_list_container':'images_container'"  >
    <div v-if="!isCrop" class="upload_container" @click="chooseImage">
        <div  class="upload">
            <p class="upload_image" v-if="!isUploading "> 点击上传图片</p>
      
            <div class="image_div">
                <img v-if="isUploading" class="img"  :src="imageSrc"  mode='widthFix' />
                <crop
                :imgWidth="imgWidth"
                :imgHeight="imgHeight"
                :pts="positions"
                />
            </div>
          
            
        </div>
         
    </div>
        <canvas class="canvas" :style="{ width: size.width+'px',
           height: size.height+'px',
           position:'fixed',
           top:'-9999px',
           left:'-9999px'}"  canvas-id="img_canvas"></canvas>
            
  </div>
</template>

<script>
import crop from '@/components/crop'
import {sort4Points} from '@/utils/cropUtil'
import {switchWithOS} from '@/utils/systemUtil'
const toast = require('@/utils/toastUtils')

export default {
  data () {
    return {
      imageSrc: '',
      imgWidth: 0,
      isUploading: false,
      imgHeight: 0,
      size: {
        width: '1080',
        height: '1920'
      },
      positions: [ [-12, -12], [-12, -12], [-12, -12], [-12, -12] ]
    }
  },

  components: {
    crop
  },

  methods: {
    //  选择图片
    chooseImage () {
      let _this = this

      wx.chooseImage({
        count: 1,
        sizeType: ['original'], //, 'compressed'
        success: function (res) {
          _this.isUploading = true
          _this.imageSrc = res.tempFilePaths[0]
          let tempPath = res.tempFilePaths[0]
          _this.getImageInfo(tempPath)
          switchWithOS({
            // ios的original图片,小程序已经进行过压缩,一般大小在几百K左右,无须canvas压缩,可直接上传
            ios: function () {
              _this.uploadImage(tempPath)
            },
            // android的original图片比较蛋疼,小程序直接就是返回了几M的图片,直接上传原图非常浪费流量,并且上传慢,用户体验较差
            // 推测机型太多,不好适配压缩算法.
            // 而compressed图片太模糊,有时候无法满足业务.
            // 所以采用折中采用canvas压缩[这也是一个坑]
            android: function () {
              _this.compressImg(tempPath)
            },
            default: function () {
              _this.compressImg(tempPath)
            }

          })
        },
        fail: function () {
          toast.show('选择图片失败,请重新选择')
        }
      })
    },
    // 根据图片信息获取计算裁剪的默认点
    getImageInfo (imgUri) {
      let _this = this
      wx.getImageInfo({
        src: imgUri,
        success: function success (res) {
          console.log('上传图片大小:' + JSON.stringify(res))
          let scale = res.width / res.height // 获取原图比例
          let systemInfo = wx.getStorageSync('system')
          if (systemInfo === '') {
            wx.getSystemInfo({
              success: function (res) {
                systemInfo = res
                wx.setStorageSync('system', res)
                _this.setImgSize(scale, systemInfo.windowWidth, systemInfo.windowHeight)
              },
              fail: function () {
                toast.show('获取系统信息失败')
              }
            })
          } else {
            _this.setImgSize(scale, systemInfo.windowWidth, systemInfo.windowHeight)
          }
          sort4Points(_this.positions, null, _this.imgWidth, _this.imgHeight)
        },
        fail: function fail (res) {
          console.log('上传图片大小: 信息获取失败')
          toast.show('图片信息获取失败')
        }})
    },
    setImgSize (scale, windowWidth, windowHeight) {
      let _this = this
      _this.imgWidth = windowWidth * 0.9
      let maxHeight = windowHeight * 0.9
      _this.imgHeight = _this.imgWidth / scale > maxHeight ? maxHeight : _this.imgWidth / scale
      console.log('imgWidth:' + _this.imgWidth + '  imgHeight' + _this.imgHeight)
    },
    compressImg (imgUri) {
      console.log('压缩上传 imgUri:' + imgUri)

      let _this = this
      wx.getImageInfo({
        src: imgUri,
        success: function success (res) {
          console.log('imgInfo:' + JSON.stringify(res))
          let scale = res.width / res.height // 获取原图比例
          _this.size = {
            height: 1080 / scale,
            width: 1080
          }
          console.log('size:' + JSON.stringify(_this.size))
          const ctx = wx.createCanvasContext('img_canvas')
          ctx.drawImage(imgUri, 0, 0, _this.size.width, _this.size.height)
          ctx.draw(true, () => {
            _this.getDrawImg()
          })
        }})
    },
    getDrawImg () {
      let _this = this
      // 3.取出图片并保存图片
      var timestamp = Date.parse(new Date())
      timestamp = timestamp / 1000
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        quality: 0.3,
        width: this.size.width,
        height: this.size.height,
        canvasId: 'img_canvas',
        fileType: 'jpg',
        success: function (res) {
        // 成功获得地址的地方
          var sencond = Date.parse(new Date())
          sencond = sencond / 1000
          console.log('压缩耗时:' + (sencond - timestamp) + '秒')
          console.log(res.tempFilePath)
          wx.getImageInfo({
            src: res.tempFilePath,
            success: function success (res) {
              console.log('压缩图片大小:' + JSON.stringify(res))
            }})

          _this.uploadImage(res.tempFilePath)
        }
      })
    },
    uploadImage (filePath) {
      // 根据自己业务实现上传
    }

  },

  created () {

  }
}
</script>

<style scoped>
.images_container{
    width: 100%;
   height: 100%;
    background:white;
}
.upload_container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.upload{
    width: 90%;
    height: 90%;
    background:#F6F6F6;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.upload_image{
    color:#D6D6D6; 
}
.image_div{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}
.img{
  width: 100%;
  height: 100%;
}
.canvas{
  position: fixed;
  top:0;
  left:0;
}
</style>
