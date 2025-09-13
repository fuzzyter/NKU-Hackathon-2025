import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

// Supabase 설정
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 설정되지 않았습니다. 환경 변수를 확인해주세요.')
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // React Native에서 자동으로 토큰을 새로고침
    autoRefreshToken: true,
    // 세션을 지속적으로 유지
    persistSession: true,
    // 로컬 스토리지 대신 AsyncStorage 사용 (React Native)
    storage: undefined, // Expo에서는 자동으로 AsyncStorage를 사용
  },
})

// 타입 정의 (필요에 따라 확장)
export type Database = {
  // 여기에 데이터베이스 스키마 타입을 정의할 수 있습니다
  // 예: public: { tables: { users: { ... } } }
}
