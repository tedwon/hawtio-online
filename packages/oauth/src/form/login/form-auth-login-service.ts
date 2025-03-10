import { hawtio } from '@hawtio/react'
import { log } from '../../globals'
import { oAuthService } from '../../oauth-service'
import { FetchOptions, fetchPath, joinPaths, redirect, relToAbsUrl } from '../../utils'
import { FORM_TOKEN_STORAGE_KEY } from '../globals'

export type ValidationCallback = {
  success: () => void
  error: (err: Error) => void
}

class FormAuthLoginService {
  login(token: string, callback: ValidationCallback) {
    if (!token || token.trim() === '') {
      callback.error(new Error('Token is empty'))
      return
    }

    this.validateToken(token, callback)
  }

  private validateToken(token: string, callback: ValidationCallback) {
    const masterUri = oAuthService.getUserProfile().getMasterUri()
    if (!masterUri) {
      callback.error(new Error('Master URI is not found'))
      return
    }

    const fetchOptions: FetchOptions = {
      headers: { Authorization: `Bearer ${token}` },
    }

    fetchPath<void>(
      joinPaths(masterUri, 'api'),
      {
        success: (_: string) => {
          log.debug('Connected to master uri api')
          callback.success()
          this.saveTokenAndRedirect(token)
          return
        },
        error: err => {
          callback.error(new Error('Cannot validate token', { cause: err }))
          return
        },
      },
      fetchOptions,
    )
  }

  private saveTokenAndRedirect(token: string): void {
    localStorage.setItem(FORM_TOKEN_STORAGE_KEY, token)
    const uri = this.redirectUri()
    redirect(new URL(uri))
  }

  private redirectUri(): string {
    const currentUri = new URL(window.location.href)
    const searchParams: URLSearchParams = currentUri.searchParams
    if (searchParams.has('redirect_uri')) {
      return searchParams.get('redirect_uri') as string
    }

    return relToAbsUrl(hawtio.getBasePath() || window.location.origin)
  }
}

export const formAuthLoginService = new FormAuthLoginService()
