import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setInvoices, setLoading } from '../../redux/slices/invoiceSlice';
import api from '../../services/api';

export default function InvoicesScreen({ navigation }) {
  const dispatch = useDispatch();
  const { list: invoices, loading } = useSelector(state => state.invoices);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get('/api/invoices');
      dispatch(setInvoices(response.data.invoices));
    } catch (error) {
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'sent': return '#2196F3';
      case 'overdue': return '#F44336';
      default: return '#FF9800';
    }
  };

  const renderInvoice = ({ item }) => (
    <TouchableOpacity
      style={styles.invoiceCard}
      onPress={() => navigation.navigate('InvoiceDetail', { invoice: item })}
    >
      <View style={styles.invoiceLeft}>
        <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
        <Text style={styles.clientName}>{item.client?.name || 'Client'}</Text>
        <Text style={styles.dueDate}>
          Due: {item.dueDate
            ? new Date(item.dueDate).toLocaleDateString()
            : 'No due date'}
        </Text>
      </View>
      <View style={styles.invoiceRight}>
        <Text style={styles.amount}>₹{item.totalAmount.toLocaleString()}</Text>
        <View style={[styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText,
            { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
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
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddInvoice')}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {invoices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🧾</Text>
          <Text style={styles.emptyTitle}>No invoices yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first invoice to get paid
          </Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('AddInvoice')}
          >
            <Text style={styles.createBtnText}>Create Invoice</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderInvoice}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchInvoices}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  loadingContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#0A0A0A'
  },
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
  invoiceCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#1A1A1A',
    borderRadius: 12, padding: 16, marginBottom: 12,
  },
  invoiceLeft: { flex: 1 },
  invoiceNumber: {
    fontSize: 15, fontWeight: '600',
    color: '#fff', marginBottom: 4,
  },
  clientName: { fontSize: 13, color: '#888', marginBottom: 4 },
  dueDate: { fontSize: 12, color: '#555' },
  invoiceRight: { alignItems: 'flex-end' },
  amount: {
    fontSize: 18, fontWeight: 'bold',
    color: '#fff', marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusText: {
    fontSize: 11, fontWeight: '600', textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20, fontWeight: 'bold',
    color: '#fff', marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14, color: '#888',
    marginBottom: 24, textAlign: 'center',
  },
  createBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});