/**
 * Auth Sagas
 */
import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import {
  getOAuth2ConfigResponse,
  getUserInfoResponse,
  getAPIAccessTokenResponse,
  getUserLocationResponse,
} from '../features/authSlice'

import {
  fetchServerConfiguration,
  fetchUserInformation,
  fetchApiAccessToken,
  getUserIpAndLocation,
  fetchApiTokenWithDefaultScopes,
} from '../api/backend-api'

function* getApiTokenWithDefaultScopes() {
  const response = yield call(fetchApiTokenWithDefaultScopes)
  return response.access_token
}

function* getOAuth2ConfigWorker() {
  try {
    const token = yield* getApiTokenWithDefaultScopes()
    const response = yield call(fetchServerConfiguration, token)
    if (response) {
      yield put(getOAuth2ConfigResponse({ config: response }))
      return
    }
  } catch (error) {
    console.log('Problems getting OAuth2 configuration.', error)
  }
  yield put(getOAuth2ConfigResponse())
}

function* getUserInformationWorker(code) {
  try {
    const response = yield call(fetchUserInformation, code.payload)
    if (response) {
      yield put(getUserInfoResponse({ uclaims: response.claims, ujwt: response.jwtUserInfo }))
      return
    }
  } catch (error) {
    console.log('Problems getting user information.', error)
  }
}
function* getAPIAccessTokenWorker(jwt) {
  try {
    if (jwt) {
      const response = yield call(fetchApiAccessToken, jwt.payload)
      if (response) {
        yield put(getAPIAccessTokenResponse({ accessToken: response }))
        return
      }
    }
  } catch (error) {
    console.log('Problems getting API Access Token.', error)
  }
}

function* getLocationWorker() {
  try {
    const response = yield call(getUserIpAndLocation)
    if (response) {
      yield put(getUserLocationResponse({ location: response }))
      return
    }
  } catch (error) {
    console.log('Problem getting user location.', error)
  }
}

//watcher sagas
export function* getApiTokenWatcher() {
  yield takeEvery('auth/getAPIAccessToken', getAPIAccessTokenWorker)
}

export function* userInfoWatcher() {
  yield takeEvery('auth/getUserInfo', getUserInformationWorker)
}

export function* getOAuth2ConfigWatcher() {
  yield takeEvery('auth/getOAuth2Config', getOAuth2ConfigWorker)
}
export function* getLocationWatcher() {
  yield takeEvery('auth/getUserLocation', getLocationWorker)
}

/**
 * Auth Root Saga
 */
export default function* rootSaga() {
  yield all([
    fork(getOAuth2ConfigWatcher),
    fork(userInfoWatcher),
    fork(getApiTokenWatcher),
    fork(getLocationWatcher),
  ])
}
