import React from 'react';
import { legend } from './style';




export function Legend({ 
    polygonBreaks,
    polygonColors, 
    hexagonColors,
    districtsDomain,
    basinsDomain,
    hexagonDomain,
    settings
}) {
    const getPolygonLegendData = (domain, breaks) => {
        const innerBreaks = breaks.filter(element => element >= domain[0] && element <= domain[1])
        // Выбираем цвета, соответствующие текущим границам 
        // Фиксируем индексы граничных значений
        const innerBreaksIndex = innerBreaks.map(element => breaks.indexOf(element))
        // Цветов должно быть на один больше, чем внутренних граничных значений 
        const colorIndex = [...innerBreaksIndex, innerBreaksIndex[innerBreaksIndex.length - 1] + 1]
        // Используем reverse, чтобы начинать с больших значений
        const legendColors = colorIndex.map(i => polygonColors[i]).reverse()

        const allBreaks = [domain[0], ...innerBreaks, domain[1]]
        const legendIntervals = []
        for(let i=0; i < allBreaks.length - 1; i++) {
            const interval = `${allBreaks[i + 1]}-${allBreaks[i]}`.replace(/\./g, ",")
            // Идём от меньших значений к большим, а большие должны быть в начале
            // Поэтому unshift, а не push
            legendIntervals.unshift(interval)
        }

        return {colors: legendColors, intervals: legendIntervals}
    }

    const getGridLegendData = (domain) => {
        // Копируем (...) hexagonColors, иначе reverse будет изменять исходный список
        const hexagonColorsReverse = [...hexagonColors].reverse()
        const intDomain = domain.map(value => Math.round((value * 100)))
        const delta = Math.round((intDomain[1] - intDomain[0]) / 6)
        let intBreaks = [intDomain[0]]
        for(let i=0; i < 5; i++) {
            intBreaks.push(intBreaks[i] + delta)
        }
        intBreaks.push(intDomain[1])
        const currentBreaks = intBreaks.map(value => value / 100)

        const legendIntervals = []

        for(let i=0; i < currentBreaks.length - 1; i++) {
            const interval = `${currentBreaks[i + 1]}-${currentBreaks[i]}`.replace(/\./g, ",")
            // Идём от меньших значений к большим, а большие должны быть в начале
            // Поэтому unshift, а не push
            legendIntervals.unshift(interval)
        }
        // Используем reverse, чтобы начинать с больших значений
        return {colors: hexagonColorsReverse, intervals: legendIntervals}
    }

    const legendElement = (legendData, layer) => {
        return(
            <table>
                <thead>
                    <tr>
                        <th style={{fontWeight: "normal"}}>
                            {layer}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {legendData.intervals.map((interval, i) => {
                            return(
                                <th 
                                    key={i}
                                    width={"60px"}
                                    style={{fontWeight: "normal"}}
                                >{interval}
                                </th>
                            )
                        })}
                    </tr>
                    <tr>
                        {legendData.colors.map((color, i) => {
                            return(
                                <th 
                                    key={i}
                                    style={{backgroundColor: `rgb(${color.toString()}`}}
                                    height={"10px"}
                                >
                                </th>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
        )
    }

    const districtsBreaks = getPolygonLegendData(districtsDomain, polygonBreaks)
    const basinsBreaks = getPolygonLegendData(basinsDomain, polygonBreaks)
    const hexagonBreaks = getGridLegendData(hexagonDomain)


    return (
        <div className="legend" style={legend}>
            <p style={{fontWeight: "bold"}}>
                Среднее поступление солнечной радиации на горизонтальную поверхность с учётом облачности
                <span> [кВт * ч/м<sup>2</sup> в день]</span>
            </p>
            
            {settings.showHexagon ? legendElement(hexagonBreaks, "Cетка") : null}
            {settings.showDistricts ? legendElement(districtsBreaks, "Районы") : null}
            {settings.showBasins ? legendElement(basinsBreaks, "Бассейны") : null}
        </div>
    );
}