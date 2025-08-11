import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Video from 'react-native-video';
import axios from 'axios';

interface LandingMetricsProps {
  startDateTime: string;
  endDateTime: string;
}

export default function LandingMetrics({ startDateTime, endDateTime }: LandingMetricsProps) {
  const [conskWh, setConskWh] = useState(0);
  const [conskVAh, setConskVAh] = useState(0);
  const [peakDemand, setPeakdemand] = useState(0);
  const [Coe, setCoe] = useState(0);

  useEffect(() => {
    if (!startDateTime || !endDateTime) return;

    axios.get('https://mw.elementsenergies.com/api/mccons', {
      params: { startDateTime, endDateTime },
    })
      .then((response) => {
        const value = response.data.consumption || 0;
        setConskWh(value);
      })
      .catch((error) => {
        console.error('Error fetching mccons data:', error);
      });

    axios.get('https://mw.elementsenergies.com/api/mcapcons', {
      params: { startDateTime, endDateTime },
    })
      .then((response) => {
        const value = response.data.consumption || 0;
        setConskVAh(value);
      })
      .catch((error) => {
        console.error('Error fetching mcapcons data:', error);
      });

    axios.get('https://mw.elementsenergies.com/api/mcpeak', {
      params: { startDateTime, endDateTime },
    })
      .then((response) => {
        const value = response.data.peakDemand || 0;
        setPeakdemand(value);
      })
      .catch((error) => {
        console.error('Error fetching peakDemand data:', error);
      });

    axios.get('https://mw.elementsenergies.com/api/cc', {
      params: { startDateTime, endDateTime },
    })
      .then((response) => {
        const value = response.data.totalCost || 0;
        setCoe(value);
      })
      .catch((error) => {
        console.error('Error fetching cost of electricity data:', error);
      });
  }, [startDateTime, endDateTime]);

  const emissions = parseFloat((conskWh * 0.82).toFixed(1));
  const distance = (emissions * 0.356).toFixed(1);

  // Get screen dimensions
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375; // iPhone SE or similar small devices

  return (
    <View style={styles.parent}>
      {/* Combined Metric Card */}
      <View style={styles.combinedCard}>
        <View style={styles.column}>
          <View style={styles.metricBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images-user/consumption.png')}
                style={[styles.iconSmall, isSmallScreen && styles.iconSmaller]}
              />
            </View>
            <View style={styles.textBlock}>
              <Text style={[styles.metricValue, isSmallScreen && styles.metricValueSmall]}>{conskWh} kWh</Text>
              <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Consumption</Text>
            </View>
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images-user/consumption.png')}
                style={[styles.iconSmall, isSmallScreen && styles.iconSmaller]}
              />
            </View>
            <View style={styles.textBlock}>
              <Text style={[styles.metricValue, isSmallScreen && styles.metricValueSmall]}>{conskVAh} kVAh</Text>
              <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Consumption</Text>
            </View>
          </View>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.column}>
          <View style={styles.metricBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images-user/peakdemand.png')}
                style={[styles.iconSmall, isSmallScreen && styles.iconSmaller]}
              />
            </View>
            <View style={styles.textBlock}>
              <Text style={[styles.metricValue, isSmallScreen && styles.metricValueSmall]}>{peakDemand} kVA</Text>
              <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Peak Demand</Text>
            </View>
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images-user/cost.png')}
                style={[styles.iconSmall, isSmallScreen && styles.iconSmaller]}
              />
            </View>
            <View style={styles.textBlock}>
              <Text style={[styles.metricValue, isSmallScreen && styles.metricValueSmall]}>₹ {Coe}</Text>
              <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Cost of Electricity</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Carbon Info */}
      <View style={styles.imageCard}>
        <View style={styles.videoSection}>
          <Video
            source={require('../assets/videos/vehicles.mp4')}
            style={styles.sideVideo}
            resizeMode="cover"
            repeat
            muted
            paused={false}
            ignoreSilentSwitch="obey"
          />
        </View>
        <View style={styles.infoSection}>
          <View style={styles.iconRowCenter}>
            <Text style={[styles.bigText, isSmallScreen && styles.bigTextSmall]}>{emissions} kg CO₂</Text>
          </View>
          <Text style={[styles.subText, isSmallScreen && styles.subTextSmall]}>Carbon Footprint</Text>
          <Text style={[styles.bigText, isSmallScreen && styles.bigTextSmall, { marginTop: hp('1.5%') }]}>{distance} km</Text>
          <Text style={[styles.subText, isSmallScreen && styles.subTextSmall]}>Equivalent to driving</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parent: {
    paddingTop: hp('0%'),
  },
  combinedCard: {
    marginHorizontal: wp('3%'),
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '47%',
    justifyContent: 'space-between',
  },
  metricBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
    paddingVertical: hp('0.5%'),
  },
  iconWrapper: {
    width: wp('7%'),
    height: wp('7%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  iconSmall: {
    width: wp('6.5%'),
    height: wp('6.5%'),
    resizeMode: 'contain',
  },
  iconSmaller: {
    width: wp('5.5%'),
    height: wp('5.5%'),
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: wp('3%'),
    color: '#777',
    includeFontPadding: false,
  },
  labelSmall: {
    fontSize: wp('2.8%'),
  },
  metricValue: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#111',
    includeFontPadding: false,
  },
  metricValueSmall: {
    fontSize: wp('3.8%'),
  },
  verticalLine: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
    marginHorizontal: wp('1%'),
  },
  imageCard: {
    marginHorizontal: wp('3%'),
    marginTop: hp('1.5%'),
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    height: hp('13%'),
  },
  videoSection: {
    width: '60%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sideVideo: {
    width: '100%',
    height: '120%',
    backgroundColor: 'white',
  },
  infoSection: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: wp('3%'),
  },
  iconRowCenter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  bigText: {
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    color: '#111',
    includeFontPadding: false,
  },
  bigTextSmall: {
    fontSize: wp('3.8%'),
  },
  subText: {
    fontSize: wp('3%'),
    color: '#777',
    includeFontPadding: false,
  },
  subTextSmall: {
    fontSize: wp('2.8%'),
  },
});