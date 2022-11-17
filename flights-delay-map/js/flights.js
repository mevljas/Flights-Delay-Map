// Parse the list of airports from csv and save them to a dictionary.
function parseAirports() {
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

// Load the flight for a selected datetime.
function loadFlights() {
  selectedDate = new Date(dateTimePicker.value)
  flightsTable = loadTable(
    `./../assets/csv/flights/${selectedDate.getFullYear()}/${
      selectedDate.getMonth() + 1
    }.csv`,
    'csv',
    'header',
    drawFlights
  )
}

// Draw flights on th canvas
function drawFlights() {
  clear()
  const lineOpacity = 0.5
  const selectedDate = new Date(dateTimePicker.value)
  const selectedDay = selectedDate.getDate()
  const selectedTime = selectedDate.toTimeString().substring(0, 5)
  for (let i = 0; i < flightsTable.getRowCount(); i++) {
    const day = flightsTable.getNum(i, 'DAY')
    const departureTime = flightsTable.getString(i, 'CRS_DEP_TIME')
    const arrivalTime = flightsTable.getString(i, 'CRS_ARR_TIME')
    const origin = flightsTable.getString(i, 'ORIGIN')
    const destination = flightsTable.getString(i, 'DEST')
    const delay = flightsTable.getNum(i, 'ARR_DELAY')
    const originCoords = airportsDict[origin]
    const destinationCoords = airportsDict[destination]

    // Don't draw future flights
    if (day > selectedDay) {
      break
    }

    // Skip past flights
    if (day < selectedDay) {
      continue
    }

    // Check wheter the plane is flying right now
    if (departureTime < selectedTime && arrivalTime > selectedTime) {
      try {
        // Transform lat/lng to pixel position
        const p0 = usaMap.latLngToPixel(
          originCoords.latitude,
          originCoords.longitude
        )
        const p1 = usaMap.latLngToPixel(
          destinationCoords.latitude,
          destinationCoords.longitude
        )

        if (delay == 0 && onTimeFlightsCheckbox.checked) {
          // black
          stroke(`rgba(0,0,0,${lineOpacity})`)
          line(p0.x, p0.y, p1.x, p1.y)
        } else if (
          delay > 0 &&
          delay <= 10 &&
          lessThan10FlightsCheckbox.checked
        ) {
          // green
          stroke(`rgba(0,100,0,${lineOpacity})`)
          line(p0.x, p0.y, p1.x, p1.y)
        } else if (
          delay > 10 &&
          delay <= 30 &&
          lessThan30FlightsCheckbox.checked
        ) {
          // violet
          stroke(`rgba(155,38,182,${lineOpacity})`)
          line(p0.x, p0.y, p1.x, p1.y)
        } else if (
          delay > 30 &&
          delay <= 60 &&
          lessThan60FlightsCheckbox.checked
        ) {
          // orange
          stroke(`rgba(255,165,0,${lineOpacity})`)
          line(p0.x, p0.y, p1.x, p1.y)
        } else if (delay > 60 && moreThan60FlightsCheckbox.checked) {
          // red
          stroke(`rgba(255,0,0,${lineOpacity})`)
          line(p0.x, p0.y, p1.x, p1.y)
        }
      } catch (_) {}
    }
  }
}
