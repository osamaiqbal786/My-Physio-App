import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, useColorScheme, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { Session } from '../../types';
import { getTodaySessions, updateSession, deleteSession } from '../../utils/mongoStorage';
import SessionCard from '../../components/SessionCard';
import SessionForm from '../../components/SessionForm';
import PaymentModal from '../../components/PaymentModal';

export default function TodayScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [sessionToComplete, setSessionToComplete] = useState<Session | null>(null);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F7',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    cardBackground: isDarkMode ? '#2A2A2A' : 'white',
    inputBackground: isDarkMode ? '#333333' : 'white',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    primaryColor: '#0A84FF',
    errorColor: '#FF453A',
    placeholderColor: isDarkMode ? '#888888' : '#999999',
    modalBg: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    separatorColor: isDarkMode ? '#333333' : '#EFEFEF',
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const todaySessions = await getTodaySessions();
      setSessions(todaySessions);
    } catch (error) {
      console.error('Error loading today sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const handleAddSession = () => {
    setSelectedSession(undefined);
    setModalVisible(true);
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setModalVisible(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(sessionId);
              loadSessions();
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'Failed to delete session');
            }
          }
        },
      ]
    );
  };

  const handleToggleComplete = async (session: Session, completed: boolean) => {
    if (completed) {
      setSessionToComplete(session);
      setPaymentModalVisible(true);
    } else {
      try {
        const updatedSession = { ...session, completed, amount: undefined };
        await updateSession(updatedSession);
        loadSessions();
      } catch (error) {
        console.error('Error updating session completion status:', error);
        Alert.alert('Error', 'Failed to update session status');
      }
    }
  };

  const handlePaymentConfirm = async (amount: number) => {
    if (!sessionToComplete) return;
    
    try {
      const updatedSession = { 
        ...sessionToComplete, 
        completed: true,
        amount: amount
      };
      await updateSession(updatedSession);
      setPaymentModalVisible(false);
      setSessionToComplete(null);
      loadSessions();
    } catch (error) {
      console.error('Error updating session with payment:', error);
      Alert.alert('Error', 'Failed to update session payment');
    }
  };

  const handlePaymentCancel = () => {
    setPaymentModalVisible(false);
    setSessionToComplete(null);
  };

  const handleSaveSession = async (session: Session) => {
    setModalVisible(false);
    loadSessions();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>Today's Sessions</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.primaryColor }]}
          onPress={handleAddSession}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <Text style={{ color: theme.textColor }}>Loading sessions...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={[styles.noSessionsText, { color: theme.textColor }]}>No sessions scheduled for today</Text>
          <TouchableOpacity 
            style={[styles.addSessionButton, { backgroundColor: theme.primaryColor }]}
            onPress={handleAddSession}
          >
            <Text style={styles.addSessionButtonText}>Add New Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onEdit={handleEditSession}
              onDelete={handleDeleteSession}
              onToggleComplete={handleToggleComplete}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.modalBg }]}>
          <View style={styles.modalContent}>
            <SessionForm
              existingSession={selectedSession}
              onSave={handleSaveSession}
              onCancel={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {sessionToComplete && (
        <PaymentModal
          visible={paymentModalVisible}
          session={sessionToComplete}
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSessionsText: {
    fontSize: 16,
    marginBottom: 20,
  },
  addSessionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addSessionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
  },
});
