import * as PropTypes from 'prop-types'
import * as React from 'react'
import Transition from 'react-transition-group/Transition'
import Box, { css } from 'ui-box'

import { StackingOrder } from '../../constants'
import preventBodyScroll from '../../lib/prevent-body-scroll'
import safeInvoke from '../../lib/safe-invoke'
import { Portal } from '../../portal'
import { Stack } from '../../stack'
import { withTheme, PropsWithTheme } from '../../theme'

interface OverlayProps {
  /**
   * Children can be a node or a function accepting `close: func`
   * and `state: ENTERING | ENTERED | EXITING | EXITED`.
   */
  children: React.ReactNode

  // Show the component; triggers the enter or exit states.
  isShown?: boolean

  // Props to be passed through on the inner Box.
  containerProps?: { [key: string]: any }

  // Whether or not to prevent body scrolling outside the context of the overlay
  preventBodyScrolling?: boolean

  // Boolean indicating if clicking the overlay should close the overlay.
  shouldCloseOnClick?: boolean

  // Boolean indicating if pressing the esc key should close the overlay.
  shouldCloseOnEscapePress?: boolean

  /**
   * Function called when overlay is about to close.
   * Return `false` to prevent the sheet from closing.
   */
  onBeforeClose?: (...args: any[]) => boolean

  // Callback fired before the "exiting" status is applied.
  onExit?: (node: HTMLElement) => void

  // Callback fired after the "exiting" status is applied.
  onExiting?: (node: HTMLElement) => void

  // Callback fired after the "exited" status is applied.
  onExited?: (node: HTMLElement) => void

  /**
   * Callback fired before the "entering" status is applied.
   * An extra parameter isAppearing is supplied to indicate if the enter stage
   * is occurring on the initial mount.
   */
  onEnter?: (node: HTMLElement, isAppearing?: boolean) => void

  /**
   * Callback fired after the "entering" status is applied.
   * An extra parameter isAppearing is supplied to indicate if the enter stage
   * is occurring on the initial mount.
   */
  onEntering?: (node: HTMLElement, isAppearing?: boolean) => void

  /**
   * Callback fired after the "entered" status is applied.
   * An extra parameter isAppearing is supplied to indicate if the enter stage
   * is occurring on the initial mount.
   */
  onEntered?: (node: HTMLElement, isAppearing?: boolean) => void
}

interface OverlayState {
  exiting: boolean
  exited: boolean
}

const animationEasing = {
  standard: `cubic-bezier(0.4, 0.0, 0.2, 1)`,
  deceleration: `cubic-bezier(0.0, 0.0, 0.2, 1)`,
  acceleration: `cubic-bezier(0.4, 0.0, 1, 1)`,
  sharp: `cubic-bezier(0.4, 0.0, 0.6, 1)`,
  spring: `cubic-bezier(0.175, 0.885, 0.320, 1.175)`
}

const ANIMATION_DURATION = 240

const fadeInAnimation = css.keyframes('fadeInAnimation', {
  from: {
    opacity: 0
  },
  to: {
    opacity: 1
  }
})

const fadeOutAnimation = css.keyframes('fadeOutAnimation', {
  from: {
    opacity: 1
  },
  to: {
    opacity: 0
  }
})

const animationStyles = (backgroundColor: string) => ({
  '&::before': {
    backgroundColor,
    left: 0,
    top: 0,
    position: 'fixed',
    display: 'block',
    width: '100%',
    height: '100%',
    content: '" "'
  },
  '&[data-state="entering"]::before, &[data-state="entered"]::before': {
    animation: `${fadeInAnimation} ${ANIMATION_DURATION}ms ${
      animationEasing.deceleration
    } both`
  },
  '&[data-state="exiting"]::before, &[data-state="exited"]::before': {
    animation: `${fadeOutAnimation} ${ANIMATION_DURATION}ms ${
      animationEasing.acceleration
    } both`
  }
})

/**
 * Overlay is essentially a wrapper around react-transition-group/Transition
 * Learn more: https://reactcommunity.org/react-transition-group/
 */
class Overlay extends React.Component<
  PropsWithTheme<OverlayProps>,
  OverlayState
