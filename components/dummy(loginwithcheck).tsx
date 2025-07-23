// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

import Checkbox from '../components/checkbox';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);         // 2️⃣ state
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // TODO: replace with your auth logic
    if (email === 'user@example.com' && password === 'password') {
      // you could persist rememberMe here if needed
      router.replace('/(tabs)');
    } else {
      setError('Invalid credentials');
    }
  };

  const { width } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/videos/login.gif')}
        style={[styles.hero, { width }]}
        resizeMode="cover"
      />

      <View style={styles.formContainer}>
        <Text style={styles.heading}>Elements Dashboard</Text>
        <Text style={styles.subheading}>Sign in to continue.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputWrapper}>
          <Image
            source={require('../assets/images-user/email.png')}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Mail Id"
            placeholderTextColor="#000"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Image
            source={require('../assets/images-user/password.png')}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#000"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* 3️⃣ Remember me row */}
        <View style={styles.rememberRow}>
          <Checkbox
            selected={rememberMe}
            onPress={() => setRememberMe(prev => !prev)}
            text="Remember me"
            size={24}
            color="#000"
            style={{}}
            textStyle={{ fontSize: 14 }}
          />
        </View>

        <View style={styles.forgotContainer}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forgot Password ?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    height: '50%',
    marginTop: 50,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    marginHorizontal: 20,
  },
  heading: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subheading: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  error: { color: 'red', textAlign: 'center', marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 8,
    width: '100%',
  },
  icon: { width: 20, height: 20, marginRight: 8 },
  input: { flex: 1, height: 44, color: '#000' },
  loginButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rememberRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  forgotContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    color: '#000',
    fontSize: 12,
  },
});
