// API Key for Mapbox. Get one here:
// https://www.mapbox.com/studio/account/tokens/
const key =
  'pk.eyJ1IjoibWV2bGphcyIsImEiOiJjbDlyaXRsdDkwNXV6M3ZxZ2loNGUwNDBoIn0.c0FcsLrkv_Hlrj4OnIqmSA'
const mapLayerName = 'weather-radar-layer'
const openDateModalButton = document.getElementById('dataPickerButton')
const submiDateButton = document.getElementById('unixTsSubmit')
const dateTimePicker = document.getElementById('datePickerInput')
const weatherCheckbox = document.querySelector('input[id=weatherCheckbox]')
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
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  zoom: 2,
  lat: 45,
  lng: -98.5606744,
  center: [-98.5606744, 45],
  projection: {name: 'mercator'},
  renderWorldCopies: false,
  testMode: true,
  maxBounds: [
    [-180, 0],
    [-20, 75] // Northeast coordinates
  ]
}
let myMap

let canvas
var airportsDict
var flightsTable

syncDateButtonValue()
registerEventListeners()

// Create an instance of Mapbox
const mappa = new Mappa('MapboxGL', key)

function preload() {
  // Load the data
  airportsTable = loadTable('./../assets/csv/us-airports.csv', 'csv', 'header')
  flightsTable = loadTable(
    './../assets/csv/flights/2011/1.csv',
    'csv',
    'header'
  )
}

function setup() {
  setupFlights()
  canvas = createCanvas(windowWidth, windowHeight)

  // Create a tile map and overlay the canvas on top.
  myMap = mappa.tileMap(options)

  myMap.overlay(canvas, setTimeout(setupMap, 1000))

  // Only redraw the meteorites when the map change and not every frame.
  myMap.onChange(drawOverlay)

  fill(109, 255, 0)
  stroke(100)
}

// The draw loop is fully functional but we are not using it for now.
function draw() {}

function setupMap() {
  // Set the default atmosphere style
  myMap.map.setFog({})
  addWeatherRadarLayer()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function registerEventListeners() {
  weatherCheckbox.addEventListener('change', () => {
    updateWeatherLayer()
  })
  submiDateButton.addEventListener('click', () => {
    setNewDateTime()
    updateWeatherLayer()
    updateFlights()
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
  // console.log(dateTimePicker.value)
  syncDateButtonValue()
  dateModal.toggle()
}
function removeWeatherRadarLayer() {
  if (myMap.map.getLayer(mapLayerName)) {
    myMap.map.removeLayer(mapLayerName)
  }
  if (myMap.map.getSource(mapLayerName)) {
    myMap.map.removeSource(mapLayerName)
  }
}
function addWeatherRadarLayer() {
  let inputtedTs = dateTimePicker.value
  let tsTime = new Date(inputtedTs)
  let timestampt = generateWeatherRadarTimestamp(tsTime)
  myMap.map.addLayer({
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
  // console.log(`New weather radar layer ${timestampt}`)
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
