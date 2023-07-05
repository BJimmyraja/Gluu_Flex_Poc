import reducerRegistry from 'Redux/reducers/ReducerRegistry'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  scripts: [],
  clients: [],
  scopes: [],
  attributes: [],
  totalClientsEntries: 0
}

const initSlice = createSlice({
  name: 'init',
  initialState,
  reducers: {
    getScripts: () => {},
    getScriptsResponse: (state, action) => {
      if (action.payload?.data) {
        state.scripts = action.payload.data?.entries
      }
    },
    getClients: () => {},
    getClientsResponse: (state, action) => {
      if (action.payload?.data) {
        state.clients = action.payload.data?.entries
        state.totalClientsEntries = action.payload.data.totalEntriesCount
      }
    },
    getScopes: () => {},
    getScopesResponse: (state, action) => {
      if (action.payload?.data) {
        state.scopes = action.payload.data
      }
    },
    getAttributes: () => {},
    getAttributesResponse: (state, action) => {
      if (action.payload?.data) {
        state.attributes = action.payload.data?.entries
      }
    },
    handleApiTimeout: (state, action) => {
      console.log('action', action.payload)
      state.isLoading = false
      state.isTimeout = action.payload.isTimeout || false
    }
  }
})

export const {
  getScripts,
  getScriptsResponse,
  getClients,
  getClientsResponse,
  getScopes,
  getScopesResponse,
  getAttributes,
  getAttributesResponse,
  handleApiTimeout
} = initSlice.actions
export const { actions, reducer, state } = initSlice
reducerRegistry.register('initReducer', reducer)
