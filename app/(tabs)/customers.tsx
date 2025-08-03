import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { Search, UserPlus, Phone, Mail, Plus, Eye } from 'lucide-react-native';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
}

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!store) return;

      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', store.id)
        .order('name');

      if (customers) {
        setCustomers(customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const importContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant contacts permission to import');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      if (data.length > 0) {
        router.push({
          pathname: '/customers/import',
          params: { contacts: JSON.stringify(data) },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import contacts');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <View style={styles.customerDetails}>
          <Phone size={14} color="#6B7280" />
          <Text style={styles.customerPhone}>{customer.phone}</Text>
        </View>
        {customer.email && (
          <View style={styles.customerDetails}>
            <Mail size={14} color="#6B7280" />
            <Text style={styles.customerEmail}>{customer.email}</Text>
          </View>
        )}
      </View>
      <View style={styles.customerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/customers/${customer.id}`)}
        >
          <Eye size={16} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/sales/new?customerId=${customer.id}`)}
        >
          <Plus size={16} color="#22C55E" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.importButton} onPress={importContacts}>
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/customers/add')}
          >
            <UserPlus size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CustomerCard customer={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  importButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  importButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#22C55E',
    padding: 12,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#1F2937',
  },
  listContainer: {
    padding: 24,
    paddingTop: 0,
  },
  customerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
});