import React from "react";
import { charts } from "./style";

import { VerticalBarSeries, XAxis, XYPlot, YAxis } from "react-vis";

export default function Charts({ 
  months,
  highlightedMonth,
  highlight,
  selectedMonth,
  select
}) {
  const data = months.map(d => {
    let color = '#125C77';
    if (d.x === highlightedMonth) {  // x это месяц, потому что он на оси x
      color = '#17B8BE';
    }
    if (d.x === selectedMonth) {  // x это месяц, потому что он на оси x
      color = '#1FF4FF';
    }
    return{...d, color};
  });

  return (
    <div style={charts}>
      <h2>Суммарная инсоляция с учётом облачности</h2>
      <p>чтобы очистить выборку, щёлкните на месяц повторно</p>
      {/* xType="ordinal" for string in x */}
      <XYPlot 
        margin={{ left: 60, right: 25, top: 10, bottom: 25 }}
        height={140} 
        width={480} 
        xType="ordinal"
      >
        <XAxis />
        <YAxis 
          title="мВт * ч на кв. м"
        />
        <VerticalBarSeries
          colorType="literal" 
          data={data}
          onValueMouseOver={d => highlight(d.x)}  // x это месяц, потому что он на оси x
          onValueMouseOut={() => highlight(null)}
          onValueClick={d => select(d.x)}  // x это месяц, потому что он на оси x
          style={{ cursor: 'pointer' }}
        />
      </XYPlot>
    </div>
  );
}
