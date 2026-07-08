import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Alert.alert('Error', 'Enter a valid 10 digit phone number');
      return;
    }
    setLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
      navigation.navigate('OTP', { phone: `+91${phone}`, confirmation });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💼</Text>
          <Text style={styles.appName}>FreelancePay</Text>
          <Text style={styles.tagline}>Invoice & Payment Manager</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Enter your phone number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="9999999999"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Send OTP →</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  tagline: { fontSize: 14, color: '#888' },
  form: { marginBottom: 32 },
  label: { fontSize: 16, color: '#fff', marginBottom: 12, fontWeight: '500' },
  phoneInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#333', marginBottom: 16,
  },
  countryCode: {
    paddingHorizontal: 16, paddingVertical: 16,
    borderRightWidth: 1, borderColor: '#333',
  },
  countryCodeText: { color: '#fff', fontSize: 16 },
  phoneInput: {
    flex: 1, paddingHorizontal: 16,
    paddingVertical: 16, color: '#fff', fontSize: 16,
  },
  button: {
    backgroundColor: '#6C63FF', padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  footer: { textAlign: 'center', color: '#555', fontSize: 12 },
});