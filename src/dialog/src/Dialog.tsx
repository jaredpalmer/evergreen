import { css } from 'ui-box'
import * as PropTypes from 'prop-types'
import * as React from 'react'

import { Button, IconButton } from '../../buttons'
import { IntentType } from '../../constants'
import { Pane } from '../../layers'
import { Overlay } from '../../overlay'
import { withTheme, PropsWithTheme } from '../../theme'
import { Paragraph, Heading } from '../../typography'

interface DialogProps {
  /**
   * Children can be a string, node or a function accepting `({ close })`.
   * When passing a string, <Paragraph /> is used to wrap the string.
   */
  children: React.ReactNode

  // The intent of the Dialog. Used for the button.
  intent?: IntentType

  // When true, the dialog is shown.
  isShown?: boolean

  // Title of the Dialog. Titles should use Title Case.
  title?: React.ReactNode

  // When true, the header with the title and close icon button is shown.
  hasHeader?: boolean

  // When true, the footer with the cancel and confirm button is shown.
  hasFooter?: boolean

  // When true, the cancel button is shown.
  hasCancel?: boolean

  // When true, the close button is shown
  hasClose?: boolean

  // Function that will be called when the exit transition is complete.
  onCloseComplete?: (...args: any[]) => any

  // Function that will be called when the enter transition is complete.
  onOpenComplete?: (...args: any[]) => any

  /**
   * Function that will be called when the confirm button is clicked.
   * This does not close the Dialog. A close function will be passed
   * as a paramater you can use to close the dialog.
   *
   * `onConfirm={(close) => close()}`
   */
  onConfirm?: (...args: any[]) => any

  // Label of the confirm button.
  confirmLabel?: string

  // When true, the confirm button is set to loading.
  isConfirmLoading?: boolean

  // When true, the confirm button is set to disabled.
  isConfirmDisabled?: boolean

  /**
   * Function that will be called when the cancel button is clicked.
   * This closes the Dialog by default.
   *
   * `onCancel={(close) => close()}`
   */
  onCancel?: (...args: any[]) => any

  // Label of the cancel button.
  cancelLabel?: string

  // Boolean indicating if clicking the overlay should close the overlay.
  shouldCloseOnOverlayClick?: boolean

  // Boolean indicating if pressing the esc key should close the overlay.
  shouldCloseOnEscapePress?: boolean

  // Width of the Dialog.
  width?: string | number

  /**
   * The space above the dialog.
   * This offset is also used at the bottom when there is not enough vertical
   * space available on screen — and the dialog scrolls internally.
   */
  topOffset?: string | number

  // The space on the left/right sides of the dialog when there isn't enough horizontal space available on screen.
  sideOffset?: string | number

  // The min height of the body content. Makes it less weird when only showing little content.
  minHeightContent?: string | number

  // Props that are passed to the dialog container.
  containerProps?: { [key: string]: any }

  // Props that are passed to the content container.
  contentContainerProps?: { [key: string]: any }

  // Whether or not to prevent scrolling in the outer body
  preventBodyScrolling?: boolean
}

const animationEasing = {
  deceleration: `cubic-bezier(0.0, 0.0, 0.2, 1)`,
  acceleration: `cubic-bezier(0.4, 0.0, 1, 1)`
}

const ANIMATION_DURATION = 200

const openAnimation = css.keyframes('openAnimation', {
  from: {
    transform: 'scale(0.8)',
    opacity: 0
  },
  to: {
    transform: 'scale(1)',
    opacity: 1
  }
})

const closeAnimation = css.keyframes('closeAnimation', {
  from: {
    transform: 'scale(1)',
    opacity: 1
  },
  to: {
    transform: 'scale(0.8)',
    opacity: 0
  }
})

const animationStyles = {
  '&[data-state="entering"], &[data-state="entered"]': {
    animation: `${openAnimation} ${ANIMATION_DURATION}ms ${
      animationEasing.deceleration
    } both`
  },
  '&[data-state="exiting"]': {
    animation: `${closeAnimation} ${ANIMATION_DURATION}ms ${
      animationEasing.acceleration
    } both`
  }
}

