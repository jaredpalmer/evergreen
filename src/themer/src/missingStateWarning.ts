import { AnyObject, AnyFunction } from '../../types/helper'
import hasOwnProperty from './hasOwnProperty'
import isDev from './isDev'

function missingStateWarning({
  items,
  props,
  cb
}: {
  items: AnyObject
  props: string[]
  cb: AnyFunction
}) {
  if (!isDev) return
  props.forEach(prop => {
    if (!hasOwnProperty(items, prop)) {
      cb(prop)
    }
  })
}

export const logMissingState = (call: string, items: AnyObject) => (
  prop: string
) => {
  console.error(`Themer.${call}() is missing a ${prop} item`, items)
}

export default missingStateWarning