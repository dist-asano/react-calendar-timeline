import React from 'react'
import PropTypes from 'prop-types'
import {
  createMarkerStylesWithLeftOffset,
  createDefaultRenderer
} from './shared'
import CustomMarker from "./CustomMarker"
import interact from 'interactjs'

const defaultStyles = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "4px",
  backgroundColor: "black",
  cursor: "pointer",
  pointerEvents: "all"
}

const defaultDraggableMarkerRenderer = createDefaultRenderer(
  'default-draggable-marker-id'
)
/**
 * DraggableMarker
 */
class DraggableMarker extends CustomMarker {
  static propTypes = {
    getDragStart: PropTypes.func,
    getDragging: PropTypes.func,
    getDragEnd: PropTypes.func,
    getDateFromLeftOffsetPosition: PropTypes.func,
    getLeftOffsetFromDate: PropTypes.func.isRequired,
    renderer: PropTypes.func,
    date: PropTypes.number.isRequired
  }

  static defaultProps = {
    renderer: defaultDraggableMarkerRenderer
  }

  constructor() {
    super()

    this.state = {
      date: 0,
      isDragging: false
    }
  }

  dragTime = (e) => {
    const { left: containerLeft } = this.markerEl.getBoundingClientRect()
    const canvasX = e.pageX - containerLeft
    const date = this.props.getDateFromLeftOffsetPosition(canvasX)
    return date
  }

  componentDidMount() {
    this.setState({date: this.props.date})
    
    if (this.markerEl) {
      interact(this.markerEl)
      .draggable({
        enabled: true
      })
      .on("dragstart", e => {
        const date = this.dragTime(e)
        this.setState({
          date,
          isDragging: true
        })
        if (this.props.onDragStart) {
          this.props.onDragStart(date)
        }
      })
      .on("dragmove", e => {
        if (this.state.isDragging) {
          const date = this.dragTime(e)
          this.setState({
            date,
            isDragging: true
          })
          if (this.props.onDragging) {
            this.props.onDragging(date)
          }
        }
      })
      .on("dragend", e => {
        if (this.state.isDragging) {
          const date = this.dragTime(e)
          this.setState({
            date,
            isDragging: false
          })
          if (this.props.onDragEnd) {
            this.props.onDragEnd(date)
          }
        }
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.date !== this.props.date) {
      this.setState({ date: this.props.date })
    }
  }

  // divタグの下に重なっているカレンダー予定部へのクリックイベント伝播を止める
  onMouseDown = (e) => {
    e.stopPropagation()
  }

  // ドラッグ中にdivタグからカーソルが外したとしても、移動が続くようにするための処置
  onPointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
  }
  onPointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
  }

  getMarkerRef = (el) => {
    this.markerEl = el
  }

  render() {
    const {date, isDragging} = this.state

    const leftOffset = this.props.getLeftOffsetFromDate(date)
    const styles = createMarkerStylesWithLeftOffset(leftOffset)

    return (
      <div ref={this.getMarkerRef} style={{userSelect:"none"}} onMouseDown={this.onMouseDown} onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp}>
        {
          this.props.renderer({
            styles: {...styles, ...defaultStyles},
            date,
            isDragging
          })
        }
      </div>
    )
  }
}

export default DraggableMarker
