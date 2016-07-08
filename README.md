# tokyo-ame

A library to get rainfall intensity at some point in Tokyo.

## Usage

```
var ame = require("tokyo-ame")

ame.getIntensity({latitude: 35.6853871, longitude: 139.7355737}, function(intensity) {
  console.log(intensity)
})
```
