import {
  HexagonLayer,
  GeoJsonLayer
} from 'deck.gl';

export function renderLayers({
  grid,
  districts,
  basins,
  onHover,
  settings,
  polygonColors,
  polygonBreaks,
  hexagonColors,
  onSetColorDomain
}) {
  const districtsLayer = settings.showDistricts && new GeoJsonLayer({
    id: 'geojson-districts',
    pickable: true,
    stroked: true,
    data: districts,
    getFillColor: feature => {
      const value = feature.properties.value
      // проходим по всем breaks - их на один меньше, чем colors
      for (let i = 0; i < polygonBreaks.length; i++) {
        if (value < polygonBreaks[i]) {
          return polygonColors[i]
        }
      }
      // если значение больше последнего в polygonBreaks, то берём последний цвет
      return polygonColors[polygonColors.length - 1]
    },
    getLineColor: [255, 255, 255],
    getLineWidth: 5000,
    getElevation: feature => feature.properties.value ** 3,
    elevationScale: 10000,
    onHover,
    ...settings
  })

  const basinsLayer = settings.showBasins && new GeoJsonLayer({
    id: 'geojson-basins',
    pickable: true,
    stroked: true,
    data: basins,
    getFillColor: feature => {
      const value = feature.properties.value
      for (let i = 0; i < polygonBreaks.length; i++) {
        if (value < polygonBreaks[i]) {
          return polygonColors[i]
        }
      }
      // if (value > polygonBreaks.length - 1)  // это очевидно из предыдущего
      return polygonColors[polygonColors.length - 1]
    },
    getLineColor: [255, 255, 255],
    getLineWidth: 5000,
    getElevation: feature => feature.properties.value ** 3,
    elevationScale: 10000,
    onHover,
    ...settings
  })

  const hexagonLayer = settings.showHexagon && new HexagonLayer({
    id: 'hexagon-layer',
    pickable: true,
    coverage: 0.8,
    getPosition: node => node.position,
    colorRange: hexagonColors,
    getColorValue: nodes => { // чтобы использовать аппаратное ускорение, надо переписать через getColorWeight, colorAggregation
      const sumValue = nodes.reduce((sum, {
        value
      }) => sum + value, 0) // {value} это ключ значения в объекте nodes, 0 - стартовое значение sum
      const avgValue = sumValue / nodes.length
      const avgValueRound = Math.round(avgValue * 100) / 100 // 100 даёт два знака после запятой
      return avgValueRound
    },
    getElevationValue: nodes => {
      const sumValue = nodes.reduce((sum, {
        value
      }) => sum + value, 0) // {value} это ключ значения в объекте nodes, 0 - стартовое значение sum
      const avgValue = sumValue / nodes.length
      const avgValueRound = Math.round(avgValue * 100) / 100 // 100 даёт два знака после запятой
      return avgValueRound
    },
    elevationScale: 500,
    onSetColorDomain,
    data: grid,
    onHover,
    ...settings
  })

  return [districtsLayer, basinsLayer, hexagonLayer];
}
