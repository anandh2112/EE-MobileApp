import React, { useState, useEffect, useRef } from 'react';
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
import { useDateTime } from '@/components/datetimecontext';

interface DateRangeCardProps {
  onToggleChange?: (value: 'kVAh' | 'kWh') => void;
  onDateChange?: (start: string, end: string) => void;
}

export default function DateTimePicker({ onToggleChange, onDateChange }: DateRangeCardProps) {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    format
  } = useDateTime();
  
  const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);
  const now = new Date();
  const initialRender = useRef(true);

  // Safe date change handler
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      // Send initial dates on first render
      if (onDateChange) {
        onDateChange(format(startDate), format(endDate));
      }
      return;
    }

    // Only call onDateChange if dates actually changed
    if (onDateChange) {
      onDateChange(format(startDate), format(endDate));
    }
  }, [startDate, endDate]); // Removed format and onDateChange from dependencies

  return (
    <View style={styles.cardContainer}>
      <View style={styles.dateRow}>
        {/* Start Date */}
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
            <View style={{ paddingRight: wp('2%') }}>
              <Ionicons name="calendar-outline" size={wp('4.5%')} color="#555" />
            </View>
          </Pressable>
        </View>

        {/* End Date */}
        <View style={styles.dateInput}>
          <View style={{ paddingLeft: wp('3%') }}>
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
            <Ionicons name="calendar-outline" size={wp('4.5%')} color="#555" />
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

// Keep the same styles
const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: wp('3%'),
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    paddingHorizontal: wp('1%'),
    marginBottom: hp('1%'),
  },
  dateRow: {
    padding: wp('1%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
  },
  sideLabel: {
    fontSize: wp('3%'),
    color: '#666',
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
  },
});