import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/(auth)/login');
          return;
        }

        // Check subscription status
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (!subscription) {
          router.replace('/(auth)/login');
          return;
        }

        const now = new Date();
        const trialEnd = new Date(subscription.trial_end);
        const subscriptionEnd = subscription.subscription_end 
          ? new Date(subscription.subscription_end) 
          : null;

        const hasActiveAccess = 
          now <= trialEnd || (subscriptionEnd && now <= subscriptionEnd);

        if (!hasActiveAccess) {
          router.replace('/(auth)/login');
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});