import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Search, Plus, Phone, Mail, Eye, Package } from 'lucide-react-native';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
}

export default function SuppliersScreen() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSuppliers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!store) return;

      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('*')
        .eq('store_id', store.id)
        .order('name');

      if (suppliers) {
        setSuppliers(suppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.includes(searchQuery)
  );

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <View style={styles.supplierCard}>
      <View style={styles.supplierInfo}>
        <Text style={styles.supplierName}>{supplier.name}</Text>
        <View style={styles.supplierDetails}>
          <Phone size={14} color="#6B7280" />
          <Text style={styles.supplierPhone}>{supplier.phone}</Text>
        </View>
        {supplier.email && (
          <View style={styles.supplierDetails}>
            <Mail size={14} color="#6B7280" />
            <Text style={styles.supplierEmail}>{supplier.email}</Text>
          </View>
        )}
      </View>
      <View style={styles.supplierActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/suppliers/${supplier.id}`)}
        >
          <Eye size={16} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/purchases/new?supplierId=${supplier.id}`)}
        >
          <Package size={16} color="#22C55E" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suppliers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/suppliers/add')}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search suppliers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredSuppliers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SupplierCard supplier={item} />}
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
  supplierCard: {
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
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  supplierDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  supplierPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  supplierEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  supplierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
});