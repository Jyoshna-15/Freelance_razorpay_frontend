import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Modal
} from 'react-native';
import { useDispatch } from 'react-redux';
import { updateInvoice } from '../../redux/slices/invoiceSlice';
import { WebView } from 'react-native-webview';
import api from '../../services/api';

const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

export default function InvoiceDetailScreen({ route, navigation }) {
  const { invoice: initialInvoice } = route.params;
  const [invoice, setInvoice] = useState(initialInvoice);
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [order, setOrder] = useState(null);
  const dispatch = useDispatch();

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'sent': return '#2196F3';
      case 'overdue': return '#F44336';
      default: return '#FF9800';
    }
  };

  const handleSendInvoice = async () => {
    try {
      const response = await api.put(`/api/invoices/${invoice._id}`, {
        status: 'sent'
      });
      const updated = response.data.invoice;
      setInvoice(updated);
      dispatch(updateInvoice(updated));
      Alert.alert('Success', 'Invoice marked as sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update invoice');
    }
  };

//   const handlePayment = async () => {
//     setLoading(true);
//     try {
//       const response = await api.post('/api/payments/create-order', {
//         invoiceId: invoice._id
//       });
//       setOrder(response.data.order);
//       setShowWebView(true);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to initiate payment');
//     } finally {
//       setLoading(false);
//     }
//   };

const handlePayment = async () => {
  setLoading(true);
  try {
    console.log('Invoice ID:', invoice._id);
    console.log('Invoice Amount:', invoice.totalAmount);
    
    const response = await api.post('/api/payments/create-order', {
      invoiceId: invoice._id
    });
    
    console.log('Order Response:', response.data);
    setOrder(response.data.order);
    setShowWebView(true);
  } catch (error) {
    console.log('Payment Error:', error.response?.data || error.message);
    Alert.alert('Error', error.response?.data?.message || 'Failed to initiate payment');
  } finally {
    setLoading(false);
  }
};

  const getRazorpayHTML = (order) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body style="margin:0;padding:0;background:#000;">
    <script>
      var options = {
        key: '${RAZORPAY_KEY}',
        amount: '${order.amount}',
        currency: 'INR',
        name: 'FreelancePay',
        order_id: '${order.id}',
        description: 'Invoice Payment',
        theme: { color: '#6C63FF' },
        handler: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            success: true,
            data: response
          }));
        }
      };
      var rzp = new Razorpay(options);
      rzp.on('payment.failed', function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          success: false,
          error: response.error.description
        }));
      });
      rzp.open();
    </script>
    </body>
    </html>
  `;

  const handlePaymentMessage = async (event) => {
    const response = JSON.parse(event.nativeEvent.data);
    setShowWebView(false);

    if (response.success) {
      try {
        await api.post('/api/payments/verify', {
          ...response.data,
          invoiceId: invoice._id,
        });
        const updated = { ...invoice, status: 'paid' };
        setInvoice(updated);
        dispatch(updateInvoice(updated));
        Alert.alert('✅ Payment Successful!',
          `Payment ID: ${response.data.razorpay_payment_id}`);
      } catch {
        Alert.alert('Error', 'Payment verification failed');
      }
    } else {
      Alert.alert('❌ Payment Failed', response.error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Invoice Detail</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Invoice Card */}
        <View style={styles.invoiceCard}>
          <View style={styles.invoiceTop}>
            <View>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                {new Date(invoice.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={[styles.statusBadge,
              { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
              <Text style={[styles.statusText,
                { color: getStatusColor(invoice.status) }]}>
                {invoice.status}
              </Text>
            </View>
          </View>

          {/* Client Info */}
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Bill To</Text>
          <Text style={styles.clientName}>{invoice.client?.name}</Text>
          <Text style={styles.clientEmail}>{invoice.client?.email}</Text>

          {/* Items */}
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Items</Text>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemQty}>
                  {item.quantity} × ₹{item.rate?.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.itemAmount}>
                ₹{item.amount?.toLocaleString()}
              </Text>
            </View>
          ))}

          {/* Total */}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              ₹{invoice.totalAmount?.toLocaleString()}
            </Text>
          </View>

          {/* Due Date */}
          {invoice.dueDate && (
            <Text style={styles.dueDate}>
              Due: {new Date(invoice.dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {invoice.status === 'draft' && (
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSendInvoice}
            >
              <Text style={styles.sendBtnText}>📤 Mark as Sent</Text>
            </TouchableOpacity>
          )}

          {invoice.status !== 'paid' && (
            <TouchableOpacity
              style={[styles.payBtn, loading && { opacity: 0.7 }]}
              onPress={handlePayment}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.payBtnText}>💳 Collect Payment</Text>
              }
            </TouchableOpacity>
          )}

          {invoice.status === 'paid' && (
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>✅ Payment Received</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Razorpay WebView */}
      <Modal visible={showWebView} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {order && (
            <WebView
              source={{ html: getRazorpayHTML(order) }}
              onMessage={handlePaymentMessage}
              javaScriptEnabled
            />
          )}
          <TouchableOpacity
            style={styles.cancelPayment}
            onPress={() => setShowWebView(false)}
          >
            <Text style={styles.cancelPaymentText}>✕ Cancel Payment</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 24, paddingTop: 56,
  },
  backText: { color: '#6C63FF', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  invoiceCard: {
    backgroundColor: '#1A1A1A', margin: 24,
    borderRadius: 16, padding: 20,
  },
  invoiceTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  invoiceNumber: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  invoiceDate: { fontSize: 13, color: '#888', marginTop: 4 },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  statusText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  divider: {
    height: 1, backgroundColor: '#2A2A2A', marginVertical: 16,
  },
  sectionLabel: { fontSize: 12, color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  clientName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  clientEmail: { fontSize: 14, color: '#888' },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  itemLeft: { flex: 1 },
  itemDescription: { fontSize: 15, color: '#fff', marginBottom: 2 },
  itemQty: { fontSize: 13, color: '#888' },
  itemAmount: { fontSize: 15, fontWeight: '600', color: '#fff' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: 16, color: '#888' },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#6C63FF' },
  dueDate: { fontSize: 13, color: '#F44336', marginTop: 12 },
  actions: { paddingHorizontal: 24, gap: 12 },
  sendBtn: {
    backgroundColor: '#1A1A1A', borderWidth: 1,
    borderColor: '#2196F3', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  sendBtnText: { color: '#2196F3', fontSize: 16, fontWeight: '600' },
  payBtn: {
    backgroundColor: '#6C63FF', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  paidBadge: {
    backgroundColor: '#4CAF5020', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  paidText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  cancelPayment: {
    padding: 16, alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  cancelPaymentText: { color: '#F44336', fontSize: 16, fontWeight: '600' },
});