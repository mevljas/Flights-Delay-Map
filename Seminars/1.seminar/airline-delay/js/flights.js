function setupFlights() {
  // var delays = XLSX.readFile('./../assets/airplane_delays.csv')
  // var airports = XLSX.readFile('./../assets/us-airports.csv')
  loadAirports()
  // drawAirports()
}

function loadAirports() {
  airportsDict = {}
  for (let i = 0; i < airportsTable.getRowCount(); i++) {
    const latitude = airportsTable.getNum(i, 'LATITUDE')
    const longitude = airportsTable.getNum(i, 'LONGITUDE')
    const code = airportsTable.get(i, 'IATA')

    airportsDict[code] = {
      latitude: latitude,
      longitude: longitude
    }
  }
}

function updateFlights() {
  selectedDate = new Date(dateTimePicker.value)
  flightsTable = loadTable(
    `./../assets/csv/flights/${selectedDate.getFullYear()}/${
      selectedDate.getMonth() + 1
    }.csv`,
    'csv',
    'header',
    drawOverlay
  )
}

function drawOverlay() {
  // Clear the canvas
  clear()
  drawFlights()
}

function drawAirports() {
  for (const [key, value] of Object.entries(airportsDict)) {
    // Transform lat/lng to pixel position

    const pos = myMap.latLngToPixel(value.latitude, value.longitude)
    // Get the size of the meteorite and map it. 60000000 is the mass of the largest
    // meteorite (https://en.wikipedia.org/wiki/Hoba_meteorite)
    let size = 20
    size = map(size, 558, 60000000, 1, 25) + myMap.zoom()
    ellipse(pos.x, pos.y, size, size)
  }
}

function drawFlights() {
  const lineOpacity = 0.5
  let selectedDate = new Date(dateTimePicker.value)
  // let selectedYear = selectedDate.getFullYear()
  // let selectedMonth = selectedDate.getMonth() + 1
  let selectedDay = selectedDate.getDate()
  // let selectedTime = selectedDate.getTime()
  for (let i = 0; i < flightsTable.getRowCount(); i++) {
    // for (let i = 0; i < 10; i++) {
    // Get the lat/lng of each flight
    const year = flightsTable.getNum(i, 'YEAR')
    const month = flightsTable.getNum(i, 'MONTH')
    const day = flightsTable.getNum(i, 'DAY')
    const departureTime = flightsTable.getString(i, 'CRS_DEP_TIME')
    const arrivalTime = flightsTable.getString(i, 'CRS_ARR_TIME')
    const origin = flightsTable.getString(i, 'ORIGIN')
    const destination = flightsTable.getString(i, 'DEST')
    const delay = flightsTable.getNum(i, 'ARR_DELAY')
    const originCoords = airportsDict[origin]
    const destinationCoords = airportsDict[destination]

    var departureDate = new Date(
      month + '/' + day + '/' + year + ' ' + departureTime
    )
    var arrivalDate = new Date(
      month + '/' + day + '/' + year + ' ' + arrivalTime
    )

    // console.log('')
    // console.log('origin: ' + origin)
    // console.log('destination: ' + destination)
    // console.log('selectedDay: ' + selectedDay)
    // console.log('selectedDate: ' + selectedDate)
    // console.log('departureDate: ' + departureDate)
    // console.log('arrivalDate: ' + arrivalDate)
    // console.log('selectedTime: ' + selectedTime)
    // console.log("departureDate: " + departureDate.getTime())
    // console.log("arrivalDate: " + arrivalDate.getTime())

    if (day > selectedDay) {
      // console.info('break day > selectedDay')
      break
    }

    if (day < selectedDay) {
      // console.info('continue day < selectedDay')
      continue
    }

    // Check wheter the plaine is flying right now
    if (departureDate < selectedDate && arrivalDate > selectedDate) {
      // CHeck wheter any of the coordinats is undefined
      if (
        typeof originCoords == 'undefined' ||
        typeof destinationCoords == 'undefined'
      ) {
        // console.error('undefined')
        continue
      }

      // console.info('drawing')

      // Transform lat/lng to pixel position
      const p0 = myMap.latLngToPixel(
        originCoords.latitude,
        originCoords.longitude
      )
      const p1 = myMap.latLngToPixel(
        destinationCoords.latitude,
        destinationCoords.longitude
      )

      if (delay == 0) {
        // black
        stroke(`rgba(0,0,0,${lineOpacity})`)
      } else if (delay <= 10) {
        // green
        stroke(`rgba(0,255,0,${lineOpacity})`)
      } else if (delay <= 30) {
        // yellow
        stroke(`rgba(255,255,0,${lineOpacity})`)
      } else if (delay <= 60) {
        // orange
        stroke(`rgba(255,165,0,${lineOpacity})`)
      } else {
        // red
        stroke(`rgba(255,0,0,${lineOpacity})`)
      }
      line(p0.x, p0.y, p1.x, p1.y)
    }
    // console.info(
    //   'continue departureDate < selectedDate & arrivalDate > selectedDate' is false
    // )
  }
}
