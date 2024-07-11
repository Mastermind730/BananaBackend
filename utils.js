function createResult(error, data) {
    // create an empty result
    const result = {}
  
    if (error) {
      // something has gone wrong
      result['status'] = 'error'
      result['error'] = error
    } else {
      // everything is good
      result['status'] = 'success'
      result['data'] = data
    }
  
    return result
  }
  
  module.exports = {
    createResult,
  }
  