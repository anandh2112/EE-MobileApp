import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

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

const previousCycle = {
  chargeStart: '2025-03-19 11:43',
  chargeEnd: '2025-03-19 11:08',
  dischargeStart: '2025-03-19 11:43',
  dischargeEnd: '2025-03-19 11:08',
};

function formatTimeRange(start: string, end: string) {
  const startTime = start.split(' ')[1];
  const endTime = end.split(' ')[1];
  return `${startTime} - ${endTime}`;
}

function formatDate(dateStr: string) {
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
            <View style={styles.subSubCard}>
              <Text style={styles.subSubCardHeading}>Charge Time :</Text>
              <Text style={styles.subSubCardTime}>
                {formatTimeRange(previousCycle.chargeStart, previousCycle.chargeEnd)}
              </Text>
              <Text style={styles.subSubCardDate}>
                {formatDate(previousCycle.chargeStart)}
              </Text>
            </View>
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

        {/* Battery Info Section */}
        <View style={styles.subCard}>
          <View style={styles.row}>
            <TouchableOpacity onPress={handlePrev} disabled={index === 0}>
              <Ionicons name="chevron-back" size={wp('7%')} color={index === 0 ? '#ccc' : '#000'} />
            </TouchableOpacity>

            <View style={styles.batteryContainer}>
              <View style={styles.left}>
                <Image source={battery.image} style={styles.image} resizeMode="contain" />
                <View style={styles.statusRow}>
                  <View style={[styles.statusCircle, { backgroundColor: battery.statusColor }]} />
                  <Text style={styles.statusText}>{battery.status}</Text>
                </View>
              </View>

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
              <Ionicons name="chevron-forward" size={wp('7%')} color={index === batteries.length - 1 ? '#ccc' : '#000'} />
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
    paddingHorizontal: wp('3%'),
  },
  card: {
    backgroundColor: '#fff',
    padding: wp('3%'),
    borderRadius: wp('3%'),
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: hp('2%'),
    position: 'relative',
  },
  heading: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
    fontFamily: 'Poppins',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  batteryContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: wp('2%'),
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
    width: wp('20%'),
    height: wp('20%'),
    marginBottom: hp('0.5%'),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  statusCircle: {
    width: wp('3%'),
    height: wp('3%'),
    borderRadius: wp('1.5%'),
    marginRight: wp('1.5%'),
  },
  statusText: {
    fontWeight: '500',
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins',
  },
  batteryName: {
    fontWeight: 'bold',
    fontSize: wp('3.8%'),
    marginBottom: hp('0.5%'),
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  label: {
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  info: {
    fontSize: wp('3%'),
    marginBottom: hp('0.4%'),
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  infoGroup: {
    alignItems: 'center',
  },
  subCard: {
    marginTop: hp('2%'),
    padding: wp('3%'),
    borderRadius: wp('2.5%'),
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  bottomHeading: {
    fontWeight: 'bold',
    marginBottom: hp('1%'),
    fontSize: wp('4%'),
    fontFamily: 'Poppins',
  },
  subSubCardRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  subSubCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    marginHorizontal: wp('1%'),
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#eee',
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  subSubCardHeading: {
    fontWeight: 'bold',
    fontSize: wp('3.3%'),
    marginBottom: hp('0.5%'),
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  subSubCardTime: {
    fontSize: wp('3.2%'),
    marginBottom: hp('0.5%'),
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  subSubCardDate: {
    fontSize: wp('3%'),
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    backgroundColor: '#333',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('2%'),
    fontFamily: 'Poppins',
  },
});
