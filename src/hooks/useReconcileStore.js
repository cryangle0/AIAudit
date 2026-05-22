import { useReducer, useCallback } from 'react'

const initial = {
  authed: (() => { try { return JSON.parse(localStorage.getItem('ai-reconcile.authed')) === true } catch { return false } })(),
  darkMode: false,
  platformId: 'douyin',
  shopId: 'xzf-dehuang',
  month: '2026-01',
  activeTab: 'reconcile',
  pageId: 'diff-analyze',
  uploads: {},
  reconciling: false,
  result: null,
  error: null,
  parseWarnings: []
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':    return { ...state, authed: true }
    case 'LOGOUT':   return { ...initial, authed: false }
    case 'TOGGLE_DARK': return { ...state, darkMode: !state.darkMode }
    case 'SELECT_SCOPE': return {
      ...state,
      platformId: action.platformId, shopId: action.shopId, month: action.month,
      uploads: {}, result: null, error: null
    }
    case 'SET_TAB':  return { ...state, activeTab: action.tab }
    case 'SET_PAGE': return { ...state, pageId: action.pageId }
    case 'SET_UPLOAD': return { ...state, uploads: { ...state.uploads, [action.key]: action.payload }, error: null }
    case 'CLEAR_UPLOAD': {
      const next = { ...state.uploads }; delete next[action.key]
      return { ...state, uploads: next, result: null }
    }
    case 'CLEAR_ERROR': return { ...state, error: null }
    case 'RECONCILE_START': return { ...state, reconciling: true, error: null }
    case 'RECONCILE_DONE':  return { ...state, reconciling: false, result: action.result, parseWarnings: action.warnings || [] }
    case 'RECONCILE_FAIL':  return { ...state, reconciling: false, error: action.error }
    default: return state
  }
}

export function useReconcileStore() {
  const [state, dispatch] = useReducer(reducer, initial)

  const login = useCallback(() => {
    localStorage.setItem('ai-reconcile.authed', 'true'); dispatch({ type: 'LOGIN' })
  }, [])
  const logout = useCallback(() => {
    localStorage.setItem('ai-reconcile.authed', 'false'); dispatch({ type: 'LOGOUT' })
  }, [])

  return { state, dispatch, login, logout }
}
