import type { Href } from 'expo-router'
import { Linking } from 'react-native'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const AUTH_PASSWORD_MIN_LENGTH = 8
export const AUTH_CODE_LENGTH = 6

export const normalizeEmail = (value: string) => value.trim().toLowerCase()

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim())

export const getEmailError = (value: string) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return 'Email is required'
  }

  if (!isValidEmail(trimmedValue)) {
    return 'Enter a valid email address'
  }

  return null
}

export const getPasswordError = (value: string) => {
  if (!value) {
    return 'Password is required'
  }

  if (value.length < AUTH_PASSWORD_MIN_LENGTH) {
    return `Use at least ${AUTH_PASSWORD_MIN_LENGTH} characters`
  }

  return null
}

export const getSignInPasswordError = (value: string) => {
  if (!value) {
    return 'Password is required'
  }

  return null
}

export const getCodeError = (value: string) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return 'Verification code is required'
  }

  if (trimmedValue.length !== AUTH_CODE_LENGTH || !/^\d+$/.test(trimmedValue)) {
    return `Enter the ${AUTH_CODE_LENGTH}-digit code`
  }

  return null
}

export const getPostAuthUrl = (
  session: { currentTask?: unknown } | null | undefined,
  decorateUrl: (path: string) => string,
) => {
  if (session?.currentTask) {
    return decorateUrl('/')
  }

  return '/(tabs)'
}

type RouterLike = {
  replace: (href: Href) => void
}

export const navigateToUrl = (router: RouterLike, url: string) => {
  if (url.startsWith('http')) {
    if (typeof window !== 'undefined' && window.location) {
      window.location.replace(url)
      return
    }

    void Linking.openURL(url)
    return
  }

  router.replace(url as Href)
}
