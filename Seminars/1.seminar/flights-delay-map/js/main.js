// API Key for Mapbox.
const key =
  'pk.eyJ1IjoibWV2bGphcyIsImEiOiJjbDlyaXRsdDkwNXV6M3ZxZ2loNGUwNDBoIn0.c0FcsLrkv_Hlrj4OnIqmSA'
const mapLayerName = 'weather-radar-layer'
const openDateModalButton = document.getElementById('dataPickerButton')
const submiDateButton = document.getElementById('unixTsSubmit')
const dateTimePicker = document.getElementById('datePickerInput')
const weatherCheckbox = document.querySelector('input[id=weatherCheckbox]')
const onTimeFlightsCheckbox = document.querySelector('input[id=onTimeFlights]')
const lessThan10FlightsCheckbox = document.querySelector(
  'input[id=lessThan10Flights]'
)
const lessThan30FlightsCheckbox = document.querySelector(
  'input[id=lessThan30Flights]'
)
const lessThan60FlightsCheckbox = document.querySelector(
  'input[id=lessThan60Flights]'
)
const moreThan60FlightsCheckbox = document.querySelector(
  'input[id=moreThan60Flights]'
)
const startTimeSeconds = new Date().getSeconds()

const mapOptions = {
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

function preload() {
  // Load the csv data
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
  usaMap = mappa.tileMap(mapOptions)

  // Set canvas overlay.
  usaMap.overlay(canvas, setTimeout(addWeatherRadarLayer, 1000))

  registerEventListeners()

  // Only redraw the flights when the map changes and not every frame.
  usaMap.onChange(drawFlights)
}

// Resize canvas on windows resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

// Register event listeners
function registerEventListeners() {
  weatherCheckbox.addEventListener('change', () => {
    updateWeatherLayer()
  })
  onTimeFlightsCheckbox.addEventListener('change', () => {
    drawFlights()
  })
  lessThan10FlightsCheckbox.addEventListener('change', () => {
    drawFlights()
  })
  lessThan30FlightsCheckbox.addEventListener('change', () => {
    drawFlights()
  })
  lessThan60FlightsCheckbox.addEventListener('change', () => {
    drawFlights()
  })
  moreThan60FlightsCheckbox.addEventListener('change', () => {
    drawFlights()
  })

  dateTimePicker.addEventListener('change', () => {
    syncDateButtonValue()
  })
}

function syncDateButtonValue() {
  updateWeatherLayer()
  loadFlights()
}
