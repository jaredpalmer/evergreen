import * as React from 'react'

import Pane from './Pane'

export default class Card extends React.PureComponent {
  static propTypes = {
    ...Pane.propTypes
  }

  render() {
    return <Pane borderRadius={5} {...this.props} />
  }
}
