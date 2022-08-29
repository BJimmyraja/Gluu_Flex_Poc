export default class SessionApi {
  constructor(api) {
    this.api = api
  }

  getAllSessions = async (options) => {
    return new Promise((resolve, reject) => {
      this.api.getSessions(options, (error, data) => {
        this.handleResponse(error, reject, resolve, data)
      })
    })
  }

  revokeSession = async (userDn) => {
    return new Promise((resolve, reject) => {
      this.api.revokeUserSession(userDn, (error, data) => {
        this.handleResponse(error, reject, resolve, data)
      })
    })
  }

  handleResponse(error, reject, resolve, data) {
    if (error) {
      reject(error)
    } else {
      resolve(data)
    }
  }
}
