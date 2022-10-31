// API Key for Mapbox. Get one here:
// https://www.mapbox.com/studio/account/tokens/
const key =
  'pk.eyJ1IjoibWV2bGphcyIsImEiOiJjbDlyaXRsdDkwNXV6M3ZxZ2loNGUwNDBoIn0.c0FcsLrkv_Hlrj4OnIqmSA'
const mapLayerName = 'weather-radar-layer'
const openDateModalButton = document.getElementById('dataPickerButton')
const submiDateButton = document.getElementById('unixTsSubmit')
const dateTimePicker = document.getElementById('datePickerInput')
const weatherCheckbox = document.querySelector('input[id=weatherCheckbox]')
const currentDateTime = new Date().toISOString().slice(0, -8)
dateTimePicker.value = currentDateTime
const startTime = parseTimeToSeconds(new Date())
const dateModal = new bootstrap.Modal(
  document.getElementById('datePickerModal'),
  {
    keyboard: false
  }
)
// Options for map
// const options = {
//   container: 'map',
//   style: 'mapbox://styles/mapbox/light-v10',
//   zoom: 2,
//   center: [-98.5606744, 45],
//   projection: {name: 'mercator'},
//   renderWorldCopies: false,
//   testMode: true,
//   maxBounds: [
//     [-180, 0],
//     [-20, 75] // Northeast coordinates
//   ]
// }
const options = {
  lat: 45,
  lng: -98.5606744,
  container: 'map',
  zoom: 2,
  studio: true, // false to use non studio styles
  style: 'mapbox://styles/mapbox/light-v10',
  maxBounds: [
    [-180, 0],
    [-20, 75] // Northeast coordinates
  ],
  renderWorldCopies: false,
  projection: {name: 'mercator'},
  testMode: true
}
let myMap

let canvas
let meteorites

syncDateButtonValue()
registerEventListeners()

// Create an instance of Mapbox
const mappa = new Mappa('Mapbox', key)

function setup() {
  canvas = createCanvas(800, 700)

  // Create a tile map and overlay the canvas on top.
  myMap = mappa.tileMap(options)

  myMap.overlay(canvas, setupMap)

  // Load the data
  meteorites = loadTable('./../assets/Meteorite_Landings.csv', 'csv', 'header')

  // Only redraw the meteorites when the map change and not every frame.
  myMap.onChange(drawMeteorites)

  fill(109, 255, 0)
  stroke(100)
}

// The draw loop is fully functional but we are not using it for now.
function draw() {}

function drawMeteorites() {
  // Clear the canvas
  clear()

  for (let i = 0; i < meteorites.getRowCount(); i += 1) {
    // Get the lat/lng of each meteorite
    const latitude = Number(meteorites.getString(i, 'reclat'))
    const longitude = Number(meteorites.getString(i, 'reclong'))

    // Only draw them if the position is inside the current map bounds. We use a
    // Mapbox method to check if the lat and lng are contain inside the current
    // map. This way we draw just what we are going to see and not everything. See
    // getBounds() in https://www.mapbox.com/mapbox.js/api/v3.1.1/l-latlngbounds/
    if (myMap.map.getBounds().contains([latitude, longitude])) {
      // Transform lat/lng to pixel position
      const pos = myMap.latLngToPixel(latitude, longitude)
      // Get the size of the meteorite and map it. 60000000 is the mass of the largest
      // meteorite (https://en.wikipedia.org/wiki/Hoba_meteorite)
      let size = meteorites.getString(i, 'mass (g)')
      size = map(size, 558, 60000000, 1, 25) + myMap.zoom()
      ellipse(pos.x, pos.y, size, size)
    }
  }
}

function setupMap() {
  // Set the default atmosphere style
  // map.setFog({})
  // addWeatherRadarLayer()
}

function registerEventListeners() {
  weatherCheckbox.addEventListener('change', () => {
    updateWeatherLayer()
  })
  submiDateButton.addEventListener('click', () => {
    setNewDateTime()
    updateWeatherLayer()
  })
}
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
function syncDateButtonValue() {
  openDateModalButton.innerHTML = parseDateTime(dateTimePicker.value)
}
function setNewDateTime() {
  console.log(dateTimePicker.value)
  syncDateButtonValue()
  dateModal.toggle()
}
function removeWeatherRadarLayer() {
  if (map.getLayer(mapLayerName)) {
    map.removeLayer(mapLayerName)
  }
  if (map.getSource(mapLayerName)) {
    map.removeSource(mapLayerName)
  }
}
function addWeatherRadarLayer() {
  let inputtedTs = dateTimePicker.value
  let tsTime = new Date(inputtedTs)
  let timestampt = generateWeatherRadarTimestamp(tsTime)
  map.addLayer({
    id: mapLayerName,
    type: 'raster',
    source: {
      type: 'raster',
      tiles: [
        `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-${timestampt}/{z}/{x}/{y}.png`
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
  console.log(`New weather radar layer ${timestampt}`)
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
