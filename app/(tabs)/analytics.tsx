import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Calendar, TrendingUp, TrendingDown, IndianRupee, Users } from 'lucide-react-native';

interface AnalyticsData {
  totalRevenue: number;
  totalProfit: number;
  totalSales: number;
  totalCustomers: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalProfit: 0,
    totalSales: 0,
    totalCustomers: 0,
    monthlyRevenue: [],
    topProducts: [],
  });
  const [dateRange, setDateRange] = useState('7days');

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!store) return;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Get sales data
      const { data: sales } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              name,
              category
            )
          )
        `)
        .eq('store_id', store.id)
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', endDate.toISOString());

      // Get inventory for profit calculation
      const { data: inventory } = await supabase
        .from('inventory')
        .select(`
          *,
          products (
            name
          )
        `)
        .eq('store_id', store.id);

      if (sales) {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
        
        // Calculate profit (simplified - would need more complex logic for accurate FIFO/LIFO)
        let totalProfit = 0;
        sales.forEach(sale => {
          sale.sale_items.forEach((item: any) => {
            const inventoryItem = inventory?.find(inv => inv.product_id === item.product_id);
            if (inventoryItem) {
              const profit = (item.unit_price - inventoryItem.cost_price) * item.quantity;
              totalProfit += profit;
            }
          });
        });

        // Get unique customers
        const uniqueCustomers = new Set(sales.map(sale => sale.customer_id)).size;

        setAnalytics({
          totalRevenue,
          totalProfit,
          totalSales: sales.length,
          totalCustomers: uniqueCustomers,
          monthlyRevenue: [], // Would implement proper grouping
          topProducts: [], // Would implement top products logic
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const DateRangeButton = ({ range, label }: { range: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.dateButton,
        dateRange === range && styles.activeDateButton,
      ]}
      onPress={() => setDateRange(range)}
    >
      <Text
        style={[
          styles.dateButtonText,
          dateRange === range && styles.activeDateButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const MetricCard = ({ icon, title, value, subtitle, trend }: any) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && (
        <View style={styles.metricSubtitle}>
          {trend === 'up' ? (
            <TrendingUp size={14} color="#22C55E" />
          ) : trend === 'down' ? (
            <TrendingDown size={14} color="#EF4444" />
          ) : null}
          <Text style={styles.metricSubtitleText}>{subtitle}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Calendar size={24} color="#6B7280" />
      </View>

      <View style={styles.dateRangeContainer}>
        <DateRangeButton range="7days" label="7 Days" />
        <DateRangeButton range="30days" label="30 Days" />
        <DateRangeButton range="90days" label="90 Days" />
      </View>

      <View style={styles.metricsContainer}>
        <MetricCard
          icon={<IndianRupee size={24} color="#22C55E" />}
          title="Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString()}`}
          subtitle="Total sales revenue"
        />
        
        <MetricCard
          icon={<TrendingUp size={24} color="#3B82F6" />}
          title="Profit"
          value={`₹${analytics.totalProfit.toLocaleString()}`}
          subtitle="Gross profit earned"
          trend={analytics.totalProfit > 0 ? 'up' : 'down'}
        />
        
        <MetricCard
          icon={<Users size={24} color="#8B5CF6" />}
          title="Customers"
          value={analytics.totalCustomers.toString()}
          subtitle="Unique customers served"
        />
        
        <MetricCard
          icon={<Package size={24} color="#F59E0B" />}
          title="Orders"
          value={analytics.totalSales.toString()}
          subtitle="Total orders processed"
        />
      </View>

      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartTitle}>Revenue Trend</Text>
        <Text style={styles.chartSubtitle}>Chart visualization coming soon</Text>
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
  dateRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeDateButton: {
    backgroundColor: '#22C55E',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeDateButtonText: {
    color: 'white',
  },
  metricsContainer: {
    padding: 24,
    gap: 16,
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  metricSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricSubtitleText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  chartPlaceholder: {
    backgroundColor: 'white',
    margin: 24,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});