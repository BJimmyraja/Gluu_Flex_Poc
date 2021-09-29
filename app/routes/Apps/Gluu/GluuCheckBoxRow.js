import React from 'react'
import { Col, FormGroup, Input } from '../../../components'
import GluuLabel from './GluuLabel'
import GluuTooltip from './GluuTooltip'

function GluuCheckBoxRow({
  label,
  name,
  value,
  required,
  lsize,
  rsize,
  handleOnChange,
}) {
  return (
    <GluuTooltip id={name}>
      <FormGroup row>
        <GluuLabel label={label} size={lsize} required={required} />
        <Col sm={rsize}>
          <Input
            id={name}
            type="checkbox"
            name={name}
            defaultChecked={value}
            onChange={handleOnChange}
          />
        </Col>
      </FormGroup>
    </GluuTooltip>
  )
}

GluuCheckBoxRow.defaultProps = {
  type: 'checkbox',
  lsize: 3,
  rsize: 9,
  required: false,
}
export default GluuCheckBoxRow
