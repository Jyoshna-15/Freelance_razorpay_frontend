import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import api from '../services/api';

export default function DashboardScreen({ navigation }) {
  const user = useSelector(state => state.auth.user);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/invoices');
      const invoices = response.data.invoices;
      const paid = invoices.filter(i => i.status === 'paid');
      const pending = invoices.filter(i => i.status !== 'paid');
      const revenue = paid.reduce((sum, i) => sum + i.totalAmount, 0);
      setStats({
        totalInvoices: invoices.length,
        paidInvoices: paid.length,
        pendingInvoices: pending.length,
        totalRevenue: revenue,
      });
      setRecentInvoices(invoices.slice(0, 5));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.name}>{user?.name || user?.businessName || 'Freelancer'}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Text style={styles.profileText}>
            {(user?.name || 'U')[0].toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Total Revenue</Text>
        <Text style={styles.revenueAmount}>₹{stats.totalRevenue.toLocaleString()}</Text>
        <Text style={styles.revenueSubtitle}>{stats.paidInvoices} invoices paid</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#6C63FF' }]}>
          <Text style={styles.statNumber}>{stats.totalInvoices}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
          <Text style={styles.statNumber}>{stats.paidInvoices}</Text>
          <Text style={styles.statLabel}>Paid</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
          <Text style={styles.statNumber}>{stats.pendingInvoices}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AddInvoice')}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>New Invoice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AddClient')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>Add Client</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Clients')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>Clients</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Invoices')}
        >
          <Text style={styles.actionIcon}>🧾</Text>
          <Text style={styles.actionText}>Invoices</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Invoices */}
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Recent Invoices</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Invoices')}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>

      {recentInvoices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyText}>No invoices yet</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('AddInvoice')}
          >
            <Text style={styles.createBtnText}>Create First Invoice</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentInvoices.map((invoice) => (
          <TouchableOpacity
            key={invoice._id}
            style={styles.invoiceCard}
            onPress={() => navigation.navigate('InvoiceDetail', { invoice })}
          >
            <View style={styles.invoiceLeft}>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={styles.invoiceClient}>
                {invoice.client?.name || 'Client'}
              </Text>
            </View>
            <View style={styles.invoiceRight}>
              <Text style={styles.invoiceAmount}>
                ₹{invoice.totalAmount.toLocaleString()}
              </Text>
              <View style={[styles.statusBadge,
                { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
                <Text style={[styles.statusText,
                  { color: getStatusColor(invoice.status) }]}>
                  {invoice.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 24, paddingTop: 56,
  },
  greeting: { fontSize: 14, color: '#888' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  profileBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center',
  },
  profileText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  revenueCard: {
    margin: 24, marginTop: 8, padding: 24,
    backgroundColor: '#6C63FF', borderRadius: 20,
  },
  revenueLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  revenueAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
  revenueSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#1A1A1A', padding: 16,
    borderRadius: 12, borderLeftWidth: 3,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', paddingHorizontal: 24, marginBottom: 16 },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1, backgroundColor: '#1A1A1A', padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionText: { fontSize: 11, color: '#888', textAlign: 'center' },
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24, marginBottom: 16,
  },
  seeAll: { color: '#6C63FF', fontSize: 14 },
  invoiceCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#1A1A1A',
    marginHorizontal: 24, marginBottom: 12,
    padding: 16, borderRadius: 12,
  },
  invoiceLeft: {},
  invoiceNumber: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  invoiceClient: { fontSize: 12, color: '#888' },
  invoiceRight: { alignItems: 'flex-end' },
  invoiceAmount: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 16, marginBottom: 20 },
  createBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});   