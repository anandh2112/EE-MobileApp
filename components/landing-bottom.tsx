import React, { useEffect, useState } from 'react';
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

  return (
    <View style={styles.parent}>
      {/* Combined Metric Card */}
      <View style={styles.combinedCard}>
        <View style={styles.column}>
          <View style={styles.metricBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images-user/consumption.png')}
                style={styles.iconSmall}
              />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.metricValue}>{conskWh} kWh</Text>
              <Text style={styles.label}>Consumption</Text>
            </View>
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images-user/consumption.png')}
                style={styles.iconSmall}
              />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.metricValue}>{conskVAh} kVAh</Text>
              <Text style={styles.label}>Consumption</Text>
            </View>
          </View>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.column}>
          <View style={styles.metricBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images-user/peakdemand.png')}
                style={styles.iconSmall}
              />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.metricValue}>{peakDemand} kVA</Text>
              <Text style={styles.label}>Peak Demand</Text>
            </View>
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images-user/cost.png')}
                style={styles.iconSmall}
              />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.metricValue}>₹ {Coe}</Text>
              <Text style={styles.label}>Cost of Electricity</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Carbon Info */}
      <View style={styles.imageCard}>
        <View style={styles.videoSection}>
          {/* <Video
            source={require('../assets/videos/vehicles.mp4')}
            style={styles.sideVideo}
            resizeMode="cover"
            repeat
            muted
            paused={false}
            ignoreSilentSwitch="obey"
          /> */}
        </View>
        <View style={styles.infoSection}>
          <View style={styles.iconRowCenter}>
            <Text style={styles.bigText}>{emissions} kg CO₂</Text>
          </View>
          <Text style={styles.subText}>Carbon Footprint</Text>
          <Text style={[styles.bigText, { marginTop: hp('2%') }]}>{distance} km</Text>
          <Text style={styles.subText}>Equivalent to driving</Text>
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
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('0.5%'),
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
    width: wp('6%'),
    height: wp('6.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2.5%'),
  },
  iconSmall: {
    width: wp('6.5%'),
    height: wp('6.5%'),
    resizeMode: 'contain',
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: wp('2.5%'),
    color: '#777',
  },
  metricValue: {
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    color: '#111',
  },
  verticalLine: {
    width: 1.5,
    backgroundColor: '#ddd',
    marginHorizontal: wp('2%'),
  },
  imageCard: {
    marginHorizontal: wp('3%'),
    marginTop: hp('1%'),
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  videoSection: {
    width: '60%',
    height: hp('14%'),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sideVideo: {
    width: '140%',
    height: '140%',
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
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#111',
  },
  subText: {
    fontSize: wp('2.7%'),
    color: '#777',
  },
});
