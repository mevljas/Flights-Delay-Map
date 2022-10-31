function setupFlights() {
  // var delays = XLSX.readFile('./../assets/airplane_delays.csv')
  // var airports = XLSX.readFile('./../assets/us-airports.csv')
  loadAirports()
  // drawAirports()
}

function loadAirports() {
  airportsDict = {}
  for (let i = 0; i < airportsCSV.getRowCount(); i++) {
    const latitude = airportsCSV.getNum(i, 'LATITUDE')
    const longitude = airportsCSV.getNum(i, 'LONGITUDE')
    const code = airportsCSV.get(i, 'IATA')

    airportsDict[code] = {
      latitude: latitude,
      longitude: longitude
    }
  }
}

function drawAirports() {
  // Clear the canvas
  clear()

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
