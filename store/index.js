import Vuex from 'vuex'
import actions from './actions'
import getters from './getter'
import mutations from './mutations'

const createStore = () => {
  return new Vuex.store({
    state: {},
    getters,
    actions,
    mutations
  })
}
