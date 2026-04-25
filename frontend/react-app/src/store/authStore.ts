import { create } from 'zustand'
import type { UserProfile } from '../types/api'

interface AuthState {
  token: string | null
  user: UserProfile | null
  setAuth: (token: string, user: UserProfile) => void
  logout: () => void
}

const tokenKey = 'ai-oa-token'
const userKey = 'ai-oa-user'

function loadUser(): UserProfile | null {
  const raw = localStorage.getItem(userKey)
  if (!raw) return null

  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(tokenKey),
  user: loadUser(),
  setAuth: (token, user) => {
    localStorage.setItem(tokenKey, token)
    localStorage.setItem(userKey, JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
    set({ token: null, user: null })
  },
}))
