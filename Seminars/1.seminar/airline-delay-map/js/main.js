// API Key for Mapbox. Get one here:
// https://www.mapbox.com/studio/account/tokens/
const key =
  'pk.eyJ1IjoibWV2bGphcyIsImEiOiJjbDlyaXRsdDkwNXV6M3ZxZ2loNGUwNDBoIn0.c0FcsLrkv_Hlrj4OnIqmSA'
const mapLayerName = 'weather-radar-layer'
const openDateModalButton = document.getElementById('dataPickerButton')
const submiDateButton = document.getElementById('unixTsSubmit')
const dateTimePicker = document.getElementById('datePickerInput')
const weatherCheckbox = document.querySelector('input[id=weatherCheckbox]')
const flightsCheckbox = document.querySelector('input[id=flightsCheckbox]')
const startTime = parseTimeToSeconds(new Date())
const dateModal = new bootstrap.Modal(
  document.getElementById('datePickerModal'),
  {
    keyboard: false
  }
)
const options = {
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  zoom: 0,
  lat: 45,
  lng: -98.5606744,
  center: [-98.5606744, 45],
  projection: {name: 'mercator'},
  renderWorldCopies: false,
  testMode: true,
  maxBounds: [
    [-180, 0], // Southwest coordinates
    [-20, 72] // Northeast coordinates
  ]
}
// Create an instance of MapboxGL
const mappa = new Mappa('MapboxGL', key)
let usaMap
let canvas
let airportsDict
let airportsTable
let flightsTable
let flightsEnabled = true

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
  parseAirports()
  canvas = createCanvas(windowWidth, windowHeight)

  // Create a tile map and overlay the canvas on top.
  usaMap = mappa.tileMap(options)
  syncDateButtonValue()
  usaMap.overlay(canvas, setTimeout(addWeatherRadarLayer, 1000))
  registerEventListeners()
  // Only redraw the flights when the map changes and not every frame.
  usaMap.onChange(drawFlights)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function registerEventListeners() {
  weatherCheckbox.addEventListener('change', () => {
    updateWeatherLayer()
  })
  flightsCheckbox.addEventListener('change', () => {
    flightsEnabled = flightsCheckbox.checked
    drawFlights()
  })
  submiDateButton.addEventListener('click', () => {
    setNewDateTime()
    updateWeatherLayer()
    loadFlights()
  })
}

function syncDateButtonValue() {
  openDateModalButton.innerHTML = parseDateTime(dateTimePicker.value)
}

function setNewDateTime() {
  syncDateButtonValue()
  dateModal.toggle()
}
