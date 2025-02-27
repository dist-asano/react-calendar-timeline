import React from 'react'
import { render, fireEvent, cleanup } from 'react-testing-library'
import 'jest-dom/extend-expect'
import TimelineMarkers from 'lib/markers/public/TimelineMarkers'
import DraggableMarker from 'lib/markers/public/DraggableMarker'
import { RenderWrapper } from 'test-utility/marker-renderer'
import { TimelineStateConsumer } from 'lib/timeline/TimelineStateContext'

describe('DraggableMarker', () => {
  afterEach(cleanup)
  const defaultDraggableMarkerTestId = 'default-draggable-marker-id'
  it('renders one', () => {
    const { getByTestId } = render(
      <RenderWrapper>
        <TimelineStateConsumer>
          {({ getTimelineState }) => {
            const { canvasTimeStart } = getTimelineState();
            return (
              <TimelineMarkers>
                <DraggableMarker date={canvasTimeStart + 100} />
              </TimelineMarkers>
            )
          }}
        </TimelineStateConsumer>
      </RenderWrapper>
    )

    expect(getByTestId(defaultDraggableMarkerTestId)).toBeInTheDocument()
  })
  it('render multiple', () => {
    const { queryAllByTestId } = render(
      <RenderWrapper>
        <TimelineStateConsumer>
          {({ getTimelineState }) => {
            const { canvasTimeStart } = getTimelineState();
            return (
              <TimelineMarkers>
                <DraggableMarker date={canvasTimeStart + 100} />
                <DraggableMarker date={canvasTimeStart + 101} />
                <DraggableMarker date={canvasTimeStart + 102} />
              </TimelineMarkers>
            )
          }}
        </TimelineStateConsumer>
      </RenderWrapper>
    )

    expect(queryAllByTestId(defaultDraggableMarkerTestId).length).toBe(3)
  })
  it('renders with custom renderer', () => {
    const customDataIdSelector = 'my-draggable-marker'
    const { getByTestId } = render(
      <RenderWrapper>
        <TimelineStateConsumer>
          {({ getTimelineState }) => {
            const { canvasTimeStart } = getTimelineState();
            return (
              <TimelineMarkers>
                <DraggableMarker date={canvasTimeStart + 100}>
                  {() => <div data-testid={customDataIdSelector} />}
                </DraggableMarker>
              </TimelineMarkers>
            )
          }}
        </TimelineStateConsumer>
      </RenderWrapper>
    )

    expect(getByTestId(customDataIdSelector)).toBeInTheDocument()
  })

  it('is passed styles with left corresponding to passed in date', () => {
    const oneDay = 1000 * 60 * 60 * 24
    const canvasWidth = 3000

    const now = Date.now()

    /**
     * CanvasTimeStart - one day ago
     * VisibleTimeStart - now
     * VisibleTimeEnd - one day in future
     * CanvasTimeEnd - two days in the future
     */

    const visibleTimeStart = now
    const visibleTimeEnd = now + oneDay
    const timelineState = {
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart: visibleTimeStart - oneDay,
      canvasTimeEnd: visibleTimeEnd + oneDay,
      canvasWidth,
      showPeriod: () => { },
      timelineWidth: 1000,
      timelineUnit: 'day'
    }

    const markerDate = now + oneDay / 2

    const { getByTestId } = render(
      <RenderWrapper timelineState={timelineState}>
        <TimelineMarkers>
          <DraggableMarker date={markerDate} />
        </TimelineMarkers>
      </RenderWrapper>
    )

    const el = getByTestId(defaultDraggableMarkerTestId)

    expect(el).toHaveStyle(`left: ${3000 / 2}px`)
  })

  it('is removed after unmount', () => {
    class RemoveDraggableMarker extends React.Component {
      state = {
        isShowing: true
      }
      handleToggleDraggableMarker = () => {
        this.setState({
          isShowing: false
        })
      }
      render() {
        return (
          <RenderWrapper>
            <TimelineStateConsumer>
              {({ getTimelineState }) => {
                const { canvasTimeStart } = getTimelineState();
                return (
                  <React.Fragment>
                    <button onClick={this.handleToggleDraggableMarker}>
                      Hide Draggable Marker
                    </button>
                    <TimelineMarkers>
                      {this.state.isShowing && <DraggableMarker date={canvasTimeStart + 100} />}
                    </TimelineMarkers>
                  </React.Fragment>
                )
              }}</TimelineStateConsumer>
          </RenderWrapper>
        )
      }
    }

    const { queryByTestId, getByText } = render(<RemoveDraggableMarker />)

    expect(queryByTestId(defaultDraggableMarkerTestId)).toBeInTheDocument()

    fireEvent.click(getByText('Hide Draggable Marker'))

    expect(queryByTestId(defaultDraggableMarkerTestId)).not.toBeInTheDocument()
  })
  it('updates marker location after passing new date', () => {
    const { getByTestId, rerender } = render(
      <RenderWrapper>
        <TimelineStateConsumer>
          {({ getTimelineState }) => {
            const { canvasTimeStart } = getTimelineState();
            return (
              <TimelineMarkers>
                <DraggableMarker date={canvasTimeStart + 1000} />
              </TimelineMarkers>
            )
          }}</TimelineStateConsumer>
      </RenderWrapper>)
    const positionLeftBeforeChange = getByTestId(defaultDraggableMarkerTestId).style.left
    rerender(<RenderWrapper>
      <TimelineStateConsumer>
        {({ getTimelineState }) => {
          const { canvasTimeStart } = getTimelineState();
          return (
            <TimelineMarkers>
              <DraggableMarker date={canvasTimeStart + 2000} />
            </TimelineMarkers>
          )
        }}</TimelineStateConsumer>
    </RenderWrapper>)
    const positionLeftAfterChange = getByTestId(defaultDraggableMarkerTestId).style.left
    expect(positionLeftBeforeChange).not.toEqual(positionLeftAfterChange)
  })
  it('should not render marker outside canvas', () => {
    const { queryByTestId } = render(
      <RenderWrapper>
        <TimelineStateConsumer>
          {({ getTimelineState }) => {
            const { canvasTimeEnd } = getTimelineState();
            return (
              <TimelineMarkers>
                <DraggableMarker date={canvasTimeEnd + 100} />
              </TimelineMarkers>
            )
          }}
        </TimelineStateConsumer>
      </RenderWrapper>
    )

    expect(queryByTestId(defaultDraggableMarkerTestId)).not.toBeInTheDocument()
  })
})
