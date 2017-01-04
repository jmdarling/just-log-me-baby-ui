import * as d3 from 'd3'
import 'whatwg-fetch'

let chartData = [
  {
    timestamp: '12:24:21',
    itemsInQueue: 30
  },
  {
    timestamp: '12:24:22',
    itemsInQueue: 34
  },
  {
    timestamp: '12:24:23',
    itemsInQueue: 12
  },
  {
    timestamp: '12:24:24',
    itemsInQueue: 49
  },
  {
    timestamp: '12:24:25',
    itemsInQueue: 2
  }
]

renderChart(chartData)


function renderChart (chartData) {
  const chartWrapperSelector = '#queued-items-chart'
  const chartWrapper = document.querySelector(chartWrapperSelector)
  const chartHeightPx = chartWrapper.scrollHeight
  const chartWidthPx = chartWrapper.scrollWidth
  const barHorizontalPaddingPx = 2

  // Remove old chart, so we can put in the new one.
  d3
  .select(chartWrapperSelector)
  .select('svg')
  .remove()

  const chart =
    d3
    .select(chartWrapperSelector)
      .append('svg')
        .attr('height', chartHeightPx + 'px')
        .attr('width', chartWidthPx + 'px')

  chart.selectAll('rect')
    .data(chartData)
    .enter()
    .append('rect')
      .attr('x', (dataPoint, index) => {
        return getXPx(index, chartWidthPx, chartData.length, barHorizontalPaddingPx) + 'px'
      })
      .attr('y', dataPoint => {
        return getYPx(chartHeightPx, dataPoint.itemsInQueue, chartData.reduce((currentMax, currentDataPoint) => {
          if (currentDataPoint.itemsInQueue > currentMax) {
            return currentDataPoint.itemsInQueue
          }

          return currentMax
        }, 0)) + 'px'
      })
      .attr('width', dataPoint => {
        return getBarWidthPx(chartWidthPx, chartData.length, barHorizontalPaddingPx) + 'px'
      })
      .attr('height', dataPoint => {
        return getBarHeightPx(dataPoint.itemsInQueue, chartData.reduce((currentMax, currentDataPoint) => {
          if (currentDataPoint.itemsInQueue > currentMax) {
            return currentDataPoint.itemsInQueue
          }

          return currentMax
        }, 0), chartHeightPx) + 'px'
      })
      .attr('fill', 'steelblue')

  chart.selectAll('text')
    .data(chartData)
    .enter()
    .append('text')
      .text(dataPoint => {
        return dataPoint.itemsInQueue
      })
      .attr('x', (dataPoint, index) => {
        return getXPx(index, chartWidthPx, chartData.length, barHorizontalPaddingPx) + 4 + 'px'
      })
      .attr('y', dataPoint => {
        return getYPx(chartHeightPx, dataPoint.itemsInQueue, chartData.reduce((currentMax, currentDataPoint) => {
          if (currentDataPoint.itemsInQueue > currentMax) {
            return currentDataPoint.itemsInQueue
          }

          return currentMax
        }, 0)) + 15 + 'px'
      })
}

function getBarWidthPx (containerWidthPx, numDataPoints, paddingPx) {
  return containerWidthPx / numDataPoints - paddingPx
}

function getBarHeightPx (heightPx, maxHeightPx, containerHeightPx) {
  return (containerHeightPx / maxHeightPx) * heightPx
}

function getXPx (index, containerWidthPx, numDataPoints, paddingPx) {
  return index * (getBarWidthPx(containerWidthPx, numDataPoints, paddingPx) + paddingPx)
}

function getYPx (containerHeightPx, heightPx, maxHeightPx) {
  return containerHeightPx - getBarHeightPx(heightPx, maxHeightPx, containerHeightPx)
}

setInterval(updateData, 1000)

function updateData () {
  window.fetch('http://localhost:8080/queue/length')
    .then(response => {
      return response.json()
    })
    .then(response => {
      const now = new Date()
      chartData = chartData.slice(-120).concat({
        timestamp: `${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}`,
        itemsInQueue: response.queueLength
      })
      renderChart(chartData)
    })
}