class Dialog extends React.Component<PropsWithTheme<DialogProps>> {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
    intent: PropTypes.oneOf(['none', 'success', 'warning', 'danger'])
      .isRequired as PropTypes.Validator<IntentType>,
    isShown: PropTypes.bool,
    title: PropTypes.node,
    hasHeader: PropTypes.bool,
    hasFooter: PropTypes.bool,
    hasCancel: PropTypes.bool,
    hasClose: PropTypes.bool,
    onCloseComplete: PropTypes.func,
    onOpenComplete: PropTypes.func,
    onConfirm: PropTypes.func,
    confirmLabel: PropTypes.string,
    isConfirmLoading: PropTypes.bool,
    isConfirmDisabled: PropTypes.bool,
    onCancel: PropTypes.func,
    cancelLabel: PropTypes.string,
    shouldCloseOnOverlayClick: PropTypes.bool,
    shouldCloseOnEscapePress: PropTypes.bool,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    topOffset: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sideOffset: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minHeightContent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    containerProps: PropTypes.object,
    contentContainerProps: PropTypes.object,
    preventBodyScrolling: PropTypes.bool
  }

  static defaultProps = {
    isShown: false,
    hasHeader: true,
    hasClose: true,
    hasFooter: true,
    hasCancel: true,
    intent: 'none' as IntentType,
    width: 560,
    topOffset: '12vmin',
    sideOffset: '16px',
    minHeightContent: 80,
    confirmLabel: 'Confirm',
    isConfirmLoading: false,
    isConfirmDisabled: false,
    cancelLabel: 'Cancel',
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEscapePress: true,
    onCancel: (close: (...args: any[]) => any) => close(),
    onConfirm: (close: (...args: any[]) => any) => close(),
    preventBodyScrolling: false
  }

  renderChildren = (close: (...args: any[]) => any) => {
    const { children } = this.props

    if (typeof children === 'function') {
      return children({ close })
    }

    if (typeof children === 'string') {
      return <Paragraph>{children}</Paragraph>
    }

    return children
  }

  render() {
    const {
      title,
      width,
      intent,
      isShown,
      topOffset,
      sideOffset,
      hasHeader,
      hasClose,
      hasFooter,
      hasCancel,
      onCloseComplete,
      onOpenComplete,
      onCancel,
      onConfirm,
      confirmLabel,
      isConfirmLoading,
      isConfirmDisabled,
      cancelLabel,
      shouldCloseOnOverlayClick,
      shouldCloseOnEscapePress,
      containerProps,
      contentContainerProps,
      minHeightContent,
      preventBodyScrolling
    } = this.props

    const sideOffsetWithUnit =
      typeof sideOffset === 'number' && Number.isInteger(sideOffset)
        ? `${sideOffset}px`
        : sideOffset
    const maxWidth = `calc(100% - ${sideOffsetWithUnit} * 2)`

    const topOffsetWithUnit =
      typeof topOffset === 'number' && Number.isInteger(topOffset)
        ? `${topOffset}px`
        : topOffset
    const maxHeight = `calc(100% - ${topOffsetWithUnit} * 2)`

    return (
      <Overlay
        isShown={isShown}
        shouldCloseOnClick={shouldCloseOnOverlayClick}
        shouldCloseOnEscapePress={shouldCloseOnEscapePress}
        onExited={onCloseComplete}
        onEntered={onOpenComplete}
        containerProps={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}
        preventBodyScrolling={preventBodyScrolling}
      >
        {({ state, close }: any) => (
          <Pane
            role="dialog"
            backgroundColor="white"
            elevation={4}
            borderRadius={8}
            width={width}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            marginX={sideOffsetWithUnit}
            marginY={topOffsetWithUnit}
            display="flex"
            flexDirection="column"
            css={animationStyles}
            data-state={state}
            {...containerProps}
          >
            {hasHeader && (
              <Pane
                padding={16}
                flexShrink={0}
                borderBottom="muted"
                display="flex"
                alignItems="center"
              >
                <Heading is="h4" size={600} flex="1">
                  {title}
                </Heading>
                {hasClose && (
                  <IconButton
                    appearance="minimal"
                    icon="cross"
                    onClick={() => onCancel(close)}
                  />
                )}
              </Pane>
            )}

            <Pane
              data-state={state}
              display="flex"
              overflow="auto"
              padding={16}
              flexDirection="column"
              minHeight={minHeightContent}
              {...contentContainerProps}
            >
              <Pane>{this.renderChildren(close)}</Pane>
            </Pane>

            {hasFooter && (
              <Pane borderTop="muted" clearfix>
                <Pane padding={16} float="right">
                  {/* Cancel should be first to make sure focus gets on it first. */}
                  {hasCancel && (
                    <Button tabIndex={0} onClick={() => onCancel(close)}>
                      {cancelLabel}
                    </Button>
                  )}

                  <Button
                    tabIndex={0}
                    marginLeft={8}
                    appearance="primary"
                    isLoading={isConfirmLoading}
                    disabled={isConfirmDisabled}
                    onClick={() => onConfirm(close)}
                    intent={intent}
                  >
                    {confirmLabel}
                  </Button>
                </Pane>
              </Pane>
            )}
          </Pane>
        )}
      </Overlay>
    )
  }
}

export default withTheme(Dialog)
