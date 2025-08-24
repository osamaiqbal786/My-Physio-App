import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { API_BASE_URL } from '../utils/mongoStorage';

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

export default function OTPVerification({ email, onVerificationSuccess, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
    cardBackground: isDarkMode ? '#2A2A2A' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#333333',
    subtitleColor: isDarkMode ? '#BBBBBB' : '#666666',
    inputBackground: isDarkMode ? '#3A3A3A' : '#FAFAFA',
    inputBorder: isDarkMode ? '#444444' : '#DDDDDD',
    placeholderColor: isDarkMode ? '#888888' : '#999999',
    primaryColor: '#0A84FF',
    errorColor: '#FF453A',
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Don't automatically send OTP - user should have received it from signup
  // useEffect(() => {
  //   sendOTP();
  // }, []);

  const sendOTP = async () => {
    setIsSendingOTP(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('OTP Sent', 'Please check your email for the verification code.');
        setCountdown(60); // 60 seconds cooldown
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ OTP verification API call successful');
        // Call the success callback directly
        onVerificationSuccess();
      } else {
        console.log('❌ OTP verification failed:', data.message);
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.title, { color: theme.textColor }]}>Verify Your Email</Text>
        <Text style={[styles.subtitle, { color: theme.subtitleColor }]}>
          We've sent a verification code to:
        </Text>
        <Text style={[styles.email, { color: theme.primaryColor }]}>{email}</Text>

        <View style={styles.otpContainer}>
          <TextInput
            style={[
              styles.otpInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: error ? theme.errorColor : theme.inputBorder,
                color: theme.textColor,
              }
            ]}
            placeholder="Enter 6-digit code"
            placeholderTextColor={theme.placeholderColor}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: theme.errorColor }]}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: theme.primaryColor },
            isLoading && styles.disabledButton
          ]}
          onPress={verifyOTP}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.subtitleColor }]}>
            Didn't receive the code?
          </Text>
          <TouchableOpacity
            onPress={sendOTP}
            disabled={countdown > 0 || isSendingOTP}
            style={countdown > 0 && styles.disabledLink}
          >
            <Text style={[
              styles.resendLink,
              { color: countdown > 0 ? theme.subtitleColor : theme.primaryColor }
            ]}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backButtonText, { color: theme.primaryColor }]}>
            Back to Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpContainer: {
    marginBottom: 20,
  },
  otpInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    marginRight: 4,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabledLink: {
    opacity: 0.5,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
