import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Gift } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const checkSubscriptionStatus = async (userId: string) => {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return false;
    }

    const now = new Date();
    const trialEnd = new Date(subscription.trial_end);
    const subscriptionEnd = subscription.subscription_end 
      ? new Date(subscription.subscription_end) 
      : null;

    // Check if trial is still active
    if (now <= trialEnd) {
      return true;
    }

    // Check if subscription is active
    if (subscriptionEnd && now <= subscriptionEnd) {
      return true;
    }

    return false;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (data.user) {
        // Check subscription status
        const hasActiveSubscription = await checkSubscriptionStatus(data.user.id);
        
        if (!hasActiveSubscription) {
          setShowCouponModal(true);
          return;
        }

        // Check if store is set up
        const { data: store } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (!store) {
          router.replace('/store-setup');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCouponSubmit = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      // Check if coupon is valid
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (!coupon) {
        Alert.alert('Error', 'Invalid or expired coupon code');
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update subscription
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + coupon.days);

      await supabase
        .from('user_subscriptions')
        .update({
          subscription_end: subscriptionEnd.toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      setShowCouponModal(false);
      setCouponCode('');

      // Check if store is set up
      const { data: store } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!store) {
        router.replace('/store-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (showCouponModal) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.couponModal}>
            <Gift size={48} color="#22C55E" style={styles.couponIcon} />
            <Text style={styles.couponTitle}>Trial Expired</Text>
            <Text style={styles.couponSubtitle}>
              Enter a coupon code to continue using Kiraana
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCouponSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Validating...' : 'Activate'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowCouponModal(false);
                supabase.auth.signOut();
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your Kiraana account</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkHighlight}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 40,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: '#6B7280',
  },
  linkHighlight: {
    color: '#22C55E',
    fontWeight: '600',
  },
  couponModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    margin: 20,
  },
  couponIcon: {
    marginBottom: 16,
  },
  couponTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  couponSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  cancelButton: {
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
});