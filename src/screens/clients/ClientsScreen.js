import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setClients, setLoading } from '../../redux/slices/clientSlice';
import api from '../../services/api';

export default function ClientsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { list: clients, loading } = useSelector(state => state.clients);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get('/api/clients');
      dispatch(setClients(response.data.clients));
    } catch (error) {
      Alert.alert('Error', 'Failed to load clients');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const renderClient = ({ item }) => (
    <TouchableOpacity style={styles.clientCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
        {item.phone && (
          <Text style={styles.clientPhone}>{item.phone}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.invoiceBtn}
        onPress={() => navigation.navigate('AddInvoice', { client: item })}
      >
        <Text style={styles.invoiceBtnText}>+ Invoice</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddClient')}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {clients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No clients yet</Text>
          <Text style={styles.emptySubtitle}>Add your first client to get started</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('AddClient')}
          >
            <Text style={styles.createBtnText}>Add First Client</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClient}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchClients}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 24, paddingTop: 56,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  addBtn: {
    backgroundColor: '#6C63FF', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  list: { padding: 24, paddingTop: 8 },
  clientCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12,
    padding: 16, marginBottom: 12,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6C63FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 2 },
  clientEmail: { fontSize: 13, color: '#888', marginBottom: 2 },
  clientPhone: { fontSize: 13, color: '#666' },
  invoiceBtn: {
    backgroundColor: '#6C63FF20', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 8,
  },
  invoiceBtnText: { color: '#6C63FF', fontSize: 12, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', marginBottom: 24, textAlign: 'center' },
  createBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});