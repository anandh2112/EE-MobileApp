import React from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Video from 'react-native-video';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

export default function LoginScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();

  if (!fontsLoaded) {
    return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleLogin = () => {
    if (email === 'u' && password === 'p') {
      router.replace('/(tabs)');
    } else {
      setError('Invalid credentials');
    }
  };

  const { width } = Dimensions.get('window');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        {/* <Video
          source={require('../assets/videos/loginscreen-vid.mp4')}
          style={[styles.hero, { width }]}
          repeat
          muted
          paused={false}
          resizeMode="cover"
          ignoreSilentSwitch="obey"
        /> */}

        <View style={styles.blurWrapper}>
          <BlurView intensity={50} tint="light" style={styles.blurView}>
            <View style={styles.formContainer}>
              <Text style={[styles.heading, { fontFamily: 'Poppins_700Bold' }]}>Elements Dashboard</Text>
              <Text style={[styles.subheading, { fontFamily: 'Poppins_400Regular' }]}>Sign in to continue.</Text>

              {error ? <Text style={[styles.error, { fontFamily: 'Poppins_400Regular' }]}>{error}</Text> : null}

              <View style={styles.inputWrapper}>
                <Image source={require('../assets/images-user/email.png')} style={styles.icon} />
                <TextInput
                  style={[styles.input, { fontFamily: 'Poppins_400Regular' }]}
                  placeholder="Mail Id"
                  placeholderTextColor="#000"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Image source={require('../assets/images-user/password.png')} style={styles.icon} />
                <TextInput
                  style={[styles.input, { fontFamily: 'Poppins_400Regular' }]}
                  placeholder="Password"
                  placeholderTextColor="#000"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Image
                    source={
                      showPassword
                        ? require('../assets/images-user/eye-open.png')
                        : require('../assets/images-user/eye-closed.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={[styles.loginButtonText, { fontFamily: 'Poppins_700Bold' }]}>Login</Text>
              </TouchableOpacity>

              <View style={styles.forgotContainer}>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={[styles.forgotText, { fontFamily: 'Poppins_400Regular' }]}>Forgot Password ?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ...styles remain the same ...

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  hero: { 
    height: '50%',
    marginTop: 50,
  },
  blurWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: { 
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.33)',
    borderRadius: 20,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  heading: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subheading: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  error: { color: 'red', textAlign: 'center', marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 8,
    width: '100%'
  },
  icon: { width: 25, height: 25, marginRight: 8 },
  input: { flex: 1, height: 44, color: '#000' },
  eyeIcon: { width: 22, height: 22, marginLeft: 8, tintColor: '#888' },
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
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
