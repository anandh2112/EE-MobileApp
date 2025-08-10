// 1. First, create a new unified component: DateTimeRangePicker.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface DateTimeRangePickerProps {
  onDateChange: (start: string, end: string) => void;
  variant?: 'card' | 'minimal';
  initialStartDate?: Date;
  initialEndDate?: Date;
  timeFormat?: '12h' | '24h';
}

export default function DateTimeRangePicker({
  onDateChange,
  variant = 'card',
  initialStartDate,
  initialEndDate,
  timeFormat = '12h'
}: DateTimeRangePickerProps) {
  const now = new Date();
  
  // Initialize dates with props or defaults
  const [startDate, setStartDate] = useState(initialStartDate || new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0, 0
  ));
  
  const [endDate, setEndDate] = useState(initialEndDate || new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    0, 0
  ));

  const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);

  // Unified date formatting
  const formatDateTime = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`;
  };

  // Handle date changes
  useEffect(() => {
    onDateChange(formatDateTime(startDate), formatDateTime(endDate));
  }, [startDate, endDate]);

  // Date display formatting
  const formatDisplayDate = (date: Date) => {
    return `${date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} - ${date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    })}`;
  };

  const handleDateConfirm = (date: Date) => {
    if (pickerMode === 'start') {
      if (date > endDate) {
        // Auto-adjust end date if needed
        const newEndDate = new Date(date);
        newEndDate.setHours(date.getHours() + 1);
        setEndDate(newEndDate);
      }
      setStartDate(date);
    } else {
      if (date < startDate) {
        // Auto-adjust start date if needed
        const newStartDate = new Date(date);
        newStartDate.setHours(date.getHours() - 1);
        setStartDate(newStartDate);
      }
      setEndDate(date);
    }
    setPickerMode(null);
  };

  // Container style based on variant
  const containerStyle = variant === 'card' ? styles.cardContainer : null;

  return (
    <View style={containerStyle}>
      <View style={styles.dateRow}>
        {/* Start Date Picker */}
        <View style={styles.dateInput}>
          <Text style={styles.sideLabel}>Start</Text>
          <Pressable onPress={() => setPickerMode('start')} style={styles.inputRow}>
            <Text style={styles.dateText}>{formatDisplayDate(startDate)}</Text>
            <Ionicons name="calendar-outline" size={wp('4.5%')} color="#555" />
          </Pressable>
        </View>

        {/* End Date Picker */}
        <View style={styles.dateInput}>
          <Text style={styles.sideLabel}>End</Text>
          <Pressable onPress={() => setPickerMode('end')} style={styles.inputRow}>
            <Text style={styles.dateText}>{formatDisplayDate(endDate)}</Text>
            <Ionicons name="calendar-outline" size={wp('4.5%')} color="#555" />
          </Pressable>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={pickerMode !== null}
        mode="datetime"
        date={pickerMode === 'start' ? startDate : endDate}
        onConfirm={handleDateConfirm}
        onCancel={() => setPickerMode(null)}
        is24Hour={timeFormat === '24h'}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        maximumDate={now}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: wp('3%'),
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    paddingHorizontal: wp('1%'),
    marginBottom: hp('1.5%'),
  },
  dateRow: {
    padding: hp('0.5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('1%'),
  },
  dateInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: hp('0.6%'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
  },
  sideLabel: {
    fontSize: wp('3%'),
    color: '#666',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: wp('2.8%'),
    fontWeight: '600',
    color: '#1a1a1a',
  },
});