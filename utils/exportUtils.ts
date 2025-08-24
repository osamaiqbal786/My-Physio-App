import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import { Platform, Share } from 'react-native';
import { Session } from '../types';

/**
 * Formats a session for Excel export by creating a flattened object with readable properties
 */
const formatSessionForExport = (session: Session) => {
  // Format date for better readability
  const formattedDate = new Date(session.date).toLocaleDateString();
  
  return {
    'Patient Name': session.patientName,
    'Date': formattedDate,
    'Time': session.time,
    'Notes': session.notes,
    'Status': session.completed ? 'Completed' : 'Pending',
    'Amount Paid': session.amount !== undefined ? `$${session.amount.toFixed(2)}` : 'Not paid',
    'Created At': new Date(session.createdAt).toLocaleDateString(),
  };
};

/**
 * Exports sessions to an Excel file and shares it
 */
export const exportSessionsToExcel = async (sessions: Session[], patientName: string): Promise<boolean> => {
  try {
    // Format the data for export
    const formattedSessions = sessions.map(formatSessionForExport);
    
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(formattedSessions);
    
    // Create a workbook with the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions');
    
    // Generate the Excel file
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    
    // Create a filename with the patient name and current date
    const fileName = `${patientName.replace(/\s+/g, '_')}_Sessions_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Determine the file path
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Write the file
    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    // Share the file
    await Share.share({
      title: 'Sessions Export',
      message: `${patientName}'s Sessions`,
      url: fileUri,
    });
    
    return true;
  } catch (error) {
    console.error('Error exporting sessions:', error);
    return false;
  }
}; 