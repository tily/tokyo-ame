var Canvas = require("canvas")
var moment = require("moment-timezone")
var request = require("superagent")

var PIXELS = [
  0xffffff, // より弱い雨
  0xccffff, // 弱い雨
  0x6699ff, // 並の雨
  0x3333ff, // やや強い雨
  0x00ff00, // 強い雨
  0xffff00, // やや激しい雨
  0xff9900, // 激しい雨
  0xff0000, // より激しい雨
  0xff00ff, // 非常に激しい雨
  0x7030a0, // 猛烈な雨
]

var getIntensity = function(options, callback) {
  relativeX = (options.longitude - 138.4) / 2.14
  relativeY = (36.23 - options.latitude) / 1.13

  if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
    throw "Error: Latitude or longitude is out of area"
  }

  request.get(generateImageURL()).end(function(err, res) {
    var intensity, data, pixel, absoluteX, absoluteY, context

    if(err) {
      throw "Error: Could not fetch the image: " + err
    }

    context = createContext(res.body)
    absoluteX = Math.floor(relativeX * context.canvas.width)
    absoluteY = Math.floor(relativeY * context.canvas.height)
    data = context.getImageData(absoluteX, absoluteY, 1, 1).data

    if(data[0] == 0 && data[1] == 0 && data[2] == 0) {
      data = context.getImageData(absoluteX-1, absoluteY-1, 1, 1).data
    }

    if (data[3] > 0) {
      pixel = parseInt(data[0].toString(16) + data[1].toString(16) + data[2].toString(16), 16)
      intensity = PIXELS.indexOf(pixel) + 1
    } else {
      intensity = 0
    }
    callback(intensity)
  })
}

var generateImageURL = function() {
  var time = moment(Math.floor((Date.now() / 1000 - 30) / 300) * 300 * 1000).tz("Asia/Tokyo")
  return "http://tokyo-ame.jwa.or.jp/mesh/100/" + time.format("YYYYMMDDHHmm") + ".gif"
}

var createContext = function(binary) {
    var img = new Canvas.Image()
    img.src = binary
    canvas = new Canvas(img.width, img.height)
    ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0, img.width, img.height)
    return ctx
}

module.exports = {
  getIntensity: getIntensity
}
