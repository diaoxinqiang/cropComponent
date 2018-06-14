<template>
  <div :style="{position: 'absolute', height: imgHeight+'px',width: imgWidth+'px'}">
    <canvas canvas-id="ladder_canvas" 
   :style="{position: 'absolute', height: imgHeight+'px',width: imgWidth+'px'}"
    />                
    <movable-area  :style="{position: 'absolute', height: imgHeight+'px',width: imgWidth+'px'}">
        <movable-view @change="topLeftChange" id="one" direction="all" :x='positions[0][0]-12' :y='positions[0][1]-12' class="movable_view">
        </movable-view>
        <movable-view @change="bottomLeftChange" id="two" direction="all" :x='positions[1][0]-12' :y='positions[1][1]-12' class="movable_view">
        </movable-view>
        <movable-view @change="bottomRightChange" id="three" direction="all" :x='positions[2][0]-12' :y='positions[2][1]-12'  class="movable_view">
        </movable-view>
        <movable-view @change="topRightChange" id="four" direction="all" :x='positions[3][0]-12' :y='positions[3][1]-12'  class="movable_view">
        </movable-view>
    </movable-area>
  </div>
</template>

<script >
export default {
  props: ['imgWidth', 'imgHeight', 'pts'],
  data () {
    return {
      ctx: null,
      last: new Date(),
      isEffective: true,
      positions: this.pts,
      _this: this
    }
  },
  onLoad () {
    this.ctx = wx.createCanvasContext('ladder_canvas')
    this.positions = this.pts
  },
  onUnload () {
    this.imgWidth = 0
    this.imgHeight = 0
  },
  onReady () {
  },
  methods: {

    change (index, e) {
      let offset = 0
      if (e.mp && e.mp.detail && e.mp.detail.source === 'touch') {
        let position = [e.x + 12, e.y + 12]
        this.positions[index] = position
        console.log('change touch')
        offset = 0
      }
      this.$emit('positionsChange', this.positions)
      console.log('change positions:' + this.positions)
      this.drawLadder(offset)
    },
    topLeftChange (e) {
      console.log('topLeftChange X: ' + e.x + '  Y:' + e.y)

      this.change(0, e)
    },

    bottomLeftChange (e) {
      console.log('bottomLeftChange X: ' + e.x + '  Y:' + e.y)
      this.change(1, e)
    },
    bottomRightChange (e) {
      console.log('bottomRightChange X: ' + e.x + '  Y:' + e.y)
      this.change(2, e)
    },
    topRightChange (e) {
      console.log('topRightChange X: ' + e.x + '  Y:' + e.y)
      this.change(3, e)
    },
    draw (positions) {
      let _this = this
      console.log('draw position: ' + positions)
      this.positions = positions
      _this.$options.methods.drawLadder.bind(_this)()
    },
    drawLadder (offset) {
      let _this = this
      let ctx = this.ctx
      if (ctx === null) {
        this.ctx = wx.createCanvasContext('ladder_canvas')
        ctx = this.ctx
      }

      let positions = this.positions

      let isEffective = _this.$options.methods.isConvex.bind(_this)(positions)
      console.log('isEffective:' + isEffective)
      let fillStyle = 'rgba(255, 255, 255, 0.4)'
      let strokeStyle = 'white'
      if (!isEffective) {
        fillStyle = 'rgba(240, 86, 93,0.4)'
        strokeStyle = 'rgba(240, 86, 93,1)'
      }

      for (let i = 0; i < positions.length; i++) {
        ctx.beginPath()
        ctx.arc(positions[i][0] + offset, positions[i][1] + offset, 6, 0, 2 * Math.PI)
        ctx.setFillStyle(strokeStyle)
        ctx.fill()
      }
      ctx.moveTo(positions[0][0] + offset, positions[0][1] + offset)
      ctx.setFillStyle(fillStyle)
      ctx.setStrokeStyle(strokeStyle)
      for (let i = 1; i < positions.length; i++) {
        ctx.lineTo(positions[i][0] + offset, positions[i][1] + offset)
        ctx.stroke()
      }
      ctx.lineTo(positions[0][0] + offset, positions[0][1] + offset)

      ctx.setFillStyle(fillStyle)
      ctx.fill()
      ctx.stroke()
      ctx.draw()
    },
    isConvex (positions, _this) {
      if (_this == null) {
        _this = this
      }
      var clockwise = false // 顺时针初始值
      var anticlockwise = false // 逆时针初始值
      for (var i = 0; i < positions.length; i++) {
        let a = i
        let b = i + 1
        let c = i + 2
        if (b > 3) {
          b = 0
        }
        if (c > 3) {
          if (b === 0) {
            c = 1
          } else {
            c = 0
          }
        }
        if (_this.$options.methods.cross_result.bind(_this)(positions[a], positions[b], positions[c], _this)) {
          clockwise = true
        } else {
          anticlockwise = true
        }
      }
      if ((clockwise && anticlockwise) || (!clockwise && !anticlockwise)) {
        return false
      } else {
        return true
      }
    },
    cross_result (A, B, C, _this) {
      // 根据三个坐标点得到两个向量
      if (_this == null) {
        _this = this
      }
      let offset = 0
      let AB = [B[0] + offset - (A[0] + offset), B[1] + offset - (A[1] + offset)]
      let BC = [C[0] + offset - (B[0] + offset), C[1] + offset - (B[1] + offset)]
      let cross = _this.$options.methods.multiplication_cross.bind(_this)(AB, BC)
      return cross
    },
    multiplication_cross (arr1, arr2) {
    // 判断两个向量夹角关系
    // 叉乘法：即利用两条向量叉乘的结果，来判断。
    // 根据向量的叉积我们就可以判断这个多边形的内角是否均小于180度，相邻两条边的向量均保持顺时针或逆时针旋转才符合条件。
    // A,B同为向量，|A×B|=AxBy-AyBx，若这个值大于0，则说明B指向A逆时针旋转0到180的方向，
    // 若这个值小于0，则说明B指向A顺时针旋转0到180的方向，若等于0，则两向量共线。
      let one = arr1[0] * arr2[1]
      let two = arr1[1] * arr2[0]
      console.log('cross-one:' + one + '  two:' + two)
      return one - two > 0
    }

  }
}
</script>

<style  >
.movable_view{
  border: 0 solid transparent;
  border-radius: 500px;
  height: 24px;
  width: 24px; 
  background-color: transparent;
}

</style>
