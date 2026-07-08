import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setAuth } from '../redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    email: user?.email || '',
  });

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            dispatch(logout());
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put('/api/auth/profile', form);
      dispatch(setAuth({
        token: await AsyncStorage.getItem('token'),
        user: response.data.user
      }));
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || user?.businessName || 'F')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.name || user?.businessName || 'Freelancer'}
        </Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={form.name}
            onChangeText={text => setForm({ ...form, name: text })}
            editable={editing}
            placeholder="Your name"
            placeholderTextColor="#555"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={form.businessName}
            onChangeText={text => setForm({ ...form, businessName: text })}
            editable={editing}
            placeholder="Your business name"
            placeholderTextColor="#555"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={form.email}
            onChangeText={text => setForm({ ...form, email: text })}
            editable={editing}
            placeholder="your@email.com"
            placeholderTextColor="#555"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {editing && (
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Changes</Text>
            }
          </TouchableOpacity>
        )}
      </View>

      {/* App Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Gateway</Text>
          <Text style={styles.infoValue}>Razorpay ✅</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Backend</Text>
          <Text style={styles.infoValue}>Railway ✅</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 24, paddingTop: 56,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  editBtn: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#6C63FF', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userPhone: { fontSize: 15, color: '#888' },
  form: { padding: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#888', marginBottom: 8 },
  input: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#333',
    padding: 16, color: '#fff', fontSize: 16,
  },
  inputDisabled: { opacity: 0.6 },
  saveBtn: {
    backgroundColor: '#6C63FF', padding: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  infoSection: {
    marginHorizontal: 24, backgroundColor: '#1A1A1A',
    borderRadius: 12, padding: 16, marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
  },
  infoLabel: { color: '#888', fontSize: 15 },
  infoValue: { color: '#fff', fontSize: 15, fontWeight: '500' },
  logoutBtn: {
    marginHorizontal: 24, backgroundColor: '#F4433620',
    borderWidth: 1, borderColor: '#F44336',
    borderRadius: 12, padding: 16, alignItems: 'center',
  },
  logoutText: { color: '#F44336', fontSize: 16, fontWeight: '600' },
});