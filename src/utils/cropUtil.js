export function sort4Points (points, pts, imgWidth, imgHeight) {
  if (pts == null) { // 失败失败,没有获取到四个点
    let offset = 12
    let defaultPoints = [ [offset, offset], [ offset, imgHeight - offset ], [ imgWidth - offset, imgHeight - offset ], [ imgWidth - offset, offset ] ]
    for (const index in defaultPoints) {
      points[index] = defaultPoints[index]
    }
  } else {
    let sumMax = 0 // 右下 x+y和最大
    let sumMin = 0 // 左上 x+y和最小
    let differenceMax = 0// 左下 y-x差最大
    let differenceMin = 0// 右上 y-x差最小
    let compare = [[0, 0], [0, 0], [0, 0], [0, 0]] // 第一列 x+y  第二列为y-x
    let positions = [[0, 0], [0, 0], [0, 0], [0, 0]]
    for (let i = 0; i < pts.length; i++) {
      positions[i][0] = pts[i][0] * imgWidth
      positions[i][1] = pts[i][1] * imgHeight
      compare[i][0] = positions[i][0] + positions[i][1]
      compare[i][1] = positions[i][1] - positions[i][0]

      if (i > 0) {
        if (compare[i][0] > compare[ sumMax ][0]) {
          sumMax = i
        }
        if (compare[i][0] < compare[sumMin][0]) {
          sumMin = i
        }
        if (compare[i][1] > compare[differenceMax][1]) {
          differenceMax = i
        }
        if (compare[i][1] < compare[differenceMin][1]) {
          differenceMin = i
        }
      }
    }
    points[0] = positions[sumMin]
    points[1] = positions[differenceMax]
    points[2] = positions[sumMax]
    points[3] = positions[differenceMin]
  }
}
// 根据宽高计算四个点比例
export function format4Points (points, imgWidth, imgHeight) {
  // 根据宽高比计算比例
  let pts = []
  for (let i = 0; i < points.length; i++) {
    let pt = []
    pt.push(points[i][0] / imgWidth)
    pt.push(points[i][1] / imgHeight)
    pts.push(pt)
  }
  return pts
}
