import bootstrap from 'bootstrap'
import mapboxgl from 'mapbox-gl'

export class WeatherMap {
  readonly mapLayerName: string = 'weather-radar-layer'
  readonly currentDateTime: string
  readonly openDateModalButton: HTMLElement =
    document.getElementById('openDataPicker')!
  readonly submiDateButton: HTMLElement =
    document.getElementById('unixTsSubmit')!
  readonly dateTimePicker: HTMLInputElement = document.getElementById(
    'tsDateTime'
  ) as HTMLInputElement
  readonly startTime
  readonly dateModal
  readonly weatherCheckbox: HTMLInputElement = document.querySelector(
    'input[id=weatherCheckbox]'
  )!
  map: mapboxgl.Map

  constructor() {
    this.currentDateTime = new Date().toISOString().slice(0, -8)!
    this.dateTimePicker.value = this.currentDateTime
    this.startTime = this.parseTimeToSeconds(new Date())
    this.dateModal = new bootstrap.Modal(document.getElementById('tsDialog')!, {
      keyboard: false
    })
    this.syncDateButtonValue()
    this.registerEventListeners()
    mapboxgl.accessToken =
      'pk.eyJ1IjoibWV2bGphcyIsImEiOiJjbDlyaXRsdDkwNXV6M3ZxZ2loNGUwNDBoIn0.c0FcsLrkv_Hlrj4OnIqmSA'
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 2,
      center: [-98.5606744, 45],
      projection: {name: 'mercator'},
      renderWorldCopies: false,
      testMode: true,
      maxBounds: [
        [-180, 0], // Southwest coordinates
        [-20, 75] // Northeast coordinates
      ]
    })

    this.map.on('load', () => {
      // Set the default atmosphere style
      this.map.setFog({})
      this.addWeatherRadarLayer()
    })
  }

  registerEventListeners() {
    this.weatherCheckbox.addEventListener('change', () => {
      this.updateWeatherLayer()
    })
    this.submiDateButton.addEventListener('click', () => {
      this.setNewDateTime()
      this.updateWeatherLayer()
    })
  }

  updateWeatherLayer() {
    this.removeWeatherRadarLayer()
    if (this.weatherCheckbox.checked) {
      this.addWeatherRadarLayer()
    }
  }

  // Parses date into a nice format.
  parseDateTime(date: string) {
    // 31/10/2022 14:45:39
    return date.replaceAll('-', '/').replace('T', ' ')
  }

  parseTimeToSeconds(dateObje: Date) {
    return Math.round(dateObje.getTime() / 1000)
  }

  syncDateButtonValue() {
    this.openDateModalButton.innerHTML = this.parseDateTime(
      this.dateTimePicker.value
    )
  }

  setNewDateTime() {
    console.log(this.dateTimePicker.value)
    this.syncDateButtonValue()
    this.dateModal.toggle()
  }
  removeWeatherRadarLayer() {
    if (this.map.getLayer(this.mapLayerName)) {
      this.map.removeLayer(this.mapLayerName)
    }
    if (this.map.getSource(this.mapLayerName)) {
      this.map.removeSource(this.mapLayerName)
    }
  }

  addWeatherRadarLayer() {
    let inputtedTs = this.dateTimePicker.value
    let tsTime = new Date(inputtedTs)
    let timestampt = this.generateWeatherRadarTimestamp(tsTime)
    this.map.addLayer({
      id: this.mapLayerName,
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

  generateWeatherRadarTimestamp(date: Date) {
    return (
      date.getFullYear() +
      ('0' + (date.getUTCMonth() + 1)).slice(-2) +
      ('0' + date.getUTCDate()).slice(-2) +
      ('0' + date.getUTCHours()).slice(-2) +
      ('0' + date.getUTCMinutes()).slice(-2)
    )
  }
}
