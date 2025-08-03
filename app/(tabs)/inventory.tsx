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
import { Search, Plus, Package, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  cost_price: number;
  products: {
    name: string;
    category: string;
    unit: string;
    selling_price: number;
  };
}

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInventory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!store) return;

      const { data: inventory } = await supabase
        .from('inventory')
        .select(`
          *,
          products (
            name,
            category,
            unit,
            selling_price
          )
        `)
        .eq('store_id', store.id)
        .order('products(name)');

      if (inventory) {
        setInventory(inventory);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.products.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchInventory();
  }, []);

  const InventoryCard = ({ item }: { item: InventoryItem }) => {
    const profit = item.products.selling_price - item.cost_price;
    const profitMargin = ((profit / item.cost_price) * 100).toFixed(1);
    const totalValue = item.quantity * item.cost_price;
    const isLowStock = item.quantity < 10;

    return (
      <View style={[styles.inventoryCard, isLowStock && styles.lowStockCard]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.products.name}</Text>
            <Text style={styles.itemCategory}>{item.products.category}</Text>
          </View>
          {isLowStock && <AlertTriangle size={20} color="#EF4444" />}
        </View>
        
        <View style={styles.itemStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Stock</Text>
            <Text style={[styles.statValue, isLowStock && styles.lowStockText]}>
              {item.quantity} {item.products.unit}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cost Price</Text>
            <Text style={styles.statValue}>₹{item.cost_price}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Selling Price</Text>
            <Text style={styles.statValue}>₹{item.products.selling_price}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Profit Margin</Text>
            <Text style={[styles.statValue, { color: profit > 0 ? '#22C55E' : '#EF4444' }]}>
              {profitMargin}%
            </Text>
          </View>
        </View>
        
        <View style={styles.itemFooter}>
          <Text style={styles.totalValue}>Total Value: ₹{totalValue.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/inventory/add')}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredInventory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InventoryCard item={item} />}
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
  inventoryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  lowStockText: {
    color: '#EF4444',
  },
  itemFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});