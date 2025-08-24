import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  useColorScheme,
  Platform
} from 'react-native';
import { Session } from '../types';

interface PaymentModalProps {
  visible: boolean;
  session: Session;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

export default function PaymentModal({ visible, session, onConfirm, onCancel }: PaymentModalProps) {
  const [amount, setAmount] = useState(session.amount?.toString() || '');
  const [error, setError] = useState('');
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F7',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    cardBackground: isDarkMode ? '#2A2A2A' : 'white',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    primaryColor: '#0A84FF',
    errorColor: '#FF453A',
    placeholderColor: isDarkMode ? '#888888' : '#999999',
    modalBg: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
  };

  const handleConfirm = () => {
    // Validate amount
    if (!amount.trim()) {
      setError('Please enter an amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Please enter a valid amount');
      return;
    }

    onConfirm(numAmount);
    setAmount('');
    setError('');
  };

  const handleCancel = () => {
    setAmount('');
    setError('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.modalBg }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.title, { color: theme.textColor }]}>Session Payment</Text>
          
          <Text style={[styles.patientName, { color: theme.textColor }]}>
            Patient: {session.patientName}
          </Text>
          
          <Text style={[styles.sessionDate, { color: theme.textColor }]}>
            Date: {new Date(session.date).toLocaleDateString()} at {session.time}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.textColor }]}>Amount Paid ($)</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: isDarkMode ? '#333333' : 'white',
                  borderColor: error ? theme.errorColor : theme.borderColor,
                  color: theme.textColor
                }
              ]}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor={theme.placeholderColor}
              keyboardType="decimal-pad"
              autoFocus={true}
            />
            {error ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{error}</Text> : null}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: isDarkMode ? '#444444' : '#E5E5EA' }]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: theme.textColor }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: theme.primaryColor }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  patientName: {
    fontSize: 16,
    marginBottom: 5,
  },
  sessionDate: {
    fontSize: 16,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 5,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    marginRight: 5,
  },
  confirmButton: {
    marginLeft: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 