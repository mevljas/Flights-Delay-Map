import bootstrap from 'bootstrap'
import mapboxgl from 'mapbox-gl'

export class WeatherMap {
  readonly msPerMinute: number = 60000 //offset in milliseconds
  readonly timeZoneOffset: number =
    new Date().getTimezoneOffset() * this.msPerMinute
  readonly localIsoTime: string = new Date(
    Date.now() - this.timeZoneOffset
  ).toISOString()
  currentDateTime: string = this.localIsoTime.slice(0, -8)
  dateButton: HTMLElement = document.getElementById('openDataPicker')!
  submitButton: HTMLElement = document.getElementById('unixTsSubmit')!
  currentTime: Date = new Date()
  currentTimeStamp = this.getTimeStamp(this.currentTime)
  dateModal = new bootstrap.Modal(document.getElementById('tsDialog')!, {
    keyboard: false
  })
  weatherCheckbox: HTMLInputElement = document.querySelector(
    'input[id=weatherCheckbox]'
  )!
  allFrames!: number
  radarLoopTime!: number
  minutesToSubtract: number[] = []
  map: mapboxgl.Map

  constructor() {
    ;(<HTMLInputElement>document.getElementById('openDataPicker'))!.value =
      this.currentDateTime
    this.dateButton.innerHTML = this.printFancyTime(
      new Date(
        (<HTMLInputElement>document.getElementById('openDataPicker'))!.value
      )
    )

    this.numberOfFrames(15)
    this.loopSpeed(500)

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
      this.weatherCheckbox.addEventListener('change', () => {
        if (this.weatherCheckbox.checked) {
          this.initializeNexradLayer(this.allFrames)
        } else {
          this.removeNexradLayer(this.allFrames + 1)
        }
      })
      this.submitButton.addEventListener('click', () => {
        this.setnewDateTime()
      })
    })
  }

  printFancyTime(dateObj: Date) {
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString()
  }

  getTimeStamp(dateObje: Date) {
    return Math.round(dateObje.getTime() / 1000)
  }

  numberOfFrames(numofframes: number) {
    this.allFrames = numofframes
    for (var w = 0; w < numofframes + 1; w++) {
      this.minutesToSubtract.push(w * 5)
    }
    this.minutesToSubtract.reverse()
  }
  loopSpeed(timeMs: number) {
    // radar loop time is in ms
    this.radarLoopTime = timeMs
  }

  setnewDateTime() {
    var inputtedTs = (<HTMLInputElement>document.getElementById('tsDateTime'))!
      .value
    console.log(inputtedTs)
    this.dateButton.innerHTML = this.printFancyTime(
      new Date(
        (<HTMLInputElement>document.getElementById('openDataPicker')).value
      )
    )
    this.dateModal.toggle()
  }
  initializeNexradLayer(fram: number) {
    for (var t = fram; t > -1; t--) {
      if (t == fram) {
        this.addNexradLayer(t, 1)
      } else {
        this.addNexradLayer(t, 0)
      }
    }
  }
  removeNexradLayer(frames: number) {
    for (var t = 0; t < frames; t++) {
      if (this.map.getLayer(`wms-test-layer${t}`)) {
        this.map.removeLayer(`wms-test-layer${t}`)
      }
      if (this.map.getSource(`wms-test-layer${t}`)) {
        this.map.removeSource(`wms-test-layer${t}`)
      }
    }
  }

  addNexradLayer(indexInArray: number, opacity: number) {
    var inputtedTs = (<HTMLInputElement>document.getElementById('tsDateTime'))
      .value
    var tsTime = new Date(inputtedTs)
    var subtractedTime = new Date(
      tsTime.getTime() -
        this.minutesToSubtract[indexInArray]! * this.msPerMinute
    )
    this.map.addLayer({
      id: `wms-test-layer${indexInArray}`,
      type: 'raster',
      source: {
        type: 'raster',
        // use the tiles option to specify a WMS tile source URL
        // https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/
        tiles: [
          `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-${this.isuTimestamp(
            subtractedTime
          )}/{z}/{x}/{y}.png`
          //'https://img.nj.gov/imagerywms/Natural2015?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=Natural2015'
          //'https://opengeo.ncep.noaa.gov/geoserver/klwx/klwx_bref_raw/ows?&service=WMS&request=GetMap&layers=&styles=&format=image/png&transparent=true&version=1.1.1&SERVICE=WMS&LAYERS=klwx_bref_raw&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}'
          //https://opengeo.ncep.noaa.gov/geoserver/klwx/klwx_bref_raw/ows?&service=WMS&request=GetMap&layers=&styles=&format=image/png&transparent=true&version=1.1.1&SERVICE=WMS&LAYERS=klwx_bref_raw&width=256&height=256&srs=EPSG:3857&bbox=-20037508.342789244,0,-10018754.171394622,10018754.17139462
        ],
        tileSize: 256
      },
      paint: {
        'raster-opacity': opacity,
        'raster-opacity-transition': {
          duration: 0,
          delay: 0
        },
        'raster-fade-duration': 0
      }
    })
    console.log(
      `added layer ${indexInArray} - ${this.isuTimestamp(subtractedTime)}`
    )
  }

  isuTimestamp(date: Date) {
    return (
      date.getFullYear() +
      ('0' + (date.getUTCMonth() + 1)).slice(-2) +
      ('0' + date.getUTCDate()).slice(-2) +
      ('0' + date.getUTCHours()).slice(-2) +
      ('0' + date.getUTCMinutes()).slice(-2)
    )
  }
}
