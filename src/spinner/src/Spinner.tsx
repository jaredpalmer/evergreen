import * as PropTypes from 'prop-types'
import * as React from 'react'
import Box, { BoxProps, css } from 'ui-box'

import { withTheme, PropsWithTheme } from '../../theme'

interface SpinnerProps extends Partial<BoxProps> {
  // The size of the spinner.
  size?: number

  // Delay after which spinner should be visible.
  delay?: number
}

interface SpinnerState {
  isVisible: boolean
}

const loadingKeyframes = css.keyframes('loading', {
  '0%': {
    transform: 'rotate(0)'
  },
  '100%': {
    transform: 'rotate(360deg)'
  }
})

const loadingCircleKeyframes = css.keyframes('loading-circle', {
  '0%': {
    strokeDashoffset: 600
  },
  '100%': {
    strokeDashoffset: 0
  }
})

const outer = {
  animation: `${loadingKeyframes} 2s linear infinite`
}

const inner = (color: string) => ({
  strokeDashoffset: 600,
  strokeDasharray: 300,
  strokeWidth: 12,
  strokeMiterlimit: 10,
  strokeLinecap: 'round',
  animation: `${loadingCircleKeyframes} 1.6s cubic-bezier(0.4, 0.15, 0.6, 0.85) infinite`,
  stroke: color,
  fill: 'transparent'
})

class Spinner extends React.PureComponent<
  PropsWithTheme<SpinnerProps>,
  SpinnerState
> {
  static propTypes = {
    ...Box.propTypes,
    delay: PropTypes.number,
    size: PropTypes.number.isRequired,
    theme: PropTypes.object.isRequired
  }

  static defaultProps = {
    size: 40,
    delay: 0
  }

  delayTimer: any

  constructor(props: PropsWithTheme<SpinnerProps>) {
    super(props)

    const { delay } = props

    this.state = {
      isVisible: delay === 0
    }
  }

  render() {
    if (!this.state.isVisible) {
      return null
    }

    const { theme, size, ...props } = this.props
    return (
      <Box width={size} height={size} lineHeight={0} {...props}>
        <Box is="svg" css={outer} x="0px" y="0px" viewBox="0 0 150 150">
          <Box
            is="circle"
            css={inner(theme.spinnerColor)}
            cx="75"
            cy="75"
            r="60"
          />
        </Box>
      </Box>
    )
  }

  componentDidMount() {
    const { delay } = this.props

    if (delay > 0) {
      this.delayTimer = setTimeout(() => {
        this.setState({
          isVisible: true
        })
      }, delay)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.delayTimer)
  }
}

export default withTheme(Spinner)
