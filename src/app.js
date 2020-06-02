import React, { Component } from 'react';
import DeckGL from 'deck.gl';
import { StaticMap } from 'react-map-gl';
import { MapStylePicker, LayerControls, LAYER_CONTROLS, DataControls } from './controls';
import { renderLayers } from './deckgl-layers';
import { tooltipStyle } from './style';
import Charts from './charts';
import { Legend } from './legend';


const INITIAL_VIEW_STATE = {
  longitude: 125,
  latitude: 65,
  zoom: 2,
  minZoom: 1,
  maxZoom: 6,
  pitch: 0,
  bearing: 0
};

// length of zoomRadius must be equal to maxZoom - minZoom + 1
const zoomRadius = [200000, 100000, 50000, 25000, 10000, 10000]

const baseURL = "http://autolab.geogr.msu.ru/solarsaha"

export default class App extends Component {
  state = {
    hover: {
      x: 0,
      y: 0,
      hoveredObject: null
    },
    grid: [],
    yearGrid: [],
    districts: [],
    yearDistricts: [],
    basins: [],
    yearBasins: [],
    months: [],
    highlightedMonth: null,
    selectedMonth: null,
    whatData: "climat",
    years: [],
    selectedYear: null,
    periodStart: null,
    periodEnd: null,
    selectedTimeType: "climat",
    polygonColors: [[0, 0, 4], [15, 0, 27], [31, 0, 50], [47, 0, 73], [63, 0, 96], [83, 10, 118], [120, 63, 134], [158, 116, 149], [195, 169, 165], [232, 223, 181], [255, 255, 177], [255, 255, 144], [255, 255, 111], [255, 255, 78], [255, 255, 45], [255, 233, 28], [255, 198, 21], [255, 162, 14], [255, 127, 8], [255, 92, 1], [240, 70, 0], [222, 53, 0], [204, 35, 0], [186, 17, 0], [168, 0, 0]],
    polygonBreaks: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6],
    hexagonColors: [[255,255,178], [254,217,118], [254,178,76], [253,141,60], [240,59,32], [189,0,38]],
    hexagonDomain: [],
    districtsDomain: [],
    basinsDomain: [],
    colorValueDomain: [],  // newColorDomain !== this.state.colorDomain ? newLegend : oldLegend
    settings: Object.keys(LAYER_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: LAYER_CONTROLS[key].value
      }),
      {}
    ),
    style: 'mapbox://styles/ghermant/ckal892fp0r5h1ipvth50w0eh'
  };


  componentDidMount() {
    this.getYears();
    this.getData();
  }



  minMax = array => [Math.min(...array), Math.max(...array)]

  getYears = () => {
    fetch(`${baseURL}/years`)
      .then(response => response.json())
      .then(json => this.setState({ 
        years: json,
        selectedYear: json[0],
        periodStart: json[0],
        periodEnd: json[1]
      }));
  }

  getData = () => {
    fetch(`${baseURL}/grid/climat/ann`)
      .then(response => response.json())
      .then(json => this.setState({ grid: json, yearGrid: json }))  

    fetch(`${baseURL}/districts/climat/ann`)
      .then(response => response.json())
      .then(json => this.setState({ 
        districts: json, 
        yearDistricts: json,
        districtsDomain: this.minMax(json.map(elem => elem.properties.value))
      }))

    fetch(`${baseURL}/basins/climat/ann`)
      .then(response => response.json())
      .then(json => this.setState({ 
        basins: json, 
        yearBasins: json,
        basinsDomain: this.minMax(json.map(elem => elem.properties.value))
      }));
    
    fetch(`${baseURL}/graph/climat`)
      .then(response => response.json())
      .then(json => this.setState({ months: json }));
  };

  getValues = (whatData) => {
    let yearGridValues
    fetch(`${baseURL}/grid/${whatData}/ann/values`)
      .then(response => response.json())
      .then(json => yearGridValues = json)
      .then(() => {
        const currentGrid = this.state.grid
        const newGrid = []
        for(let i = 0; i < yearGridValues.length; i++) {
          let node = {}
          node.position = currentGrid[i].position
          node.value = yearGridValues[i]
          newGrid.push(node)
        }
        this.setState({ grid: newGrid, yearGrid: newGrid })
      })

    let yearDistrictsValues
    let currentDistricts
    const newDistricts = []
    fetch(`${baseURL}/districts/${whatData}/ann/values`)
      .then(response => response.json())
      .then(json => yearDistrictsValues = json)
      .then(() => currentDistricts = this.state.districts)
      .then(() => {
        for(let i = 0; i < yearDistrictsValues.length; i++) {
          let district = yearDistrictsValues[i]
          district.geometry = currentDistricts[i].geometry
          newDistricts.push(district)
        }
        this.setState({ 
          districts: newDistricts, 
          yearDistricts: newDistricts,
          districtsDomain: this.minMax(newDistricts.map(elem => elem.properties.value))
        })
      })
        

      let yearBasinsValues
      fetch(`${baseURL}/basins/${whatData}/ann/values`)
        .then(response => response.json())
        .then(json => yearBasinsValues = json)
        .then(() => {
          const currentBasins = this.state.basins
          const newBasins = []
          for(let i = 0; i < yearBasinsValues.length; i++) {
            let basin = yearBasinsValues[i]
            basin.geometry = currentBasins[i].geometry
            newBasins.push(basin)
          }
          this.setState({ 
            basins: newBasins,
            yearBasins: newBasins,
            basinsDomain: this.minMax(newBasins.map(elem => elem.properties.value))
          })
        })
    
    fetch(`${baseURL}/graph/${whatData}`)
      .then(response => response.json())
      .then(json => this.setState({ months: json }));
  };

  onStyleChange = style => {
    this.setState({ style });
  };

  handleOptionChange = timeType => {
    this.setState({ selectedTimeType: timeType })
  }

  onYearChange = year => {
    this.setState({ selectedYear: year })
  }

  onPeriodChange = (year, isStart) => {
    if (isStart) {
      this.setState({ periodStart: year })
    } else {
      this.setState({ periodEnd: year })
    }
  }

  onButtonClick = () => {
    const timeType = this.state.selectedTimeType
    let whatData
    if(timeType === "climat") {
      whatData = "climat"
    } else if(timeType === "year") {
      whatData = `year/${this.state.selectedYear}`
    } else if(timeType === "period") {
      whatData = `period/${this.state.periodStart}/${this.state.periodEnd}`
    }

    this.setState({ selectedMonth: null })
    this.getValues(whatData)
    this.setState({ whatData: whatData })
  }

  _onSetColorDomain(newHexagonDomain) {
    const currentHexagonDomain = this.state.hexagonDomain
    if(currentHexagonDomain[0] !== newHexagonDomain[0] || currentHexagonDomain[1] !== newHexagonDomain[1]) {
      this.setState({ hexagonDomain: newHexagonDomain })
    }
  }

  _updateLayerSettings(newSettings) {
    this.setState({ settings: newSettings });
  }

  _onHover({ x, y, object }) {
    let label
    if(object) {
      if(object.colorValue) {
        label = `${object.colorValue} кВт*ч/кв. м`
      } else {  // if object.properties.value
        label = `${object.properties.name} ${object.properties.value} кВт*ч/кв. м`
      }
    } else {
      label = null
    }
    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }

  _onHighlight(newHighlightedMonth) {
    this.setState({ highlightedMonth: newHighlightedMonth });
  }

  _onSelect(newSelectedMonth) {
    this.setState({
      // если щелчок на уже выбранный месяц, то выбранный месяц обнуляется
      selectedMonth: newSelectedMonth === this.state.selectedMonth ? null : newSelectedMonth
    });

    // если щелчок на уже выбранный месяц, то выводятся годовые показатели
    if(newSelectedMonth === this.state.selectedMonth) {
      this.setState({ grid: this.state.yearGrid })
      this.setState({ 
        districts: this.state.yearDistricts,
        districtsDomain: this.minMax(this.state.yearDistricts.map(elem => elem.properties.value))
      })
      this.setState({ 
        basins: this.state.yearBasins,
        basinsDomain: this.minMax(this.state.yearBasins.map(elem => elem.properties.value))
      })
    } else {
      let gridValues
      fetch(`${baseURL}/grid/${this.state.whatData}/${newSelectedMonth}/values`)
        .then(response => response.json())
        .then(json => gridValues = json)
        .then(() => {
          const currentGrid = this.state.grid
          const newGrid = []
          for(let i = 0; i < gridValues.length; i++) {
            let node = {}
            node.position = currentGrid[i].position
            node.value = gridValues[i]
            newGrid.push(node)
          }
          this.setState({ grid: newGrid })
        })

      let districtsValues
      fetch(`${baseURL}/districts/${this.state.whatData}/${newSelectedMonth}/values`)
        .then(response => response.json())
        .then(json => districtsValues = json)
        .then(() => {
          const currentDistricts = this.state.districts
          const newDistricts = []
          for(let i = 0; i < districtsValues.length; i++) {
            let district = districtsValues[i]
            district.geometry = currentDistricts[i].geometry
            newDistricts.push(district)
          }
          this.setState({ 
            districts: newDistricts,
            districtsDomain: this.minMax(newDistricts.map(elem => elem.properties.value))
          })
        })

      let basinsValues
      fetch(`${baseURL}/basins/${this.state.whatData}/${newSelectedMonth}/values`)
        .then(response => response.json())
        .then(json => basinsValues = json)
        .then(() => {
          const currentBasins = this.state.basins
          const newBasins = []
          for(let i = 0; i < basinsValues.length; i++) {
            let basin = basinsValues[i]
            basin.geometry = currentBasins[i].geometry
            newBasins.push(basin)
          }
          this.setState({ 
            basins: newBasins,
            basinsDomain: this.minMax(newBasins.map(elem => elem.properties.value))
          })
        })
    }
  }


  render() {
    if(!this.state.grid.length) {
      return null;
    }
    const hover = this.state.hover;

    return (
      <div>
        {hover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hover.x}px, ${hover.y}px)`
            }}
          >
            <div>{hover.label}</div>
          </div>
        )}
        <MapStylePicker
          onStyleChange={this.onStyleChange}
          currentStyle={this.state.style}
        />
        <DataControls
          avaliableYears={this.state.years}
          onYearChange={this.onYearChange}
          onButtonClick={this.onButtonClick}
          selectedTimeType={this.state.selectedTimeType}
          handleOptionChange={this.handleOptionChange}
          periodStart={this.state.periodStart}
          periodEnd={this.state.periodEnd}
          onPeriodChange={this.onPeriodChange}
        />
        <LayerControls
          settings={this.state.settings}
          propTypes={LAYER_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />
        <Legend
          polygonBreaks={this.state.polygonBreaks}
          polygonColors={this.state.polygonColors}
          hexagonColors={this.state.hexagonColors}
          districtsDomain={this.state.districtsDomain}
          basinsDomain={this.state.basinsDomain}
          hexagonDomain={this.state.hexagonDomain}
          settings={this.state.settings}
        />
        <DeckGL 
          layers={
            renderLayers({
                grid: this.state.grid,
                districts: this.state.districts,
                basins: this.state.basins,
                month: this.state.selectedMonth,
                onHover: hover => this._onHover(hover),
                settings: this.state.settings,
                polygonColors: this.state.polygonColors,
                polygonBreaks: this.state.polygonBreaks,
                hexagonColors: this.state.hexagonColors,
                onSetColorDomain: colorDomain => this._onSetColorDomain(colorDomain)
            })
          }
          initialViewState={ INITIAL_VIEW_STATE }
          controller={ true }
          onViewStateChange={
            ({viewState, oldViewState}) => {  // функиция изменения детальности с изменением зума
              const currentZoom = Math.floor(viewState.zoom)
              const oldZoom = Math.floor(oldViewState.zoom)
              if(currentZoom !== oldZoom) {
                const zoomIndex = currentZoom - INITIAL_VIEW_STATE.minZoom
                const newRadius = zoomRadius[zoomIndex]
                let newSettings = this.state.settings
                newSettings.radius = newRadius
                this._updateLayerSettings(newSettings)
              }
            }
          }
        >
          <StaticMap mapStyle={ this.state.style } />
        </DeckGL>
        <Charts
          months={ this.state.months }
          highlightedMonth={ this.state.highlightedMonth }
          highlight={ month => this._onHighlight(month) }
          selectedMonth={ this.state.selectedMonth }
          select={ month => this._onSelect(month)}
        />
      </div>
    );
  }
}
