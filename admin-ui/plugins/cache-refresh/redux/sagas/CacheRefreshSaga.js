import { initAudit } from "Redux/sagas/SagaUtils";
import { getClient } from "Redux/api/base";
import { isFourZeroOneError, addAdditionalData } from "Utils/TokenController";
import {
  call,
  all,
  put,
  fork,
  takeLatest,
  select,
  takeEvery,
} from "redux-saga/effects";
import { postUserAction } from "Redux/api/backend-api";
import { updateToast } from 'Redux/features/toastSlice'
import CacheRefreshApi from "../api/CacheRefreshApi"
import {
  getCacheRefreshConfiguration,
  getCacheRefreshConfigurationResponse,
  putCacheRefreshConfiguration,
} from "../features/CacheRefreshSlice";
import { getAPIAccessToken } from "Redux/features/authSlice";
import { UPDATE } from "../../../../app/audit/UserActionType";

const JansConfigApi = require("jans_config_api");

export const CACHE_REFRESH = 'cache-refresh' 

function* newFunction() {
  const token = yield select((state) => state.authReducer.token.access_token);
  const issuer = yield select((state) => state.authReducer.issuer);
  const api = new JansConfigApi.CacheRefreshConfigurationApi(
    getClient(JansConfigApi, token, issuer)
  );
  return new CacheRefreshApi(api);
}

export function* getCacheRefreshSaga() {
  const audit = yield* initAudit();
  try {
    const cacheRefreshApi = yield* newFunction();
    const data = yield call(cacheRefreshApi.getPropertiesCacheRefresh);
    yield put(getCacheRefreshConfigurationResponse(data));
    yield call(postUserAction, audit);
  } catch (e) {
    yield put(getCacheRefreshConfigurationResponse(null));
    if (isFourZeroOneError(e)) {
      const jwt = yield select((state) => state.authReducer.userinfo_jwt);
      yield put(getAPIAccessToken(jwt));
    }
  }
}

export function* editCacheConfig({ payload }) {
  const audit = yield* initAudit();
  addAdditionalData(audit, UPDATE, CACHE_REFRESH, payload)
  try {
    const cacheRefreshApi = yield* newFunction();
    yield call(cacheRefreshApi.updateCacheRefreshConfig, payload.action.action_data);
    yield put(updateToast(true, "success"));
    yield put(getCacheRefreshConfiguration());
    yield call(postUserAction, audit);
  } catch (e) {
    yield put(updateToast(true, "error"));
    if (isFourZeroOneError(e)) {
      const jwt = yield select((state) => state.authReducer.userinfo_jwt);
      yield put(getAPIAccessToken(jwt));
    }
  }
}

export function* watchGetCacheRefresh() {
  yield takeEvery(getCacheRefreshConfiguration.toString(), getCacheRefreshSaga);
}

export function* watchPutCacheRefreshConfig() {
  yield takeLatest(putCacheRefreshConfiguration.toString(), editCacheConfig);
}

export default function* rootSaga() {
  yield all([fork(watchGetCacheRefresh), fork(watchPutCacheRefreshConfig)]);
}
