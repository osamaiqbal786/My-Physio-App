import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal, 
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveSession, updateSession, getCurrentUserPatients } from '../utils/mongoStorage';
import { Session, Patient } from '../types';
import { scheduleSessionNotification } from '../utils/notifications';

interface SessionFormProps {
  existingSession?: Session;
  preselectedPatientId?: string;
  onSave: (session: Session) => void;
  onCancel: () => void;
}

export default function SessionForm({ existingSession, preselectedPatientId, onSave, onCancel }: SessionFormProps) {
  // Get the device color scheme
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Create theme object based on the color scheme
  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : 'white',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    inputBackground: isDarkMode ? '#2A2A2A' : 'white',
    primaryColor: '#0A84FF',
    errorColor: '#FF453A',
    cancelButtonBg: isDarkMode ? '#444444' : '#E5E5EA',
    modalBg: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    separatorColor: isDarkMode ? '#333333' : '#EFEFEF',
    placeholderColor: isDarkMode ? '#888888' : '#999999',
  };

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(existingSession?.patientId || preselectedPatientId || '');
  const [date, setDate] = useState(existingSession ? new Date(existingSession.date) : new Date());
  const [time, setTime] = useState(existingSession ? new Date(`2000-01-01T${existingSession.time}`) : new Date());
  const [notes, setNotes] = useState(existingSession?.notes || '');
  const [amount, setAmount] = useState(existingSession?.amount !== undefined ? existingSession.amount.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ patientId?: string; date?: string; time?: string; amount?: string }>({});
  
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const patientsList = await getCurrentUserPatients();
      setPatients(patientsList);
      
      // If there's only one patient and no patient is selected, select it automatically
      if (patientsList.length === 1 && !patientId) {
        setPatientId(patientsList[0].id);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { patientId?: string; date?: string; time?: string; amount?: string } = {};
    
    if (!patientId) {
      newErrors.patientId = 'Please select a patient';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTimeForDisplay = (timeDate: Date): string => {
    return timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeForStorage = (timeDate: Date): string => {
    return timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDateForDisplay = (dateObj: Date): string => {
    return dateObj.toLocaleDateString();
  };

  const formatDateForStorage = (dateObj: Date): string => {
    // Create a new date object to avoid timezone issues
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const getPatientNameById = (id: string): string => {
    const patient = patients.find(p => p.id === id);
    return patient ? patient.name : '';
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const patientName = getPatientNameById(patientId);
      const formattedDate = formatDateForStorage(date);
      const formattedTime = formatTimeForStorage(time);
      
      if (existingSession) {
        const updatedSessionData: Session = {
          ...existingSession,
          patientId,
          patientName,
          date: formattedDate,
          time: formattedTime,
          notes,
        };
        
        // Add amount if provided
        if (amount.trim()) {
          updatedSessionData.amount = parseFloat(amount);
        } else {
          updatedSessionData.amount = undefined;
        }
        
        await updateSession(updatedSessionData);
        
        // Schedule notification for the updated session
        await scheduleSessionNotification(updatedSessionData);
        
        onSave(updatedSessionData);
      } else {
        // The saveSession function now handles adding the userId internally
        // We're using Omit<Session, 'id' | 'createdAt' | 'userId'> because userId is added by saveSession
        const sessionData: Omit<Session, 'id' | 'createdAt' | 'userId'> = {
          patientId,
          patientName,
          date: formattedDate,
          time: formattedTime,
          notes,
          completed: false,
        };
        
        // Add amount if provided
        if (amount.trim()) {
          sessionData.amount = parseFloat(amount);
        }
        
        const newSession = await saveSession(sessionData);
        
        // Schedule notification for the new session
        await scheduleSessionNotification(newSession);
        
        onSave(newSession);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save session information');
      console.error('Error saving session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the date picker based on platform
  const renderDateTimePicker = () => {
    if (Platform.OS === 'ios') {
      // iOS uses modal approach for both pickers
      return (
        <>
          {showDatePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
            >
              <View style={[styles.modalContainer, { backgroundColor: theme.modalBg }]}>
                <View style={[styles.datePickerContainer, { backgroundColor: theme.backgroundColor }]}>
                  <View style={[styles.datePickerHeader, { borderBottomColor: theme.separatorColor }]}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={[styles.datePickerCancelText, { color: theme.errorColor }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={[styles.datePickerDoneText, { color: theme.primaryColor }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    style={styles.datePicker}
                    textColor={theme.textColor}
                    themeVariant={isDarkMode ? 'dark' : 'light'}
                  />
                </View>
              </View>
            </Modal>
          )}
          
          {showTimePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showTimePicker}
            >
              <View style={[styles.modalContainer, { backgroundColor: theme.modalBg }]}>
                <View style={[styles.datePickerContainer, { backgroundColor: theme.backgroundColor }]}>
                  <View style={[styles.datePickerHeader, { borderBottomColor: theme.separatorColor }]}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={[styles.datePickerCancelText, { color: theme.errorColor }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setShowTimePicker(false)}
                    >
                      <Text style={[styles.datePickerDoneText, { color: theme.primaryColor }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    style={styles.datePicker}
                    textColor={theme.textColor}
                    themeVariant={isDarkMode ? 'dark' : 'light'}
                  />
                </View>
              </View>
            </Modal>
          )}
        </>
      );
    } else {
      // Android uses the default dialog but needs theme variant
      return (
        <>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
              themeVariant={isDarkMode ? 'dark' : 'light'}
            />
          )}
          
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
              themeVariant={isDarkMode ? 'dark' : 'light'}
            />
          )}
        </>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>
        {existingSession ? 'Edit Session' : 'Add New Session'}
      </Text>
      
      {/* Patient Selector */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textColor }]}>Patient</Text>
        {patients.length > 0 ? (
          <TouchableOpacity 
            style={[
              styles.input, 
              { 
                backgroundColor: theme.inputBackground,
                borderColor: errors.patientId ? theme.errorColor : theme.borderColor 
              }
            ]}
            onPress={() => setShowPatientPicker(true)}
          >
            <Text style={{ color: theme.textColor }}>
              {patientId ? getPatientNameById(patientId) : 'Select a patient'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.noDataText, { color: theme.errorColor }]}>
            No patients available. Please add a patient first.
          </Text>
        )}
        {errors.patientId ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.patientId}</Text> : null}
      </View>
      
      {/* Date Selector */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textColor }]}>Date</Text>
        <TouchableOpacity 
          style={[styles.dateTimeButton, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: theme.textColor }}>{formatDateForDisplay(date)}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Time Selector */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textColor }]}>Time</Text>
        <TouchableOpacity 
          style={[styles.dateTimeButton, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={{ color: theme.textColor }}>{formatTimeForDisplay(time)}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Notes Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textColor }]}>Notes</Text>
        <TextInput
          style={[
            styles.textArea, 
            { 
              backgroundColor: theme.inputBackground,
              borderColor: theme.borderColor,
              color: theme.textColor
            }
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add session notes (optional)"
          placeholderTextColor={theme.placeholderColor}
          multiline={true}
          numberOfLines={4}
        />
      </View>
      
      {/* Amount Input */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textColor }]}>Amount ($)</Text>
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: theme.inputBackground,
              borderColor: errors.amount ? theme.errorColor : theme.borderColor,
              color: theme.textColor
            }
          ]}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount (optional)"
          placeholderTextColor={theme.placeholderColor}
          keyboardType="decimal-pad"
        />
        {errors.amount ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.amount}</Text> : null}
      </View>
      
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: theme.cancelButtonBg },
            isSubmitting ? styles.disabledButton : null
          ]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={[styles.cancelButtonText, { color: theme.textColor }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: theme.primaryColor },
            isSubmitting ? styles.disabledButton : null
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || patients.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : existingSession ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Patient Picker Modal */}
      <Modal
        visible={showPatientPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientPicker(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.modalBg }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Select Patient</Text>
            {/* FlatList is removed, using ScrollView for now */}
            <ScrollView>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.patientItem, { borderBottomColor: theme.separatorColor }]}
                  onPress={() => {
                    setPatientId(patient.id);
                    setShowPatientPicker(false);
                  }}
                >
                  <Text style={[
                    styles.patientName,
                    { color: theme.textColor },
                    patientId === patient.id ? { color: theme.primaryColor, fontWeight: 'bold' } : null
                  ]}>
                    {patient.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.cancelButtonBg }]}
              onPress={() => setShowPatientPicker(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textColor }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Date & Time Pickers */}
      {renderDateTimePicker()}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
  },
  noDataText: {
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
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
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  patientItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  patientName: {
    fontSize: 16,
  },
  datePickerContainer: {
    borderRadius: 10,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  datePickerCancelText: {
    fontSize: 16,
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePicker: {
    height: 200,
  },
});