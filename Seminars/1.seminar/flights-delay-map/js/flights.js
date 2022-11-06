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

function drawFlights() {
  clear()
  const lineOpacity = 0.5
  const selectedDate = new Date(dateTimePicker.value)
  const selectedDay = selectedDate.getDate()
  const selectedTime = selectedDate.toTimeString().substring(0, 5)
  for (let i = 0; i < flightsTable.getRowCount(); i++) {
    // Get the lat/lng of each flight
    const day = flightsTable.getNum(i, 'DAY')
    const departureTime = flightsTable.getString(i, 'CRS_DEP_TIME')
    const arrivalTime = flightsTable.getString(i, 'CRS_ARR_TIME')
    const origin = flightsTable.getString(i, 'ORIGIN')
    const destination = flightsTable.getString(i, 'DEST')
    const delay = flightsTable.getNum(i, 'ARR_DELAY')
    const originCoords = airportsDict[origin]
    const destinationCoords = airportsDict[destination]

    if (day > selectedDay) {
      break
    }

    if (day < selectedDay) {
      continue
    }

    // Check wheter the plaine is flying right now
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
          // green
          stroke(`rgba(0,255,0,${lineOpacity})`)
        } else if (delay <= 10 && lessThan10FlightsCheckbox.checked) {
          // yellow
          stroke(`rgba(255,255,0,${lineOpacity})`)
        } else if (delay <= 30 && lessThan30FlightsCheckbox.checked) {
          // orange
          stroke(`rgba(255,165,0,${lineOpacity})`)
        } else if (delay <= 60 && lessThan60FlightsCheckbox.checked) {
          // red
          stroke(`rgba(255,0,0,${lineOpacity})`)
        } else if (moreThan60FlightsCheckbox.checked) {
          // black
          stroke(`rgba(0,0,0,${lineOpacity})`)
        }
        line(p0.x, p0.y, p1.x, p1.y)
      } catch (_) {}
    }
  }
}
