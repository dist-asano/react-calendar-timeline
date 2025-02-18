import React from 'react'
import { TimelineMarkersConsumer } from './TimelineMarkersContext'
import { TimelineMarkerType } from './markerType'
import TodayMarker from './implementations/TodayMarker'
import CustomMarker from './implementations/CustomMarker'
import { TimelineStateConsumer } from '../timeline/TimelineStateContext'
import CursorMarker from './implementations/CursorMarker'
import DraggableMarker from './implementations/DraggableMarker'

/** Internal component used in timeline to render markers registered */
const TimelineMarkersRenderer = () => {
  return (
    <TimelineStateConsumer>
      {({ getLeftOffsetFromDate, getTimelineState, getDateFromLeftOffsetPosition }) => (
        <TimelineMarkersConsumer>
          {({ markers }) => {
            const timelineState = getTimelineState();
            return markers
              .map(marker => {
                switch (marker.type) {
                  case TimelineMarkerType.Today:
                    if(!( (new Date()).valueOf() >= timelineState.canvasTimeStart && (new Date()).valueOf() <= timelineState.canvasTimeEnd)) return null;
                    return (
                      <TodayMarker
                        key={marker.id}
                        getLeftOffsetFromDate={getLeftOffsetFromDate}
                        renderer={marker.renderer}
                        interval={marker.interval}
                      />
                    )
                  case TimelineMarkerType.Custom:
                    //filter out cursors outside canvas start/end
                    if(!(marker.date >= timelineState.canvasTimeStart && marker.date <= timelineState.canvasTimeEnd)) return null;
                    return (
                      <CustomMarker
                        key={marker.id}
                        renderer={marker.renderer}
                        date={marker.date}
                        getLeftOffsetFromDate={getLeftOffsetFromDate}
                      />
                    )
                  case TimelineMarkerType.Draggable:
                      if(!(marker.date >= timelineState.canvasTimeStart && marker.date <= timelineState.canvasTimeEnd)) return null;
                      return (
                        <DraggableMarker
                          key={marker.id}
                          renderer={marker.renderer}
                          date={marker.date}
                          onDragStart={marker.onDragStart}
                          onDragging={marker.onDragging}
                          onDragEnd={marker.onDragEnd}
                          getLeftOffsetFromDate={getLeftOffsetFromDate}
                          getDateFromLeftOffsetPosition={getDateFromLeftOffsetPosition}
                        />
                      )
                  case TimelineMarkerType.Cursor:
                    return (
                      <CursorMarker
                        key={marker.id}
                        renderer={marker.renderer}
                        getLeftOffsetFromDate={getLeftOffsetFromDate}
                      />
                    )
                  default:
                    return null
                }
              })
          }}
        </TimelineMarkersConsumer>
      )}
    </TimelineStateConsumer>
  )
}

export default TimelineMarkersRenderer
