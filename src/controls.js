import React, { Component } from 'react';
import { mapStylePicker, layerControl, dataControl, button } from './style';

export const LAYER_CONTROLS = {
  showHexagon: {
    displayName: 'Показать сетку',
    type: 'boolean',
    value: true
  },
  showDistricts: {
    displayName: 'Показать в границах АТД',
    type: 'boolean',
    value: false
  },
  showBasins: {
    displayName: 'Показать в границах бассейнов',
    type: 'boolean',
    value: false
  },
  extruded: {
    displayName: 'Использовать 3D',
    type: 'boolean',
    value: false
  },
  // coverage: {
  //   displayName: 'Покрытие',
  //   type: 'range',
  //   value: 0.8,
  //   step: 0.1,
  //   min: 0.5,
  //   max: 1
  // },
  // upperPercentile: {
  //   displayName: 'Верхний процентиль',
  //   type: 'range',
  //   value: 100,
  //   step: 0.1,
  //   min: 80,
  //   max: 100
  // },
  lowerPercentile: {
    displayName: 'Нижний процентиль',
    type: 'range',
    value: 0,
    step: 1,
    min: 0,
    max: 90
  },
  radius: {
    displayName: 'Радиус шестиугольника, м',
    type: 'range',
    value: 100000,
    step: 1000,
    min: 10000,
    max: 200000,
    disabled: true
  }
};

const MAPBOX_DEFAULT_MAPSTYLES = [
  { label: 'Нейтральный', value: 'mapbox://styles/ghermant/ckal892fp0r5h1ipvth50w0eh' },
  { label: 'Светлый', value: 'mapbox://styles/mapbox/light-v9' },
  { label: 'Тёмный', value: 'mapbox://styles/mapbox/dark-v9' },
  { label: 'Спутник', value: 'mapbox://styles/mapbox/satellite-v9' },
  { label: 'Гибрид', value: 'mapbox://styles/mapbox/satellite-streets-v10' },
];

export function MapStylePicker({ currentStyle, onStyleChange }) {
  return (
    <select
      className="map-style-picker"
      style={mapStylePicker}
      value={currentStyle}
      onChange={e => onStyleChange(e.target.value)}
    >
      {MAPBOX_DEFAULT_MAPSTYLES.map(style => (
        <option key={style.value} value={style.value}>
          {style.label}
        </option>
      ))}
    </select>
  );
}

export function DataControls({ 
  avaliableYears, 
  onYearChange, 
  onButtonClick, 
  selectedTimeType, 
  handleOptionChange,
  periodStart,
  periodEnd,
  onPeriodChange
}) {

  const startYears = avaliableYears.filter(year => (year < periodEnd))
  const endYears = avaliableYears.filter(year => (year > periodStart))

  return (
    <div className="data-controls" style={dataControl}>
      <div className="time-type">
        <p>
          <input 
            name="time"
            type="radio"
            value="climat"
            checked={selectedTimeType === "climat"}
            onChange={event => handleOptionChange(event.target.value)}
          />
          Климатические данные
        </p>
        <button
          style={button}
          onClick={() => onButtonClick()}
          disabled={!(selectedTimeType === "climat")}
        >
          запрос
        </button>
      </div>

      <div className="time-type">
        <p>
          <input
            name="time"
            type="radio"
            value="year"
            checked={selectedTimeType === "year"}
            onChange={event => handleOptionChange(event.target.value)}
          />
          Ежегодные данные
        </p>
        <button
          style={button}
          onClick={() => onButtonClick()}
          disabled={!(selectedTimeType === "year")}
        >
          запрос
        </button>
        <select
          className="yearPicker"
          onChange={event => onYearChange(event.target.value)}
          disabled={!(selectedTimeType === "year")}
        >
          {
            avaliableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          }
        </select>
      </div>

      <div className="time-type">
        <p>
          <input
            name="time"
            type="radio"
            value="period"
            checked={selectedTimeType === "period"}
            onChange={event => handleOptionChange(event.target.value)}
          />
          Данные, осреднённые за период
        </p>
        <button
          style={button}
          onClick={() => onButtonClick()}
          disabled={!(selectedTimeType === "period")}
        >
          запрос
        </button>
        <select
          className="yearPicker"
          onChange={event => onPeriodChange(event.target.value, true)}  // second parameter isStart
          disabled={!(selectedTimeType === "period")}
        >
          {
            
            startYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          }
        </select>
        <select
          className="yearPicker"
          onChange={event => onPeriodChange(event.target.value, false)}  // second parameter isStart
          disabled={!(selectedTimeType === "period")}
        >
          {
            endYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          }
        </select>
      </div>
      
      
      
    </div>
  );
}

export class LayerControls extends Component {
  _onValueChange(settingName, newValue) {
    const { settings } = this.props;
    // Only update if we have a confirmed change
    if (settings[settingName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newSettings = {
        ...this.props.settings,
        [settingName]: newValue
      };

      this.props.onChange(newSettings);
    }
  }

  render() {
    const { title, settings, propTypes = {} } = this.props;

    return (
      <div className="layer-controls" style={layerControl}>
        {title && <h4>{title}</h4>}
        {Object.keys(settings).map(key => (
          <div key={key}>
            <label>{propTypes[key].displayName}</label>
            <div style={{ display: 'inline-block', float: 'right' }}>
              {settings[key]}
            </div>
            <Setting
              settingName={key}
              value={settings[key]}
              propType={propTypes[key]}
              onChange={this._onValueChange.bind(this)}
            />
          </div>
        ))}
      </div>
    );
  }
}

const Setting = props => {
  const { propType } = props;
  if (propType && propType.type) {
    switch (propType.type) {
      case 'range':
        return <Slider {...props} />;
      case 'boolean':
        return <Checkbox {...props} />;
      default:
        return <input {...props} />;
    }
  }
};

const Checkbox = ({ settingName, value, onChange }) => {
  return (
    <div key={settingName}>
      <div className="input-group">
        <input
          type="checkbox"
          id={settingName}
          checked={value}
          onChange={e => onChange(settingName, e.target.checked)}
        />
      </div>
    </div>
  );
};

const Slider = ({ settingName, value, propType, onChange }) => {
  const { max = 100 } = propType;
  const { min } = propType;
  const { step } = propType;
  const { disabled } = propType;
  return (
    <div key={settingName}>
      <div className="input-group">
        <div>
          <input
            type="range"
            id={settingName}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={e => onChange(settingName, Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
