import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function Solar() {
  return (
    <View style={styles.container}>
      <View style={[styles.card, { opacity: 0.4 }]}>
        <Text style={styles.heading}>Wheeled-in Solar</Text>

        {/* Top Row: Left Stats and Right Image */}
        <View style={styles.topRow}>
          {/* Left side with 2 subcards */}
          <View style={styles.leftColumn}>
            {/* Subcard 1: Total Charging */}
            <View style={styles.subcard}>
              <Text style={styles.label}>Total Charging</Text>
              <View style={styles.inline}>
                <Text style={styles.bigValue}>80.88</Text>
                <Text style={styles.unit}> kWh</Text>
              </View>
              <View style={styles.inline}>
                <Text style={[styles.subValue, { color: 'red' }]}>Min-3.0 </Text>
                <Text style={[styles.subValue, { color: 'green' }]}>Max-10.0</Text>
              </View>
            </View>

            {/* Subcard 2: Power Usage */}
            <View style={styles.subcard}>
              <Text style={styles.label}>Power Usage</Text>
              <View style={styles.inline}>
                <Text style={styles.bigValue}>17.05</Text>
                <Text style={styles.unit}> kWh</Text>
              </View>
              <Text style={styles.subValue}>1 hour usage 6.8kWh</Text>
            </View>
          </View>

          {/* Right side with image */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/images-user/solar.png')} // Replace with actual image path
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Full Width Subcard */}
        <View style={styles.bottomSubcard}>
          <Text style={styles.label}>Energy Yield vs Time (Last 24 Hours)</Text>
          <View style={styles.inline}>
            <Text style={styles.bigValue}>120.5</Text>
            <Text style={styles.unit}> kWh</Text>
          </View>
          <Text style={styles.subValue}>
            Average Yield over the past 24 hours:
            <Text style={{ color: 'green' }}> 5.0 kWh</Text>
          </Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftColumn: {
    flex: 1,
    marginRight: 6,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  image: {
    width: '100%',
    height: 130,
  },
  subcard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  bottomSubcard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 2,
  },
  bigValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 12,
    marginLeft: 4,
    alignSelf: 'flex-end',
  },
  subValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
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
