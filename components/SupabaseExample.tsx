import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { supabase } from '../lib/supabase'
import { authService } from '../services/authService'
import { supabaseLeaderboardService } from '../services/supabaseLeaderboardService'

export default function SupabaseExample() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])

  useEffect(() => {
    // 인증 상태 확인
    checkAuthState()
    
    // 리더보드 데이터 로드
    loadLeaderboard()
  }, [])

  const checkAuthState = async () => {
    const session = await authService.getCurrentSession()
    const currentUser = await authService.getCurrentUser()
    
    setIsSignedIn(!!session)
    setUser(currentUser)
  }

  const loadLeaderboard = async () => {
    try {
      const data = await supabaseLeaderboardService.getLeaderboard('total_profit', 10)
      setLeaderboardData(data)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.')
      return
    }

    const { user, error } = await authService.signUp(email, password, username)
    
    if (error) {
      Alert.alert('회원가입 오류', error.message)
    } else {
      Alert.alert('성공', '회원가입이 완료되었습니다! 이메일을 확인해주세요.')
      setEmail('')
      setPassword('')
      setUsername('')
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.')
      return
    }

    const { user, error } = await authService.signIn(email, password)
    
    if (error) {
      Alert.alert('로그인 오류', error.message)
    } else {
      setIsSignedIn(true)
      setUser(user)
      Alert.alert('성공', '로그인되었습니다!')
    }
  }

  const handleSignOut = async () => {
    const { error } = await authService.signOut()
    
    if (error) {
      Alert.alert('로그아웃 오류', error.message)
    } else {
      setIsSignedIn(false)
      setUser(null)
      Alert.alert('성공', '로그아웃되었습니다!')
    }
  }

  const testSupabaseConnection = async () => {
    try {
      // 간단한 테스트 쿼리
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        Alert.alert('연결 테스트 실패', error.message)
      } else {
        Alert.alert('연결 성공', 'Supabase 연결이 정상적으로 작동합니다!')
      }
    } catch (error) {
      Alert.alert('연결 테스트 실패', 'Supabase 연결에 문제가 있습니다.')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase 연결 테스트</Text>
      
      {!isSignedIn ? (
        <View style={styles.authContainer}>
          <Text style={styles.sectionTitle}>회원가입 / 로그인</Text>
          
          <TextInput
            style={styles.input}
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="사용자명 (선택사항)"
            value={username}
            onChangeText={setUsername}
          />
          
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>회원가입</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSignIn}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>로그인</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userContainer}>
          <Text style={styles.sectionTitle}>로그인된 사용자</Text>
          <Text style={styles.userInfo}>이메일: {user?.email}</Text>
          <Text style={styles.userInfo}>사용자 ID: {user?.id}</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.testContainer}>
        <Text style={styles.sectionTitle}>연결 테스트</Text>
        
        <TouchableOpacity style={styles.button} onPress={testSupabaseConnection}>
          <Text style={styles.buttonText}>Supabase 연결 테스트</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={loadLeaderboard}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>리더보드 데이터 로드</Text>
        </TouchableOpacity>
      </View>

      {leaderboardData.length > 0 && (
        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>리더보드 데이터</Text>
          {leaderboardData.map((entry, index) => (
            <View key={entry.id || index} style={styles.leaderboardItem}>
              <Text style={styles.rankText}>#{entry.rank || index + 1}</Text>
              <Text style={styles.usernameText}>{entry.username || 'Unknown'}</Text>
              <Text style={styles.plText}>${entry.totalPL || 0}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  authContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  userInfo: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 40,
  },
  usernameText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  plText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
})
