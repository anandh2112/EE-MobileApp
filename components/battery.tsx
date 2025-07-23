import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For arrow icons

const batteries = [
  {
    name: 'IOE Battery',
    status: 'Idle',
    statusColor: '#FACC15', // Yellow
    charge: '0 kWh',
    discharge: '0 kWh',
    temperature: '33°C',
    voltage: '695',
    image: require('../assets/images-user/ioebattery.png'),
  },
  {
    name: 'UPS Battery',
    status: 'Active',
    statusColor: '#22C55E', // Green
    charge: '0 kWh',
    discharge: '0 kWh',
    temperature: '33°C',
    voltage: '695',
    image: require('../assets/images-user/upsbattery.png'),
  },
  {
    name: 'LTO',
    status: 'Offline',
    statusColor: '#9CA3AF', // Gray
    charge: '0 kWh',
    discharge: '0 kWh',
    temperature: '33°C',
    voltage: '695',
    image: require('../assets/images-user/ltobattery.png'),
  },
];

// Example data for previous cycle (use your actual data as needed)
const previousCycle = {
  chargeStart: '2025-03-19 11:43',
  chargeEnd: '2025-03-19 11:08',
  dischargeStart: '2025-03-19 11:43',
  dischargeEnd: '2025-03-19 11:08',
};

function formatTimeRange(start: string, end: string) {
  // Extract only time (HH:mm)
  const startTime = start.split(' ')[1];
  const endTime = end.split(' ')[1];
  return `${startTime} - ${endTime}`;
}

function formatDate(dateStr: string) {
  // Convert YYYY-MM-DD to DD-MM-YYYY
  const [year, month, day] = dateStr.split(' ')[0].split('-');
  return `${day}-${month}-${year}`;
}

export default function BatteryStorage() {
  const [index, setIndex] = useState(0);
  const battery = batteries[index];

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleNext = () => {
    if (index < batteries.length - 1) setIndex(index + 1);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { opacity: 0.4 }]}>
        <Text style={styles.heading}>Battery Storage</Text>

        {/* Previous Cycle Card */}
        <View style={styles.subCard}>
          <Text style={styles.bottomHeading}>Previous Cycle</Text>
          <View style={styles.subSubCardRow}>
            {/* Charge Time Card */}
            <View style={styles.subSubCard}>
              <Text style={styles.subSubCardHeading}>Charge Time :</Text>
              <Text style={styles.subSubCardTime}>
                {formatTimeRange(previousCycle.chargeStart, previousCycle.chargeEnd)}
              </Text>
              <Text style={styles.subSubCardDate}>
                {formatDate(previousCycle.chargeStart)}
              </Text>
            </View>
            {/* Discharge Time Card */}
            <View style={styles.subSubCard}>
              <Text style={styles.subSubCardHeading}>Discharge Time :</Text>
              <Text style={styles.subSubCardTime}>
                {formatTimeRange(previousCycle.dischargeStart, previousCycle.dischargeEnd)}
              </Text>
              <Text style={styles.subSubCardDate}>
                {formatDate(previousCycle.dischargeStart)}
              </Text>
            </View>
          </View>
        </View>

        {/* Battery Info Section inside a subCard */}
        <View style={styles.subCard}>
          <View style={styles.row}>
            <TouchableOpacity onPress={handlePrev} disabled={index === 0}>
              <Ionicons name="chevron-back" size={28} color={index === 0 ? '#ccc' : '#000'} />
            </TouchableOpacity>

            <View style={styles.batteryContainer}>
              {/* Left: Image & Status */}
              <View style={styles.left}>
                <Image source={battery.image} style={styles.image} resizeMode="contain" />
                <View style={styles.statusRow}>
                  <View style={[styles.statusCircle, { backgroundColor: battery.statusColor }]} />
                  <Text style={styles.statusText}>
                    {battery.status}
                  </Text>
                </View>
              </View>

              {/* Right: Battery Info */}
              <View style={styles.right}>
                <Text style={styles.batteryName}>{battery.name}</Text>
                <View style={styles.infoGroup}>
                  <Text style={styles.info}><Text style={styles.label}>Charge:</Text> {battery.charge}</Text>
                  <Text style={styles.info}><Text style={styles.label}>Discharge:</Text> {battery.discharge}</Text>
                  <Text style={styles.info}><Text style={styles.label}>Temperature:</Text> {battery.temperature}</Text>
                  <Text style={styles.info}><Text style={styles.label}>Voltage:</Text> {battery.voltage}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={handleNext} disabled={index === batteries.length - 1}>
              <Ionicons name="chevron-forward" size={28} color={index === batteries.length - 1 ? '#ccc' : '#000'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Overlay Section Not Available */}
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Section Not Available</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
    position: 'relative',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  batteryContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  left: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  statusText: {
    fontWeight: '500',
    fontSize: 14,
  },
  batteryName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
  },
  info: {
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  infoGroup: {
    alignItems: 'center',
  },
  subCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  bottomHeading: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 15,
  },
  subSubCardRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  subSubCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#eee',
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  subSubCardHeading: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  subSubCardTime: {
    fontSize: 13,
    marginBottom: 2,
    textAlign: 'center',
  },
  subSubCardDate: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
