function updateWeatherLayer() {
  removeWeatherRadarLayer()
  if (weatherCheckbox.checked) {
    addWeatherRadarLayer()
  }
}

// Parses date into a nice format.
function parseDateTime(date) {
  // 31/10/2022 14:45:39
  return date.replaceAll('-', '/').replace('T', ' ')
}

function parseTimeToSeconds(dateObje) {
  return Math.round(dateObje.getTime() / 1000)
}

function removeWeatherRadarLayer() {
  if (usaMap.map.getLayer(mapLayerName)) {
    usaMap.map.removeLayer(mapLayerName)
  }
  if (usaMap.map.getSource(mapLayerName)) {
    usaMap.map.removeSource(mapLayerName)
  }
}
function addWeatherRadarLayer() {
  let inputtedValue = dateTimePicker.value
  let inputtedValueDate = new Date(inputtedValue)
  let parsedTimestamp = generateWeatherRadarTimestamp(inputtedValueDate)
  usaMap.map.addLayer({
    id: mapLayerName,
    type: 'raster',
    source: {
      type: 'raster',
      tiles: [
        `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-${parsedTimestamp}/{z}/{x}/{y}.png`
      ],
      tileSize: 256
    },
    paint: {
      'raster-opacity': 1,
      'raster-opacity-transition': {
        duration: 0,
        delay: 0
      },
      'raster-fade-duration': 0
    }
  })
}
function generateWeatherRadarTimestamp(date) {
  return (
    date.getFullYear() +
    ('0' + (date.getUTCMonth() + 1)).slice(-2) +
    ('0' + date.getUTCDate()).slice(-2) +
    ('0' + date.getUTCHours()).slice(-2) +
    ('0' + date.getUTCMinutes()).slice(-2)
  )
}
