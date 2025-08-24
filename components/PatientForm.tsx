import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, useColorScheme } from 'react-native';
import { savePatient, updatePatient } from '../utils/mongoStorage';
import { Patient } from '../types';

interface PatientFormProps {
  existingPatient?: Patient;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
}

export default function PatientForm({ existingPatient, onSave, onCancel }: PatientFormProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F7',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    inputBackground: isDarkMode ? '#333333' : 'white',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    buttonBackground: isDarkMode ? '#444444' : '#0A84FF',
    saveButtonBackground: '#0A84FF',
    cancelButtonBackground: isDarkMode ? '#444444' : '#E5E5EA',
    buttonTextColor: 'white',
    errorColor: '#FF453A',
  };

  const [name, setName] = useState(existingPatient?.name || '');
  const [contactNumber, setContactNumber] = useState(existingPatient?.contactNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; contactNumber?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; contactNumber?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Patient name is required';
    }
    
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\+?[0-9\s-()]{8,15}$/.test(contactNumber.trim())) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (existingPatient) {
        const updatedPatientData: Patient = {
          ...existingPatient,
          name: name.trim(),
          contactNumber: contactNumber.trim(),
        };
        
        await updatePatient(updatedPatientData);
        onSave(updatedPatientData);
      } else {
        const newPatient = await savePatient({
          name: name.trim(),
          contactNumber: contactNumber.trim(),
        });
        
        onSave(newPatient);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save patient information');
      console.error('Error saving patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>
        {existingPatient ? 'Edit Patient' : 'Add New Patient'}
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textColor }]}>Patient Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor }, errors.name ? styles.inputError : null]}
          value={name}
          onChangeText={setName}
          placeholder="Enter patient name"
          autoCapitalize="words"
          placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
        />
        {errors.name ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.name}</Text> : null}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textColor }]}>Contact Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor }, errors.contactNumber ? styles.inputError : null]}
          value={contactNumber}
          onChangeText={setContactNumber}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
          placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
        />
        {errors.contactNumber ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.contactNumber}</Text> : null}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.cancelButtonBackground }]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.saveButtonBackground }, isSubmitting ? styles.disabledButton : null]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>
            {isSubmitting ? 'Saving...' : existingPatient ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
