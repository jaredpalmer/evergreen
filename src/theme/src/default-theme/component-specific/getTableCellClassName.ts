import { Themer } from '../../../../themer'
import scales from '../foundational-styles/scales'
import memoizeClassName from '../utils/memoizeClassName'

const defaultAppearance = Themer.createTableCellAppearance({
  focus: {
    outline: 'none',
    backgroundColor: scales.blue.B2A,
    boxShadow: `inset 0 0 0 1px ${scales.blue.B7A}`
  }
})

/**
 * Get the appearance of a `TableCell`.
 * @param {string} appearance
 * @return {string} the appearance object.
 */
const getAppearance = () => {
  return defaultAppearance
}

/**
 * Get the className of a `Table.EditableCell`.
 * @param {string} appearance
 * @return {string} the appearance class name.
 */
export default memoizeClassName(getAppearance)
