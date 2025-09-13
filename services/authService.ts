import { supabase } from '../lib/supabase'
import { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email?: string
  username?: string
  avatar_url?: string
}

export class AuthService {
  private static instance: AuthService

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // 현재 세션 가져오기
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        return null
      }
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  // 현재 사용자 가져오기
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error getting user:', error)
        return null
      }
      return user
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  // 이메일로 회원가입
  async signUp(email: string, password: string, username?: string): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        return { user: null, error }
      }

      // 사용자 프로필 생성
      if (data.user) {
        await this.createUserProfile(data.user.id, username || email.split('@')[0])
      }

      return { user: data.user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // 이메일로 로그인
  async signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        return { user: null, error }
      }

      return { user: data.user, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // 구글 로그인
  async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Google sign in error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { error: error as AuthError }
    }
  }

  // 로그아웃
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        return { error }
      }
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as AuthError }
    }
  }

  // 비밀번호 재설정
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        console.error('Reset password error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error as AuthError }
    }
  }

  // 사용자 프로필 생성
  private async createUserProfile(userId: string, username: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          username,
          email: '', // 이메일은 auth.users 테이블에서 관리
          total_pl: 0,
          total_pl_percent: 0,
          win_rate: 0,
          total_trades: 0,
          level: 1,
          xp: 0,
          badges: [],
          current_streak: 0,
          longest_streak: 0,
          best_trade: 0,
          worst_trade: 0
        })

      if (error) {
        console.error('Error creating user profile:', error)
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  // 사용자 프로필 업데이트
  async updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: updates.username,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user profile:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { error }
    }
  }

  // 사용자 프로필 가져오기
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error getting user profile:', error)
        return null
      }

      return {
        id: data.id,
        username: data.username,
        avatar_url: data.avatar_url
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // 인증 상태 변경 리스너
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = AuthService.getInstance()
