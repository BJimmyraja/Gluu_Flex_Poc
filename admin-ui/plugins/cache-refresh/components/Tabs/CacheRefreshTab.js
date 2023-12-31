import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { Row, Col, Form, FormGroup } from 'Components'
import GluuProperties from 'Routes/Apps/Gluu/GluuProperties'
import GluuLabel from 'Routes/Apps/Gluu/GluuLabel'
import GluuInputRow from 'Routes/Apps/Gluu/GluuInputRow'
import GluuSelectRow from 'Routes/Apps/Gluu/GluuSelectRow'
import GluuCheckBoxRow from 'Routes/Apps/Gluu/GluuCheckBoxRow'
import * as Yup from 'yup'
import GluuCommitFooter from 'Routes/Apps/Gluu/GluuCommitFooter'
import { isEmpty } from 'lodash'
import { putCacheRefreshConfiguration } from 'Plugins/cache-refresh/redux/features/CacheRefreshSlice'
import GluuCommitDialog from 'Routes/Apps/Gluu/GluuCommitDialog'
import { useTranslation } from 'react-i18next'
import { buildPayload } from 'Utils/PermChecker'

const CacheRefreshTab = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const cacheRefreshConfiguration = useSelector(
    (state) => state.cacheRefreshReducer.configuration
  )
  const userAction = {}
  const [modal, setModal] = useState(false)
  const toggle = () => {
    setModal(!modal)
  }

  const {
    updateMethod = null,
    snapshotFolder = null,
    snapshotMaxCount = null,
    ldapSearchSizeLimit = null,
    keepExternalPerson = null,
    cacheRefreshServerIpAddress = null,
    vdsCacheRefreshPollingInterval = null,
    vdsCacheRefreshEnabled = null,
    attributeMapping = [],
    vdsCacheRefreshProblemCount = null,
    vdsCacheRefreshLastUpdateCount = null,
    vdsCacheRefreshLastUpdate = null,
  } = useSelector((state) => state.cacheRefreshReducer.configuration)

  const initialValues = {
    updateMethod,
    snapshotFolder,
    snapshotMaxCount,
    ldapSearchSizeLimit,
    keepExternalPerson,
    cacheRefreshServerIpAddress,
    vdsCacheRefreshPollingInterval,
    vdsCacheRefreshEnabled,
    attributeMapping,
    vdsCacheRefreshProblemCount,
    vdsCacheRefreshLastUpdateCount,
    vdsCacheRefreshLastUpdate,
  }

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      snapshotMaxCount: Yup.mixed().required(
        `${t('fields.snapshots_count')} ${t('messages.is_required')}`
      ),
      snapshotFolder: Yup.string().required(
        `${t('fields.snapshot_folder')} ${t('messages.is_required')}`
      ),
      updateMethod: Yup.string().required(
        `${t('fields.refresh_method')} ${t('messages.is_required')}`
      ),
      attributeMapping: Yup.array().min(
        1,
        `${t('fields.mandatory_fields_required')}`
      ),
    }),
    setFieldValue: (field) => {
      delete values[field]
    },
    onSubmit: () => {
      if (isEmpty(formik.errors)) {
        toggle()
      }
    },
  })

  const submitForm = (userMessage) => {
    toggle()

    buildPayload(userAction, userMessage, {
      cacheRefreshConfiguration: {
        ...cacheRefreshConfiguration,
        ...formik.values,
        attributeMapping: formik.values.attributeMapping?.length
          ? formik.values.attributeMapping.map((attribute) => {
              return {
                source: attribute.source,
                destination: attribute.destination,
              }
            })
          : [],
      },
    })

    dispatch(
      putCacheRefreshConfiguration({ action: userAction })
    )
  }

  return (
    <>
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          formik.handleSubmit()
        }}
        className='mt-4'
      >
        <FormGroup row>
          <Col sm={12}>
            <Row>
              <GluuLabel label={'fields.last_run'} size={3} />
              <Col sm={9}>{formik.values.vdsCacheRefreshLastUpdate}</Col>
            </Row>
          </Col>
          <Col sm={12}>
            <Row className='my-3'>
              <GluuLabel label={'fields.updates_at_last_run'} size={3} />
              <Col sm={9}>{formik.values.vdsCacheRefreshLastUpdateCount}</Col>
            </Row>
          </Col>
          <Col sm={12}>
            <Row className='mb-3'>
              <GluuLabel label={'fields.problems_at_last_run'} size={3} />
              <Col sm={9}>{formik.values.vdsCacheRefreshProblemCount}</Col>
            </Row>
          </Col>
          <Col sm={12}>
            <GluuSelectRow
              label='fields.refresh_method'
              name='updateMethod'
              value={formik.values.updateMethod}
              defaultValue={formik.values.updateMethod}
              values={['copy', 'VDS']}
              formik={formik}
              lsize={3}
              rsize={9}
              required
              showError={
                formik.errors.updateMethod && formik.touched.updateMethod
              }
              errorMessage={formik.errors.updateMethod}
            />
          </Col>
          <Col sm={12}>
            <Row>
              <GluuLabel required label='fields.change_attribute_name_from_source_to_estination' size={3} />
              <Col sm={9}>
                <GluuProperties
                  compName='attributeMapping'
                  isInputLables={true}
                  formik={formik}
                  multiProperties
                  inputSm={10}
                  options={
                    formik.values.attributeMapping
                      ? formik.values.attributeMapping.map(
                          ({ source, destination }) => ({
                            key: '',
                            source,
                            destination,
                          })
                        )
                      : []
                  }
                  isKeys={false}
                  buttonText='actions.add_server'
                  showError={
                    formik.errors.attributeMapping &&
                    formik.touched.attributeMapping
                  }
                  errorMessage={formik.errors.attributeMapping}
                />
              </Col>
            </Row>
          </Col>
          <Col sm={12} className='mt-3'>
            <GluuInputRow
              label='fields.snapshot_folder'
              name='snapshotFolder'
              value={formik.values.snapshotFolder}
              formik={formik}
              lsize={3}
              rsize={9}
              required
              showError={
                formik.errors.snapshotFolder && formik.touched.snapshotFolder
              }
              errorMessage={formik.errors.snapshotFolder}
            />
          </Col>
          <Col sm={12}>
            <GluuInputRow
              label='fields.snapshots_count'
              name='snapshotMaxCount'
              type='number'
              value={formik.values.snapshotMaxCount}
              formik={formik}
              lsize={3}
              rsize={9}
              required
              showError={
                formik.errors.snapshotMaxCount &&
                formik.touched.snapshotMaxCount
              }
              errorMessage={formik.errors.snapshotMaxCount}
            />
          </Col>
          <Col sm={12}>
            <GluuCheckBoxRow
              label='fields.keep_external_persons'
              name='keepExternalPerson'
              handleOnChange={(e) => {
                formik.setFieldValue('keepExternalPerson', e.target.checked)
              }}
              lsize={3}
              rsize={9}
              value={formik.values.keepExternalPerson}
            />
          </Col>
          <Col sm={12}>
            <GluuInputRow
              label='fields.server_ip_address'
              name='cacheRefreshServerIpAddress'
              value={formik.values.cacheRefreshServerIpAddress}
              formik={formik}
              lsize={3}
              rsize={9}
            />
          </Col>
          <Col sm={12}>
            <GluuInputRow
              label='fields.polling_interval_mins'
              name='vdsCacheRefreshPollingInterval'
              type='number'
              value={formik.values.vdsCacheRefreshPollingInterval}
              formik={formik}
              lsize={3}
              rsize={9}
            />
          </Col>
          <Col sm={12}>
            <GluuInputRow
              label='fields.search_size_limit'
              name='ldapSearchSizeLimit'
              type='number'
              value={formik.values.ldapSearchSizeLimit}
              formik={formik}
              lsize={3}
              rsize={9}
            />
          </Col>
          <Col sm={12}>
            <GluuCheckBoxRow
              label='fields.cache_refresh'
              name='vdsCacheRefreshEnabled'
              handleOnChange={(e) => {
                formik.setFieldValue('vdsCacheRefreshEnabled', e.target.checked)
              }}
              lsize={3}
              rsize={9}
              value={formik.values.vdsCacheRefreshEnabled}
            />
          </Col>
        </FormGroup>
        <Row>
          <Col>
            <GluuCommitFooter
              hideButtons={{ save: true, back: false }}
              type='submit'
              saveHandler={toggle}
            />
          </Col>
        </Row>
        <GluuCommitDialog
          handler={toggle}
          modal={modal}
          onAccept={submitForm}
          formik={formik}
        />
      </Form>
    </>
  )
}

export default CacheRefreshTab
