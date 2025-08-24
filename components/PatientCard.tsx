import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Patient } from '../types';
import { CreditCard as Edit, Trash2, Calendar } from 'lucide-react-native';

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onAddSession: (patientId: string) => void;
  onViewSessions: (patientId: string) => void;
}

export default function PatientCard({ patient, onEdit, onDelete, onAddSession, onViewSessions }: PatientCardProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#2A2A2A' : 'white',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    cardBackground: isDarkMode ? '#3C3C3C' : 'white',
    contactLabelColor: isDarkMode ? '#888888' : '#8E8E93',
    buttonBackgroundColor: isDarkMode ? '#444444' : '#F2F2F7',
    buttonTextColor: 'white',
    primaryButtonColor: '#0A84FF',
    secondaryButtonColor: '#5856D6',
    iconButtonColor: isDarkMode ? '#FFFFFF' : '#000000',
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.patientName, { color: theme.textColor }]}>{patient.name}</Text>
          <Text style={[styles.patientId, { color: theme.contactLabelColor }]}>
            ID: {patient.id ? patient.id.substring(0, 8) : 'N/A'}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => onEdit(patient)}
          >
            <Edit size={20} color={theme.iconButtonColor} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => onDelete(patient.id || '')}
          >
            <Trash2 size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.contactContainer}>
        <Text style={[styles.contactLabel, { color: theme.contactLabelColor }]}>Contact:</Text>
        <Text style={[styles.contactNumber, { color: theme.textColor }]}>{patient.contactNumber}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primaryButtonColor }]}
          onPress={() => onAddSession(patient.id || '')}
        >
          <Calendar size={16} color={theme.buttonTextColor} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Add Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.secondaryButtonColor }]}
          onPress={() => onViewSessions(patient.id || '')}
        >
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>View Sessions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientId: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactLabel: {
    marginRight: 5,
  },
  contactNumber: {
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
