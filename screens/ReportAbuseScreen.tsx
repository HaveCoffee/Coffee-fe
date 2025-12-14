import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type ReportType = 'Harassment' | 'Hate Speech' | 'Spam/Scam' | 'Impersonation' | 'Illegal Activity';

export default function ReportAbuseScreen() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const reportTypes: ReportType[] = [
    'Harassment',
    'Hate Speech',
    'Spam/Scam',
    'Impersonation',
    'Illegal Activity',
  ];

  const handleSubmit = () => {
    if (!selectedReportType) {
      Alert.alert('Please select a report type');
      return;
    }
    
    // In a real app, this would submit the report to your backend
    console.log('Submitting report:', {
      type: selectedReportType,
      details: additionalDetails,
    });
    
    Alert.alert(
      'Report Submitted',
      'Thank you for your report. We will review it shortly.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back or reset the form
            setSelectedReportType(null);
            setAdditionalDetails('');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Abuse</Text>
        </View>

        {/* Report Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Report Type</Text>
          <View style={styles.reportTypesContainer}>
            {reportTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.reportTypeButton,
                  selectedReportType === type && styles.selectedReportType,
                ]}
                onPress={() => setSelectedReportType(type)}
              >
                <Text
                  style={[
                    styles.reportTypeText,
                    selectedReportType === type && styles.selectedReportTypeText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Please provide any additional information that would help us with the investigation..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={additionalDetails}
            onChangeText={setAdditionalDetails}
          />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Ionicons name="alert-circle" size={20} style={styles.warningIcon} />
          <Text style={styles.disclaimerText}>
            Reports are anonymous. Content may be temporarily suspended pending investigation within 24 hours.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100, // Space for the submit button
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  reportTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reportTypeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedReportType: {
    backgroundColor: 'transparent',
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  reportTypeText: {
    color: '#666',
  },
  selectedReportTypeText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 22,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 2,
    color: '#FF3B30',
  },
  disclaimerText: {
    flex: 1,
    color: '#999',
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#E1BEE7',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
