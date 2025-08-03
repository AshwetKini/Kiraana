import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function IndexScreen() {
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if store is set up
        const { data: store } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (store) {
          router.replace('/(tabs)');
        } else {
          router.replace('/store-setup');
        }
      } else {
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Loading Kiraana...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
});