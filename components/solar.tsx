import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

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
              source={require('../assets/images-user/solar.png')}
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  leftColumn: {
    flex: 1,
    marginRight: wp('1.5%'),
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('1.5%'),
  },
  image: {
    width: '100%',
    height: hp('17%'),
  },
  subcard: {
    backgroundColor: '#F9FAFB',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    marginBottom: hp('1%'),
  },
  bottomSubcard: {
    backgroundColor: '#F9FAFB',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    marginTop: hp('1%'),
  },
  label: {
    fontSize: wp('3.5%'),
    marginBottom: hp('0.5%'),
    fontFamily: 'Poppins',
  },
  bigValue: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  unit: {
    fontSize: wp('3%'),
    marginLeft: wp('1%'),
    alignSelf: 'flex-end',
    fontFamily: 'Poppins',
  },
  subValue: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: hp('0.5%'),
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
