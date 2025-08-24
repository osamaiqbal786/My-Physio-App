import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  FlatList,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Patient, SessionFilter } from '../types';
import { Filter } from 'lucide-react-native';

interface SessionFilterProps {
  patients: Patient[];
  onApplyFilter: (filter: SessionFilter) => void;
  onClearFilter: () => void;
}

export default function SessionFilterComponent({ patients, onApplyFilter, onClearFilter }: SessionFilterProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Theme-based styles
  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : 'white',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    inputBackground: isDarkMode ? '#2A2A2A' : 'white',
    primaryColor: '#0A84FF',
    errorColor: '#FF453A',
    modalBg: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    separatorColor: isDarkMode ? '#333333' : '#EFEFEF',
  };

  const [patientId, setPatientId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showPatientPicker, setShowPatientPicker] = useState(false); // Add state for patient picker modal

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDateForDisplay = (dateObj: Date): string => {
    return dateObj.toLocaleDateString();
  };

  // Helper function to format date for storage without timezone issues
  const formatDateForStorage = (dateObj: Date): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const applyFilter = () => {
    const filter: SessionFilter = {};
    
    if (patientId) {
      filter.patientId = patientId;
    }
    
    filter.startDate = formatDateForStorage(startDate);
    filter.endDate = formatDateForStorage(endDate);
    
    onApplyFilter(filter);
    setIsFilterActive(true);
    setShowFilterOptions(false);
  };

  const clearFilter = () => {
    setPatientId('');
    setStartDate(new Date());
    setEndDate(new Date());
    setIsFilterActive(false);
    setShowFilterOptions(false);
    onClearFilter();
  };

  const getPatientNameById = (id: string): string => {
    const patient = patients.find(p => p.id === id);
    return patient ? patient.name : '';
  };

  const renderDateTimePicker = (mode: 'start' | 'end') => {
    const isStart = mode === 'start';
    const value = isStart ? startDate : endDate;
    const onChange = isStart ? handleStartDateChange : handleEndDateChange;
    const showPicker = isStart ? showStartDatePicker : showEndDatePicker;

    if (Platform.OS === 'ios') {
      return (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => (isStart ? setShowStartDatePicker(false) : setShowEndDatePicker(false))}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.modalBg }]}>
            <View style={[styles.datePickerContainer, { backgroundColor: theme.backgroundColor }]}>
              <View style={[styles.datePickerHeader, { borderBottomColor: theme.separatorColor }]}>
                <TouchableOpacity onPress={() => (isStart ? setShowStartDatePicker(false) : setShowEndDatePicker(false))}>
                  <Text style={[styles.datePickerCancelText, { color: theme.errorColor }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => (isStart ? setShowStartDatePicker(false) : setShowEndDatePicker(false))}>
                  <Text style={[styles.datePickerDoneText, { color: theme.primaryColor }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value}
                mode="date"
                display="spinner"
                onChange={onChange}
                minimumDate={isStart ? undefined : startDate}
                textColor={theme.textColor}
                themeVariant={isDarkMode ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      );
    } else {
      return (
        showPicker && (
          <DateTimePicker
            value={value}
            mode="date"
            display="default"
            onChange={onChange}
            minimumDate={isStart ? undefined : startDate}
            themeVariant={isDarkMode ? 'dark' : 'light'}
          />
        )
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <TouchableOpacity 
        style={[
          styles.filterButton,
          isFilterActive ? styles.activeFilterButton : null,
          { borderColor: theme.primaryColor, backgroundColor: isFilterActive ? theme.primaryColor : theme.backgroundColor },
        ]}
        onPress={() => setShowFilterOptions(!showFilterOptions)}
      >
        <Filter size={18} color={isFilterActive ? 'white' : theme.primaryColor} />
        <Text style={[
          styles.filterButtonText,
          { color: isFilterActive ? 'white' : theme.primaryColor },
        ]}>
          {isFilterActive ? 'Filter Active' : 'Filter'}
        </Text>
      </TouchableOpacity>
      
      {showFilterOptions && (
        <View style={[styles.filterOptions, { backgroundColor: theme.backgroundColor }]}>
          {/* Patient Selector */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textColor }]}>Patient</Text>
            {patients.length > 0 ? (
              <TouchableOpacity 
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.borderColor,
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
          </View>
          
          {/* Start Date Selector */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textColor }]}>Start Date</Text>
            <TouchableOpacity 
              style={[styles.dateTimeButton, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={{ color: theme.textColor }}>{formatDateForDisplay(startDate)}</Text>
            </TouchableOpacity>
            {renderDateTimePicker('start')}
          </View>
          
          {/* End Date Selector */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textColor }]}>End Date</Text>
            <TouchableOpacity 
              style={[styles.dateTimeButton, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={{ color: theme.textColor }}>{formatDateForDisplay(endDate)}</Text>
            </TouchableOpacity>
            {renderDateTimePicker('end')}
          </View>
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton, { backgroundColor: theme.separatorColor }]}
              onPress={clearFilter}
            >
              <Text style={[styles.clearButtonText, { color: theme.textColor }]}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.applyButton, { backgroundColor: theme.primaryColor }]}
              onPress={applyFilter}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            <FlatList
              data={patients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.patientItem, { borderBottomColor: theme.separatorColor }]}
                  onPress={() => {
                    setPatientId(item.id);
                    setShowPatientPicker(false);
                  }}
                >
                  <Text style={[
                    styles.patientName,
                    { color: theme.textColor },
                    patientId === item.id ? { color: theme.primaryColor, fontWeight: 'bold' } : null
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.separatorColor }]}
              onPress={() => setShowPatientPicker(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textColor }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeFilterButton: {
    borderWidth: 0,
  },
  filterButtonText: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  filterOptions: {
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  dateTimeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  clearButton: {},
  applyButton: {},
  clearButtonText: {
    fontWeight: 'bold',
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
});