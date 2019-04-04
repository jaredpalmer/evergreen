import * as React from 'react'
import Box, { BoxProps } from 'ui-box'

import { withTheme, PropsWithTheme } from '../../theme'

type Size = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800

interface IProps extends BoxProps {
  size?: Size
  marginTop?: boolean | number | string
}

class Heading extends React.PureComponent<PropsWithTheme<IProps>> {
  static defaultProps = {
    size: 500 as Size
  }

  render() {
    const { theme, marginTop, size, ...props } = this.props
    const {
      marginTop: defaultMarginTop,
      ...headingStyle
    } = theme.getHeadingStyle(size)

    let finalMarginTop = marginTop
    if (marginTop === 'default') {
      finalMarginTop = defaultMarginTop
    }

    return (
      <Box
        is="h2"
        marginTop={finalMarginTop || 0}
        marginBottom={0}
        {...headingStyle}
        {...props}
      />
    )
  }
}

export default withTheme(Heading)