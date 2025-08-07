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

const statusStyles = {
  Active: { color: '#22C55E', label: 'Active' },
  Idle: { color: '#FACC15', label: 'Idle' },
  Offline: { color: '#9CA3AF', label: 'Offline' },
} as const;

type StatusKey = keyof typeof statusStyles;

interface Charger {
  location: string;
  status: StatusKey;
}

const chargers: Charger[] = [
  { location: 'Basement Level - 1', status: 'Active' },
  { location: 'Basement Level - 2', status: 'Idle' },
  { location: 'Parking Lot A', status: 'Offline' },
  { location: 'Parking Lot B', status: 'Active' },
  { location: 'Entrance Left', status: 'Idle' },
  { location: 'Entrance Right', status: 'Offline' },
];

export default function EVChargers() {
  const [index, setIndex] = useState(0);
  const charger = chargers[index];
  const status = statusStyles[charger.status];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { opacity: 0.4 }]}>
        <Text style={styles.heading}>EV Chargers</Text>

        {/* Top Row Cards */}
        <View style={styles.topRow}>
          {['Chargers Used', 'Sessions Today', 'Energy Used'].map((label, i) => (
            <View key={i} style={styles.subCard}>
              <Text style={styles.subLabel}>{label}</Text>
              <Text style={styles.subValue}>
                {i === 0 ? '01' : i === 1 ? '04' : '1.1kWh'}
              </Text>
            </View>
          ))}
        </View>

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          <View style={styles.bottomRow}>
            {/* Left Arrow */}
            <TouchableOpacity
              onPress={() => setIndex(prev => Math.max(prev - 1, 0))}
              disabled={index === 0}
              style={styles.arrowContainer}
            >
              <Ionicons
                name="chevron-back"
                size={wp('7%')}
                color={index === 0 ? '#ccc' : '#000'}
              />
            </TouchableOpacity>

            {/* Card Content */}
            <View style={styles.bottomContent}>
              {/* Left Half */}
              <View style={styles.leftHalf}>
                <Image
                  source={require('../assets/images-user/ev.png')}
                  style={styles.image}
                  resizeMode="contain"
                />
                <View style={styles.statusRowLeft}>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={styles.statusText}>{status.label}</Text>
                </View>
              </View>

              {/* Right Half */}
              <View style={styles.rightHalfNew}>
                <Text style={styles.locationName}>{charger.location}</Text>
                <View style={styles.subSubRow}>
                  <Image
                    source={require('../assets/images-user/capacity.png')}
                    style={styles.smallImage}
                  />
                  <Text style={styles.infoText}>
                    Capacity: <Text style={styles.boldValue}>3.3 kW</Text>
                  </Text>
                </View>
                <View style={styles.subSubRow}>
                  <Image
                    source={require('../assets/images-user/energyconsumed.png')}
                    style={styles.smallImage}
                  />
                  <Text style={styles.infoText}>
                    Usage : <Text style={styles.boldValue}>0 kWh</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Arrow */}
            <TouchableOpacity
              onPress={() => setIndex(prev => Math.min(prev + 1, chargers.length - 1))}
              disabled={index === chargers.length - 1}
              style={styles.arrowContainer}
            >
              <Ionicons
                name="chevron-forward"
                size={wp('7%')}
                color={index === chargers.length - 1 ? '#ccc' : '#000'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Overlay */}
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
    paddingBottom: hp('2%'),
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
    marginBottom: hp('1.5%'),
    fontFamily: 'Poppins',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  subCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    marginHorizontal: wp('1%'),
    padding: wp('2.5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
  },
  subLabel: {
    fontSize: wp('3%'),
    color: '#555',
    fontFamily: 'Poppins',
  },
  subValue: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  bottomCard: {
    backgroundColor: '#f9fafb',
    padding: wp('3%'),
    borderRadius: wp('2.5%'),
    marginTop: hp('1.2%'),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowContainer: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('1.5%'),
  },
  bottomContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('1%'),
  },
  leftHalf: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: wp('24%'),
  },
  image: {
    width: wp('18%'),
    height: wp('18%'),
    marginBottom: hp('0.5%'),
  },
  statusRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  statusDot: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    marginRight: wp('1.5%'),
  },
  statusText: {
    fontWeight: '500',
    fontSize: wp('3.3%'),
    fontFamily: 'Poppins',
  },
  rightHalfNew: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: wp('3%'),
  },
  locationName: {
    fontWeight: 'bold',
    fontSize: wp('3.5%'),
    marginBottom: hp('1%'),
    color: '#222',
    fontFamily: 'Poppins',
  },
  subSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('0.4%'),
  },
  smallImage: {
    width: wp('5%'),
    height: wp('5%'),
    marginRight: wp('1.5%'),
  },
  infoText: {
    fontSize: wp('3.2%'),
    fontFamily: 'Poppins',
  },
  boldValue: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
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
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
    fontFamily: 'Poppins',
  },
});
