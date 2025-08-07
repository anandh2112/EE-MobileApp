import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const zoneMetadata = [
  { id: 1, name: 'PLATING', category: 'C-49' },
  { id: 2, name: 'DC+ CB + CNC', category: 'C-50' },
  { id: 3, name: 'SCOTCH BUFFING', category: 'C-50' },
  { id: 4, name: 'BUFFING', category: 'C-49' },
  { id: 5, name: 'SPRAY+EPL-I', category: 'C-50' },
  { id: 6, name: 'SPRAY+ EPL-II', category: 'C-49' },
  { id: 7, name: 'RUMBLE', category: 'C-50' },
  { id: 8, name: 'AIR COMPRESSOR', category: 'C-49' },
  { id: 9, name: 'TERRACE', category: 'C-49' },
  { id: 10, name: 'TOOL ROOM', category: 'C-50' },
  { id: 11, name: 'ADMIN BLOCK', category: 'C-50' },
  { id: 12, name: 'TRANSFORMER', category: '' },
];

type PeakAnalysisProps = {
  startDate: string;
  endDate: string;
  meterId?: string | number | string[];
};

export default function PeakAnalysis({ startDate, endDate, meterId }: PeakAnalysisProps) {
  const params = useLocalSearchParams();
  const [selectedUnit] = useState<'kVAh' | 'kWh'>('kVAh');
  const animation = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  type ZoneDataItem = {
    zoneId: number;
    zoneName: string;
    category: string;
    data: { hour: any; value: number }[];
  };

  const [zoneData, setZoneData] = useState<ZoneDataItem[]>([]);
  const [selectedView, setSelectedView] = useState<'all' | 'single'>('all');
  const [selectedZone, setSelectedZone] = useState('1');

  useEffect(() => {
    if (meterId) {
      setSelectedView('single');
      const id = Array.isArray(meterId) ? meterId[0] : meterId;
      setSelectedZone(id.toString());
    } else {
      setSelectedView('all');
    }
  }, [meterId, params.meterId]);

  const toggleButtonWidth = wp('15%');
  const toggleButtonHeight = hp('2.2%');
  const toggleCircleWidth = wp('7%');
  const toggleCircleHeight = hp('2.2%');
  const toggleCircleRadius = wp('3.5%');

  useEffect(() => {
    const startDateTime = startDate;
    const endDateTime = endDate;

    const fetchZoneData = async () => {
      try {
        const isAllZones = selectedView === 'all';

        let endpoint = isAllZones
          ? selectedUnit === 'kWh'
            ? 'zkWhAZconsumption'
            : 'zkVAhAZconsumption'
          : selectedUnit === 'kWh'
            ? 'zconsumption'
            : 'zkVAhconsumption';

        let response;
        if (isAllZones) {
          response = await axios.get(`https://mw.elementsenergies.com/api/${endpoint}`, {
            params: { startDateTime, endDateTime },
          });
        } else {
          response = await axios.get(`https://mw.elementsenergies.com/api/${endpoint}`, {
            params: { startDateTime, endDateTime, zone: selectedZone },
          });
        }

        const data = response.data?.consumptionData || [];

        const groupedData = data.reduce((acc: { [x: string]: any[] }, item: { energy_meter_id: any }) => {
          const zoneId = item.energy_meter_id;
          if (!acc[zoneId]) {
            acc[zoneId] = [];
          }
          acc[zoneId].push(item);
          return acc;
        }, {});

        const formattedData = zoneMetadata
          .filter(zone => Object.keys(groupedData).includes(zone.id.toString()))
          .map(zone => {
            const zData = groupedData[zone.id] || [];
            const parsedData = zData.map((item: { hour: any; kWh_difference: any; kVAh_difference: any }) => ({
              hour: item.hour,
              value: parseFloat(
                selectedUnit === 'kWh' ? item.kWh_difference || 0 : item.kVAh_difference || 0
              ),
            }));

            return {
              zoneId: zone.id,
              zoneName: zone.name,
              category: zone.category || '',
              data: parsedData,
            };
          });

        setZoneData(formattedData);
      } catch (error) {
        console.error('Error fetching zone data:', error);
      }
    };

    fetchZoneData();
  }, [selectedUnit, selectedView, selectedZone, startDate, endDate]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, toggleButtonWidth - toggleCircleWidth],
  });

  const toggleSwitch = () => {
    // This is kept for consistency but disabled in this component
  };

  const hourlyLabels = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  const zoneColors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
    "#FF9F40", "#8AC24A", "#FF5722", "#607D8B", "#E91E63",
    "#00BCD4", "#795548"
  ];

  const generateChartData = () => {
    if (selectedView === 'all') {
      const datasets = zoneMetadata.map((zone, index) => {
        const zoneDataItem = zoneData.find(item => item.zoneId === zone.id);
        const data = hourlyLabels.map((label, hourIndex) => {
          const hourData = zoneDataItem?.data.find(item => {
            const hourStr = item.hour.split(' ')[1]?.split(':')[0];
            return parseInt(hourStr) === hourIndex;
          });
          return hourData?.value || 0;
        });

        return {
          data,
          color: () => zoneColors[index],
          strokeWidth: 2,
          withDots: false,
        };
      });

      return {
        labels: hourlyLabels,
        datasets,
      };
    } else {
      const selectedZoneId = parseInt(selectedZone);
      const zoneDataItem = zoneData.find(item => item.zoneId === selectedZoneId);
      const zoneMetadataItem = zoneMetadata.find(zone => zone.id === selectedZoneId);

      const data = zoneDataItem 
        ? hourlyLabels.map((label, hourIndex) => {
            const hourData = zoneDataItem.data.find(item => {
              const hourStr = item.hour.split(' ')[1]?.split(':')[0];
              return parseInt(hourStr) === hourIndex;
            });
            return hourData?.value || 0;
          })
        : Array(24).fill(0);

      return {
        labels: hourlyLabels,
        datasets: [{
          data,
          color: () => "#2CAFFE",
          strokeWidth: 2,
          withDots: true,
        }],
        zoneName: zoneDataItem?.zoneName || zoneMetadataItem?.name || 'Unknown Zone',
      };
    }
  };

  const chartData = generateChartData();
  const dynamicChartWidth = Math.max(
    hourlyLabels.length * wp('12%') + wp('15%'),
    wp('100%')
  );

  const thumbWidth = Math.max((wp('100%') / dynamicChartWidth) * wp('100%'), wp('8%'));
  const maxScroll = Math.max(dynamicChartWidth - wp('100%'), 0);
  const maxThumbTravel = Math.max(wp('100%') - thumbWidth, 0);
  const thumbTranslateX = scrollX.interpolate({
    inputRange: [0, maxScroll || 1],
    outputRange: [0, maxThumbTravel || 0],
    extrapolate: "clamp",
  });

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: wp('4%'),
    },
    propsForDots: {
      r: wp('1%'),
      strokeWidth: wp('0.3%'),
      stroke: "#fff",
    },
    fillShadowGradientFromOpacity: 0,
    fillShadowGradientToOpacity: 0,
    useShadowColorFromDataset: false,
  };

  return (
    <View>
      <View style={styles.bottomRow}>
        <View style={[styles.toggleWrapper, styles.disabledToggle]}>
          <Text style={[styles.toggleLabel, styles.toggleLabelDisabled]}>kVAh</Text>
          <Pressable
            style={[
              styles.toggleButton,
              { width: toggleButtonWidth, height: toggleButtonHeight },
              styles.toggleButtonDisabled,
            ]}
            disabled
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
                  backgroundColor: selectedUnit === 'kVAh' ? 'grey' : '#59CD73',
                  opacity: 0.5,
                }
              ]}
            />
          </Pressable>
          <Text style={[styles.toggleLabel, styles.toggleLabelDisabled]}>kWh</Text>
        </View>

        <View style={styles.zoneToggleWrapper}>
          <Pressable
            style={[
              styles.zoneButton,
              selectedView === 'all' && styles.zoneButtonActive,
              { borderTopLeftRadius: wp('2%'), borderBottomLeftRadius: wp('2%') }
            ]}
            onPress={() => setSelectedView('all')}
          >
            <Text style={[
              styles.zoneButtonText,
              selectedView === 'all' && styles.zoneButtonTextActive
            ]}>
              All Zones
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.zoneButton,
              selectedView === 'single' && styles.zoneButtonActive,
              { borderTopRightRadius: wp('2%'), borderBottomRightRadius: wp('2%') }
            ]}
            onPress={() => setSelectedView('single')}
          >
            <Text style={[
              styles.zoneButtonText,
              selectedView === 'single' && styles.zoneButtonTextActive
            ]}>
              Select Zone
            </Text>
          </Pressable>
        </View>

        <TouchableOpacity style={styles.downloadButton}>
          <Feather name="download" size={wp('4%')} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {selectedView === 'single' 
            ? `${chartData.zoneName || 'Selected Zone'} Hourly Peak Analysis` 
            : 'Hourly Peak Analysis'}
        </Text>
        
        {selectedView === 'all' ? (
          <>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
            >
              <LineChart
                data={chartData}
                width={dynamicChartWidth}
                height={hp('27%')}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: hp('1%'),
                  borderRadius: wp('3%'),
                }}
                withDots={false}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={true}
                withHorizontalLines={true}
                segments={4}
                fromZero={true}
              />
            </Animated.ScrollView>

            <View style={styles.scrollBarTrack}>
              <Animated.View
                style={[
                  styles.scrollBarThumb,
                  {
                    width: thumbWidth,
                    transform: [{ translateX: thumbTranslateX }],
                  },
                ]}
              />
            </View>

            <View style={styles.legendContainer}>
              {zoneMetadata.map((zone, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: zoneColors[index]}]} />
                  <Text style={styles.legendText}>{zone.name}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ minWidth: dynamicChartWidth }}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              style={{ marginBottom: hp('1%') }}
            >
              <LineChart
                data={chartData}
                width={dynamicChartWidth}
                height={hp('27%')}
                chartConfig={{
                  ...chartConfig,
                  color: () => "#2CAFFE",
                }}
                bezier
                style={{
                  marginVertical: hp('1%'),
                  borderRadius: wp('3%'),
                }}
                withDots={true}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={true}
                withHorizontalLines={true}
                segments={4}
                fromZero={true}
              />
            </Animated.ScrollView>

            <View style={styles.scrollBarTrack}>
              <Animated.View
                style={[
                  styles.scrollBarThumb,
                  {
                    width: thumbWidth,
                    transform: [{ translateX: thumbTranslateX }],
                  },
                ]}
              />
            </View>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedZone}
                onValueChange={(itemValue) => setSelectedZone(itemValue)}
                style={styles.picker}
                dropdownIconColor="#333"
                mode="dropdown"
                itemStyle={styles.pickerItem}
              >
                {zoneMetadata.map((zone) => (
                  <Picker.Item
                    label={zone.name}
                    value={zone.id.toString()}
                    key={zone.id}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    gap: wp('2.5%'),
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
  },
  disabledToggle: {
    opacity: 0.5,
  },
  toggleLabel: {
    fontSize: wp('3%'),
    color: '#333',
    fontFamily: 'Poppins',
  },
  toggleLabelDisabled: {
    color: '#888',
  },
  toggleButton: {
    borderRadius: wp('3.5%'),
    justifyContent: 'center',
    backgroundColor: '#ccc',
    position: 'relative',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  toggleButtonDisabled: {
    opacity: 0.5,
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
    borderWidth: wp('0.3%'),
    borderColor: '#e0e0e0',
  },
  zoneButton: {
    paddingVertical: hp('0.4%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fff',
  },
  zoneButtonActive: {
    backgroundColor: '#2563eb',
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
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('3%'),
    backgroundColor: '#59CD73',
    borderRadius: wp('2%'),
  },
  chartCard: {
    backgroundColor: '#fff',
    padding: wp('3%'),
    marginVertical: hp('1%'),
    borderRadius: wp('3%'),
    elevation: 1,
    borderWidth: wp('0.3%'),
    borderColor: '#ddd',
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
    shadowOffset: { width: 0, height: hp('0.25%') },
    marginHorizontal: 0,
  },
  chartTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  scrollContent: {
    paddingRight: wp('4%'),
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: hp('2%'),
    gap: wp('2%'),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp('3%'),
    marginBottom: hp('1%'),
  },
  legendColor: {
    width: wp('3%'),
    height: wp('3%'),
    borderRadius: wp('1.5%'),
    marginRight: wp('1%'),
  },
  legendText: {
    fontSize: wp('2.5%'),
    color: '#333',
    fontFamily: 'Poppins',
  },
  pickerContainer: {
    marginTop: hp('1%'),
    marginBottom: hp('1.5%'),
    backgroundColor: '#f2f2f2',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('2%'),
    overflow: 'hidden',
  },
  picker: {
    height: hp('6%'),
    width: '100%',
    color: '#333',
    fontFamily: 'Poppins',
  },
  pickerItem: {
    fontSize: wp('3.5%'),
    fontFamily: 'Poppins',
    height: hp('6%'),
    color: '#333',
  },
  scrollBarTrack: {
    height: hp('0.5%'),
    backgroundColor: '#eee',
    borderRadius: wp('0.5%'),
    marginHorizontal: wp('0.5%'),
    marginBottom: hp('0.5%'),
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  scrollBarThumb: {
    height: hp('0.5%'),
    backgroundColor: '#007bff',
    borderRadius: wp('0.5%'),
    position: 'absolute',
    top: 0,
    left: 0,
  },
});