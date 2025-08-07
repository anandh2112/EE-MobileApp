import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment-timezone';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type ZoneData = {
  zone: number;
  min: {
    kVAh: number;
    kWh: number;
    timestamp: string;
  };
  max: {
    kVAh: number;
    kWh: number;
    timestamp: string;
  };
};

type ELogProps = {
  startDate: string;
  endDate: string;
};

export default function ELog({ startDate, endDate }: ELogProps) {
  const [selectedUnit, setSelectedUnit] = useState<'kVAh' | 'kWh'>('kVAh');
  const animation = useRef(new Animated.Value(0)).current;
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [zoneToggle] = useState<'all' | 'single'>('all'); // fixed to 'all' as disabled

  const zoneNames = [
    { zone: 1, name: 'PLATING', subName: 'C-49' },
    { zone: 2, name: 'DIE CASTING + CHINA BUFFING + CNC', subName: 'C-50' },
    { zone: 3, name: 'SCOTCH BUFFING', subName: 'C-50' },
    { zone: 4, name: 'BUFFING', subName: 'C-49' },
    { zone: 5, name: 'SPRAY+EPL-I', subName: 'C-50' },
    { zone: 6, name: 'SPRAY+ EPL-II', subName: 'C-49' },
    { zone: 7, name: 'RUMBLE', subName: 'C-50' },
    { zone: 8, name: 'AIR COMPRESSOR', subName: 'C-49' },
    { zone: 9, name: 'TERRACE', subName: 'C-49' },
    { zone: 10, name: 'TOOL ROOM', subName: 'C-50' },
    { zone: 11, name: 'ADMIN BLOCK', subName: 'C-50' },
    { zone: 12, name: 'TRANSFORMER', subName: '' },
    { zone: 13, name: 'DIESEL GENERATOR - 1', subName: '' },
    { zone: 14, name: 'DIESEL GENERATOR - 2', subName: '' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      // Use the props instead of hardcoded dates
      const effectiveStartDate = startDate || moment().subtract(1, 'days').format('YYYY-MM-DD 00:00');
      const effectiveEndDate = endDate || moment().format('YYYY-MM-DD 00:00');

      try {
        const response = await axios.get('https://mw.elementsenergies.com/api/meterreading', {
          params: { 
            startDateTime: effectiveStartDate, 
            endDateTime: effectiveEndDate 
          },
        });
        setZones(response.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Only fetch if dates are available
    fetchData();
  }, [startDate, endDate]); // Add props to dependency array

  const toggleButtonWidth = wp('15%');
  const toggleButtonHeight = hp('2.2%');
  const toggleCircleWidth = wp('7%');
  const toggleCircleHeight = hp('2.2%');
  const toggleCircleRadius = wp('3.5%');

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, toggleButtonWidth - toggleCircleWidth],
  });

  const toggleSwitch = () => {
    const newUnit = selectedUnit === 'kVAh' ? 'kWh' : 'kVAh';
    setSelectedUnit(newUnit);
    Animated.timing(animation, {
      toValue: newUnit === 'kVAh' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Toggle and Zone Toggle */}
      <View style={styles.bottomRow}>
        <View style={styles.toggleWrapper}>
          <Text style={styles.toggleLabel}>kVAh</Text>
          <Pressable
            style={[styles.toggleButton, { width: toggleButtonWidth, height: toggleButtonHeight }]}
            onPress={toggleSwitch}
          >
            <Animated.View
              style={[
                styles.toggleCircle,
                {
                  width: toggleCircleWidth,
                  height: toggleCircleHeight,
                  borderRadius: toggleCircleRadius,
                  transform: [{ translateX }],
                  backgroundColor: selectedUnit === 'kVAh' ? 'red' : '#59CD73',
                },
              ]}
            />
          </Pressable>
          <Text style={styles.toggleLabel}>kWh</Text>
        </View>

        {/* Disabled Zone Toggle */}
        <View style={[styles.zoneToggleWrapper, styles.disabledZoneToggle]}>
          <Pressable
            style={[
              styles.zoneButton,
              zoneToggle === 'all' && styles.zoneButtonActive,
              { borderTopLeftRadius: wp('2%'), borderBottomLeftRadius: wp('2%') },
            ]}
            disabled
          >
            <Text
              style={[
                styles.zoneButtonText,
                zoneToggle === 'all' && styles.zoneButtonTextActive,
              ]}
            >
              All Zones
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.zoneButton,
              zoneToggle === 'single' && styles.zoneButtonActive,
              { borderTopRightRadius: wp('2%'), borderBottomRightRadius: wp('2%') },
            ]}
            disabled
          >
            <Text
              style={[
                styles.zoneButtonText,
                zoneToggle === 'single' && styles.zoneButtonTextActive,
              ]}
            >
              Select Zone
            </Text>
          </Pressable>
        </View>

        <TouchableOpacity style={styles.downloadButton}>
          <Feather name="download" size={wp('4%')} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE ZONE CARDS */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: hp('3%') }}>
        {zones.map((zone, index) => {
          const startValue = zone.min[selectedUnit];
          const endValue = zone.max[selectedUnit];
          const consumed = endValue - startValue;

          const zoneMeta = zoneNames.find(z => z.zone === zone.zone);
          const zoneName = zoneMeta?.name || `Zone ${zone.zone}`;
          const subName = zoneMeta?.subName || '';

          return (
            <View style={styles.card} key={`zone-${zone.zone}`}>
              <View style={styles.headingWrapper}>
                <View style={styles.headingContainer}>
                  <Text style={styles.heading}>{zoneName}</Text>
                  {subName ? <Text style={styles.subHeading}>{subName}</Text> : null}
                </View>
              </View>
              <View style={styles.table}>
                <View style={styles.column}>
                  <View style={styles.cell}>
                    <Text style={styles.label}>Start Date & Time:</Text>
                    <Text style={styles.value}>{zone.min.timestamp}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.cell}>
                    <Text style={styles.label}>End Date & Time:</Text>
                    <Text style={styles.value}>{zone.max.timestamp}</Text>
                  </View>
                </View>
                <View style={styles.column}>
                  <View style={styles.cell}>
                    <Text style={styles.kwhValue}>
                      {startValue.toFixed(1)}{' '}
                      <Text
                        style={[
                          styles.kwhUnit,
                          { color: selectedUnit === 'kVAh' ? 'red' : '#59CD73' },
                        ]}
                      >
                        {selectedUnit}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.cell}>
                    <Text style={styles.kwhValue}>
                      {endValue.toFixed(1)}{' '}
                      <Text
                        style={[
                          styles.kwhUnit,
                          { color: selectedUnit === 'kVAh' ? 'red' : '#59CD73' },
                        ]}
                      >
                        {selectedUnit}
                      </Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.consumptionColumn}>
                  <View style={styles.consumptionBox}>
                    <Text style={styles.consumedValue}>
                      {consumed.toFixed(1)}{' '}
                      <Text
                        style={[
                          styles.kwhUnit,
                          { color: selectedUnit === 'kVAh' ? 'red' : '#59CD73' },
                        ]}
                      >
                        {selectedUnit}
                      </Text>
                    </Text>
                    <Text style={styles.consumptionLabel}>consumption</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginTop: hp('1%'),
    borderRadius: wp('2.5%'),
    borderWidth: 1,
    borderColor: '#ccc',
  },
  headingWrapper: {
    alignItems: 'center',
  },
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#08223B',
    width: wp('75%'),
    paddingVertical: hp('0.7%'),
    borderBottomRightRadius: wp('4.5%'),
    borderBottomLeftRadius: wp('4.5%'),
    alignItems: 'center',
    gap: wp('2%'),
  },
  heading: {
    color: '#fff',
    fontSize: wp('3%'),
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  subHeading: {
    color: '#ccc',
    fontSize: wp('2.5%'),
    fontFamily: 'Poppins',
  },
  table: {
    padding: wp('0.5%'),
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  cell: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: hp('0.5%'),
  },
  label: {
    fontSize: wp('2.5%'),
    color: '#777',
    fontFamily: 'Poppins',
  },
  value: {
    fontSize: wp('2.5%'),
    color: '#777',
    fontFamily: 'Poppins',
  },
  kwhValue: {
    fontSize: wp('3.5%'),
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  kwhUnit: {
    color: 'red',
    fontSize: wp('3%'),
    fontFamily: 'Poppins',
  },
  consumptionColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consumptionBox: {
    alignItems: 'center',
  },
  consumedValue: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins',
  },
  consumptionLabel: {
    fontSize: wp('3%'),
    color: '#888',
    fontFamily: 'Poppins',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    gap: wp('2.5%'),
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('3%'),
    backgroundColor: '#59CD73',
    borderRadius: wp('2%'),
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
  },
  toggleLabel: {
    fontSize: wp('3%'),
    color: '#333',
    fontFamily: 'Poppins',
  },
  toggleButton: {
    borderRadius: wp('3.5%'),
    justifyContent: 'center',
    backgroundColor: '#ccc',
    position: 'relative',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  toggleCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  zoneToggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: wp('2%'),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledZoneToggle: {
    opacity: 0.4,
  },
  zoneButton: {
    paddingVertical: hp('0.4%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fff',
  },
  zoneButtonActive: {
    backgroundColor: 'gray',
  },
  zoneButtonText: {
    color: '#212121',
    fontSize: wp('3%'),
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  zoneButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});