// Datepicker.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// NEW PROP TYPE
interface DateRangeCardProps {
  onToggleChange?: (value: 'kVAh' | 'kWh') => void;
  onDateChange?: (start: string, end: string) => void; // <-- ADD THIS
}

export default function DateRangeCard({ onToggleChange, onDateChange }: DateRangeCardProps) {
  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const currentTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    0,
    0
  );

  const [startDate, setStartDate] = useState(startOfDay);
  const [endDate, setEndDate] = useState(currentTime);
  const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);

  // Format date to "YYYY-MM-DD HH-MM-SS"
  const formatDateTime = (date: Date) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  };

  // NEW: Call onDateChange every time dates change
  useEffect(() => {
    if (onDateChange) {
      onDateChange(formatDateTime(startDate), formatDateTime(endDate));
    }
  }, [startDate, endDate]);

  return (
    <View style={styles.cardContainer}>
      {/* Date Pickers */}
      <View style={styles.dateRow}>
        <View style={styles.dateInput}>
          <Text style={styles.sideLabel}>Start</Text>
          <Pressable onPress={() => setPickerMode('start')} style={styles.inputRow}>
            <Text style={styles.dateText}>
              {`${startDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })} - ${startDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}`}
            </Text>
            <View style={{ paddingRight: 10 }}>
              <Ionicons name="calendar-outline" size={18} color="#555" />
            </View>
          </Pressable>
        </View>

        <View style={styles.dateInput}>
          <View style={{ paddingLeft: 15 }}>
            <Text style={styles.sideLabel}>End</Text>
          </View>
          <Pressable onPress={() => setPickerMode('end')} style={styles.inputRow}>
            <Text style={styles.dateText}>
              {`${endDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })} - ${endDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}`}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#555" />
          </Pressable>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={pickerMode !== null}
        mode="datetime"
        date={pickerMode === 'start' ? startDate : endDate}
        onConfirm={(date) => {
          if (pickerMode === 'start') setStartDate(date);
          else if (pickerMode === 'end') setEndDate(date);
          setPickerMode(null);
        }}
        onCancel={() => setPickerMode(null)}
        is24Hour={false}
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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    paddingHorizontal: wp('2%'),
    marginBottom: hp('1%'),
  },
  dateRow: {
    padding: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 0,
  },
  dateInput: {
    flex: 1,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sideLabel: {
    fontSize: 12,
    color: '#666',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});