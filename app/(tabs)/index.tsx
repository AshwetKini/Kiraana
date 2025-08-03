import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import {
  IndianRupee,
  TrendingUp,
  Users,
  ShoppingBag,
  Bell,
  Plus,
  UserPlus,
  Truck,
  Package,
} from 'lucide-react-native';

interface DashboardStats {
  totalRevenue: number;
  todaysSales: number;
  totalCustomers: number;
  totalOrders: number;
  pendingPayments: number;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todaysSales: 0,
    totalCustomers: 0,
    totalOrders: 0,
    pendingPayments: 0,
  });
  const [storeName, setStoreName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get store info
      const { data: store } = await supabase
        .from('stores')
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (store) {
        setStoreName(store.name);
      }

      // Get total revenue
      const { data: totalRevenue } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('store_id', store?.id || '');

      // Get today's sales
      const today = new Date().toISOString().split('T')[0];
      const { data: todaysSales } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('store_id', store?.id || '')
        .gte('sale_date', today);

      // Get total customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store?.id || '');

      // Get total orders
      const { count: ordersCount } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store?.id || '');

      // Get pending payments
      const { data: pendingPayments } = await supabase
        .from('sales')
        .select('total_amount, paid_amount')
        .eq('store_id', store?.id || '')
        .in('payment_status', ['pending', 'partial']);

      const totalRev = totalRevenue?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const todaySales = todaysSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const pendingAmount = pendingPayments?.reduce(
        (sum, sale) => sum + (sale.total_amount - sale.paid_amount),
        0
      ) || 0;

      setStats({
        totalRevenue: totalRev,
        todaysSales: todaySales,
        totalCustomers: customersCount || 0,
        totalOrders: ordersCount || 0,
        pendingPayments: pendingAmount,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ icon, title, value, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        {icon}
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={styles.statCardValue}>
        {title.includes('Revenue') || title.includes('Sales') || title.includes('Pending')
          ? `₹${value.toLocaleString()}`
          : value.toLocaleString()}
      </Text>
    </View>
  );

  const QuickActionButton = ({ icon, title, onPress, color }: any) => (
    <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: color }]} onPress={onPress}>
      {icon}
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.storeName}>{storeName}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          icon={<IndianRupee size={24} color="#22C55E" />}
          title="Total Revenue"
          value={stats.totalRevenue}
          color="#22C55E"
        />
        <StatCard
          icon={<TrendingUp size={24} color="#3B82F6" />}
          title="Today's Sales"
          value={stats.todaysSales}
          color="#3B82F6"
        />
        <StatCard
          icon={<Users size={24} color="#8B5CF6" />}
          title="Customers"
          value={stats.totalCustomers}
          color="#8B5CF6"
        />
        <StatCard
          icon={<ShoppingBag size={24} color="#F59E0B" />}
          title="Orders"
          value={stats.totalOrders}
          color="#F59E0B"
        />
      </View>

      {stats.pendingPayments > 0 && (
        <View style={styles.alertCard}>
          <Bell size={20} color="#EF4444" />
          <Text style={styles.alertText}>
            ₹{stats.pendingPayments.toLocaleString()} pending from customers
          </Text>
        </View>
      )}

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            icon={<UserPlus size={24} color="white" />}
            title="Add Customer"
            onPress={() => router.push('/customers/add')}
            color="#22C55E"
          />
          <QuickActionButton
            icon={<Truck size={24} color="white" />}
            title="Add Supplier"
            onPress={() => router.push('/suppliers/add')}
            color="#3B82F6"
          />
          <QuickActionButton
            icon={<Package size={24} color="white" />}
            title="Add Item"
            onPress={() => router.push('/inventory/add')}
            color="#8B5CF6"
          />
          <QuickActionButton
            icon={<Plus size={24} color="white" />}
            title="New Sale"
            onPress={() => router.push('/sales/new')}
            color="#F59E0B"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  storeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  statsContainer: {
    padding: 24,
    gap: 16,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    marginBottom: 24,
  },
  alertText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  quickActionsContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});