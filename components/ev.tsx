import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          {['No. of Chargers Used', 'Total Sessions Today', 'Total Energy Used'].map((label, i) => (
            <View key={i} style={styles.subCard}>
              <Text style={styles.subLabel}>{label}</Text>
              <Text style={styles.subValue}>
                {i === 0 ? '01' : i === 1 ? '04' : '1.1kWh'}
              </Text>
            </View>
          ))}
        </View>

        {/* Bottom Card with Arrows INSIDE */}
        <View style={styles.bottomCard}>
          <View style={styles.bottomRow}>
            {/* Left Arrow */}
            <TouchableOpacity
              onPress={() => setIndex(prev => Math.max(prev - 1, 0))}
              disabled={index === 0}
              style={styles.arrowContainer}
            >
              <Ionicons name="chevron-back" size={28} color={index === 0 ? '#ccc' : '#000'} />
            </TouchableOpacity>

            {/* Main Card Content */}
            <View style={styles.bottomContent}>
              {/* Left Half: Image and Status */}
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
              {/* Right Half: Location, Capacity, Consumption */}
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
              <Ionicons name="chevron-forward" size={28} color={index === chargers.length - 1 ? '#ccc' : '#000'} />
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
    paddingBottom: 14,
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
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  subLabel: {
    fontSize: 12,
    color: '#555',
  },
  subValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // BOTTOM CARD
  bottomCard: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 0,
    marginTop: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowContainer: {
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  bottomContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  leftHalf: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 95,
  },
  image: {
    width: 70,
    height: 70,
    marginBottom: 5,
  },
  statusRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontWeight: '500',
    fontSize: 13,
  },
  rightHalfNew: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
  },
  locationName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    color: '#222',
  },
  subSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  smallImage: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
  },
  boldValue: {
    fontSize: 14,
    fontWeight: 'bold',
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