> {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
    isShown: PropTypes.bool,
    containerProps: PropTypes.object,
    preventBodyScrolling: PropTypes.bool,
    shouldCloseOnClick: PropTypes.bool,
    shouldCloseOnEscapePress: PropTypes.bool,
    onBeforeClose: PropTypes.func,
    onExit: PropTypes.func,
    onExiting: PropTypes.func,
    onExited: PropTypes.func,
    onEnter: PropTypes.func,
    onEntering: PropTypes.func,
    onEntered: PropTypes.func,
    theme: PropTypes.object.isRequired
  }

  static defaultProps = {
    onHide: () => {},
    shouldCloseOnClick: true,
    shouldCloseOnEscapePress: true,
    preventBodyScrolling: false,
    onExit: () => {},
    onExiting: () => {},
    onExited: () => {},
    onEnter: () => {},
    onEntering: () => {},
    onEntered: () => {}
  }

  containerElement: HTMLElement

  previousActiveElement: HTMLElement

  constructor(props: PropsWithTheme<OverlayProps>) {
    super(props)

    this.state = {
      exiting: false,
      exited: !props.isShown
    }
  }

  componentDidUpdate(prevProps: OverlayProps) {
    if (!prevProps.isShown && this.props.isShown) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        exited: false
      })
    }
  }

  componentWillUnmount() {
    this.handleBodyScroll(false)
    document.body.removeEventListener('keydown', this.onEsc, false)
  }

  /**
   * Methods borrowed from BlueprintJS
   * https://github.com/palantir/blueprint/blob/release/2.0.0/packages/core/src/components/overlay/overlay.tsx
   */
  bringFocusInsideOverlay = () => {
    // Always delay focus manipulation to just before repaint to prevent scroll jumping
    return requestAnimationFrame(() => {
      // Container ref may be undefined between component mounting and Portal rendering
      // activeElement may be undefined in some rare cases in IE

      if (
        this.containerElement == null || // eslint-disable-line eqeqeq, no-eq-null
        document.activeElement == null || // eslint-disable-line eqeqeq, no-eq-null
        !this.props.isShown
      ) {
        return
      }

      const isFocusOutsideModal = !this.containerElement.contains(
        document.activeElement
      )
      if (isFocusOutsideModal) {
        // Element marked autofocus has higher priority than the other clowns
        const autofocusElement: HTMLElement = this.containerElement.querySelector(
          '[autofocus]'
        )
        const wrapperElement: HTMLElement = this.containerElement.querySelector(
          '[tabindex]'
        )
        const buttonElement: HTMLElement = this.containerElement.querySelector(
          'button'
        )

        if (autofocusElement) {
          autofocusElement.focus()
        } else if (wrapperElement) {
          wrapperElement.focus()
        } else if (buttonElement) {
          buttonElement.focus()
        }
      }
    })
  }

  bringFocusBackToTarget = () => {
    return requestAnimationFrame(() => {
      if (
        this.containerElement == null || // eslint-disable-line eqeqeq, no-eq-null
        document.activeElement == null // eslint-disable-line eqeqeq, no-eq-null
      ) {
        return
      }

      const isFocusInsideModal = this.containerElement.contains(
        document.activeElement
      )

      // Bring back focus on the target.
      if (
        this.previousActiveElement &&
        (document.activeElement === document.body || isFocusInsideModal)
      ) {
        this.previousActiveElement.focus()
      }
    })
  }

  onEsc = (e: KeyboardEvent) => {
    // Esc key
    if (e.keyCode === 27 && this.props.shouldCloseOnEscapePress) {
      this.close()
    }
  }

  close = () => {
    const shouldClose = safeInvoke(this.props.onBeforeClose)
    if (shouldClose !== false) {
      this.setState({ exiting: true })
    }
  }

  handleBodyScroll = (preventScroll: any) => {
    if (this.props.preventBodyScrolling) {
      preventBodyScroll(preventScroll)
    }
  }

  handleEnter = () => {
    this.handleBodyScroll(true)
    safeInvoke(this.props.onEnter)
  }

  handleEntering = (node: HTMLElement) => {
    document.body.addEventListener('keydown', this.onEsc, false)
    this.props.onEntering(node)
  }

  handleEntered = (node: HTMLElement) => {
    this.previousActiveElement = document.activeElement as HTMLElement
    this.bringFocusInsideOverlay()
    this.props.onEntered(node)
  }

  handleExit = () => {
    this.handleBodyScroll(false)
    safeInvoke(this.props.onExit)
  }

  handleExiting = (node: HTMLElement) => {
    document.body.removeEventListener('keydown', this.onEsc, false)
    this.bringFocusBackToTarget()
    this.props.onExiting(node)
  }

  handleExited = (node: HTMLElement) => {
    this.setState({ exiting: false, exited: true })
    this.props.onExited(node)
  }

  handleBackdropClick = (e: Event) => {
    if (e.target !== e.currentTarget || !this.props.shouldCloseOnClick) {
      return
    }

    this.close()
  }

  onContainerRef = (ref: HTMLElement) => {
    this.containerElement = ref
  }

  render() {
    const {
      theme,

      containerProps = {},
      isShown,
      children
    } = this.props

    const { exiting, exited } = this.state

    if (exited) return null

    return (
      <Stack value={StackingOrder.OVERLAY}>
        {zIndex => (
          <Portal>
            <Transition
              appear
              unmountOnExit
              timeout={ANIMATION_DURATION}
              in={isShown && !exiting}
              onExit={this.handleExit}
              onExiting={this.handleExiting}
              onExited={this.handleExited}
              onEnter={this.handleEnter}
              onEntering={this.handleEntering}
              onEntered={this.handleEntered}
            >
              {state => (
                <Box
                  onClick={this.handleBackdropClick}
                  innerRef={this.onContainerRef}
                  position="fixed"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  zIndex={zIndex}
                  css={animationStyles(theme.overlayBackgroundColor)}
                  data-state={state}
                  {...containerProps}
                >
                  {typeof children === 'function'
                    ? children({ state, close: this.close })
                    : children}
                </Box>
              )}
            </Transition>
          </Portal>
        )}
      </Stack>
    )
  }
}

export default withTheme(Overlay)
