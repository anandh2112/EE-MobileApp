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

  const toggleButtonWidth = 60;
  const toggleButtonHeight = 18;
  const toggleCircleWidth = 28;
  const toggleCircleHeight = 18;
  const toggleCircleRadius = 14;

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
              { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
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
              { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
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
          <Feather name="download" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE ZONE CARDS */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
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
    marginTop: 8,
    borderRadius: 10,
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
    width: '75%',
    paddingVertical: 6,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subHeading: {
    color: '#ccc',
    fontSize: 10,
  },
  table: {
    padding: 2,
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
    marginVertical: 4,
  },
  label: {
    fontSize: 10,
    color: '#777',
  },
  value: {
    fontSize: 10,
    color: '#777',
  },
  kwhValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
  kwhUnit: {
    color: 'red',
    fontSize: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  consumptionLabel: {
    fontSize: 12,
    color: '#888',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#59CD73',
    borderRadius: 8,
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#333',
  },
  toggleButton: {
    borderRadius: 14,
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
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledZoneToggle: {
    opacity: 0.4,
  },
  zoneButton: {
    paddingVertical: 3,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  zoneButtonActive: {
    backgroundColor: 'gray',
  },
  zoneButtonText: {
    color: '#212121',
    fontSize: 12,
    fontWeight: '500',
  },
  zoneButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});