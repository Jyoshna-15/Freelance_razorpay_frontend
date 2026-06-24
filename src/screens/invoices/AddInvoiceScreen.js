import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addInvoice } from '../../redux/slices/invoiceSlice';
import api from '../../services/api';

export default function AddInvoiceScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const clients = useSelector(state => state.clients.list);
  const preselectedClient = route.params?.client;

  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(preselectedClient || null);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([
    { description: '', quantity: '1', rate: '', amount: 0 }
  ]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = qty * rate;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: '1', rate: '', amount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async () => {
    if (!selectedClient) {
      Alert.alert('Error', 'Please select a client');
      return;
    }
    if (items.some(item => !item.description || !item.rate)) {
      Alert.alert('Error', 'Fill all item details');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/invoices', {
        client: selectedClient._id,
        items: items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          amount: item.amount,
        })),
        totalAmount,
        dueDate: dueDate || undefined,
        status: 'draft',
      });
      dispatch(addInvoice(response.data.invoice));
      Alert.alert('Success', 'Invoice created!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Invoice</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.form}>
          {/* Client Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowClientPicker(!showClientPicker)}
            >
              <Text style={selectedClient ? styles.selectorText : styles.selectorPlaceholder}>
                {selectedClient ? selectedClient.name : 'Select a client'}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>

            {showClientPicker && (
              <View style={styles.clientPicker}>
                {clients.length === 0 ? (
                  <TouchableOpacity
                    style={styles.clientPickerItem}
                    onPress={() => {
                      setShowClientPicker(false);
                      navigation.navigate('AddClient');
                    }}
                  >
                    <Text style={styles.clientPickerText}>
                      + Add a client first
                    </Text>
                  </TouchableOpacity>
                ) : (
                  clients.map(client => (
                    <TouchableOpacity
                      key={client._id}
                      style={styles.clientPickerItem}
                      onPress={() => {
                        setSelectedClient(client);
                        setShowClientPicker(false);
                      }}
                    >
                      <Text style={styles.clientPickerText}>{client.name}</Text>
                      <Text style={styles.clientPickerEmail}>{client.email}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#555"
              value={dueDate}
              onChangeText={setDueDate}
            />
          </View>

          {/* Items */}
          <Text style={styles.label}>Invoice Items *</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Item {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Text style={styles.removeBtn}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Description (e.g. Logo Design)"
                placeholderTextColor="#555"
                value={item.description}
                onChangeText={text => updateItem(index, 'description', text)}
              />

              <View style={styles.itemRow}>
                <View style={styles.itemHalf}>
                  <Text style={styles.smallLabel}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={text => updateItem(index, 'quantity', text)}
                  />
                </View>
                <View style={styles.itemHalf}>
                  <Text style={styles.smallLabel}>Rate (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5000"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={item.rate}
                    onChangeText={text => updateItem(index, 'rate', text)}
                  />
                </View>
              </View>

              <Text style={styles.itemAmount}>
                Amount: ₹{item.amount.toLocaleString()}
              </Text>
            </View>
          ))}

          <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
            <Text style={styles.addItemBtnText}>+ Add Another Item</Text>
          </TouchableOpacity>

          {/* Total */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Create Invoice</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  form: { padding: 24 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14, color: '#888',
    marginBottom: 8, fontWeight: '500',
  },
  smallLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  input: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#333',
    padding: 16, color: '#fff', fontSize: 16, marginBottom: 8,
  },
  selector: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#333', padding: 16,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  selectorText: { color: '#fff', fontSize: 16 },
  selectorPlaceholder: { color: '#555', fontSize: 16 },
  selectorArrow: { color: '#888' },
  clientPicker: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#333', marginTop: 4,
  },
  clientPickerItem: {
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
  },
  clientPickerText: { color: '#fff', fontSize: 15 },
  clientPickerEmail: { color: '#888', fontSize: 12, marginTop: 2 },
  itemCard: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    padding: 16, marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemTitle: { color: '#6C63FF', fontWeight: '600' },
  removeBtn: { color: '#F44336', fontSize: 13 },
  itemRow: { flexDirection: 'row', gap: 12 },
  itemHalf: { flex: 1 },
  itemAmount: {
    color: '#4CAF50', fontSize: 14,
    fontWeight: '600', marginTop: 4,
  },
  addItemBtn: {
    borderWidth: 1, borderColor: '#6C63FF', borderStyle: 'dashed',
    borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20,
  },
  addItemBtnText: { color: '#6C63FF', fontSize: 15, fontWeight: '600' },
  totalCard: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    padding: 20, flexDirection: 'row',
    justifyContent: 'space-between', marginBottom: 20,
  },
  totalLabel: { fontSize: 18, color: '#888', fontWeight: '500' },
  totalAmount: { fontSize: 24, color: '#6C63FF', fontWeight: 'bold' },
  button: {
    backgroundColor: '#6C63FF', padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});