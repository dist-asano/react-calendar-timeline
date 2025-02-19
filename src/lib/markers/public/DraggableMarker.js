import React from 'react'
import PropTypes from 'prop-types'
import { TimelineMarkersConsumer } from '../TimelineMarkersContext'
import { TimelineMarkerType } from '../markerType'
import { CustomMarker } from "./CustomMarker"

class DraggableMarker extends CustomMarker {
  static propTypes = {
    onDragStart: PropTypes.func,
    onDragging: PropTypes.func,
    onDragEnd: PropTypes.func,
    subscribeMarker: PropTypes.func.isRequired,
    updateMarker: PropTypes.func.isRequired,
    children: PropTypes.func,
    date: PropTypes.number.isRequired
  }

  componentDidMount() {
    const { unsubscribe, getMarker } = this.props.subscribeMarker({
      onDragStart: this.props.onDragStart,
      onDragging: this.props.onDragging,
      onDragEnd: this.props.onDragEnd,
      type: TimelineMarkerType.Draggable,
      renderer: this.props.children,
      date: this.props.date
    })
    this.unsubscribe = unsubscribe
    this.getMarker = getMarker
  }
}

// TODO: turn into HOC?
const DraggableMarkerWrapper = props => {
  return (
    <TimelineMarkersConsumer>
      {({ subscribeMarker, updateMarker }) => (
        <DraggableMarker
          subscribeMarker={subscribeMarker}
          updateMarker={updateMarker}
          {...props}
        />
      )}
    </TimelineMarkersConsumer>
  )
}

DraggableMarkerWrapper.displayName = 'DraggableMarkerWrapper'

export default DraggableMarkerWrapper
