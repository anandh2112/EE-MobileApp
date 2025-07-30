import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackedBarChart, BarChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

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

type ZonesProps = {
  startDate: string;
  endDate: string;
  meterId?: string | string[];
};

const screenWidth = Dimensions.get('window').width;
const chartHeight = 260;
const barWidth = 50;

const barChartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 1,
  color: () => "#2CAFFE",
  labelColor: () => "#000",
  style: {
    borderRadius: 6,
  },
  propsForBackgroundLines: {
    strokeWidth: 0,
    stroke: "#ffffff",
  },
  fillShadowGradient: "#2CAFFE",
  fillShadowGradientOpacity: 1,
};

type ChartData = 
  | {
      type: 'stacked';
      labels: string[];
      legend: string[];
      data: number[][];
      barColors: string[];
    }
  | {
      type: 'bar';
      labels: string[];
      datasets: { data: number[] }[];
      zoneName: string;
    };

export default function Zones({ startDate, endDate, meterId }: ZonesProps) {
  const [selectedUnit, setSelectedUnit] = useState<'kVAh' | 'kWh'>('kVAh');
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
      setSelectedZone(Array.isArray(meterId) ? meterId[0] : meterId.toString());
    } else {
      setSelectedView('all');
    }
  }, [meterId]);

  const toggleButtonWidth = 60;
  const toggleButtonHeight = 18;
  const toggleCircleWidth = 28;
  const toggleCircleHeight = 18;
  const toggleCircleRadius = 14;

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
    const newUnit = selectedUnit === 'kVAh' ? 'kWh' : 'kVAh';
    setSelectedUnit(newUnit);
    Animated.timing(animation, {
      toValue: newUnit === 'kVAh' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const hourlyLabels = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  const generateChartData = (): ChartData => {
    if (selectedView === 'all') {
      const data = hourlyLabels.map((label, hourIndex) =>
        zoneMetadata.map((zone) => {
          const zoneDataItem = zoneData.find(item => item.zoneId === zone.id);
          const hourData = zoneDataItem?.data.find(item => {
            const hourStr = item.hour.split(' ')[1]?.split(':')[0];
            return parseInt(hourStr) === hourIndex;
          });
          return hourData?.value || 0;
        })
      );

      return {
        type: 'stacked',
        labels: hourlyLabels,
        legend: zoneMetadata.map(zone => zone.name),
        data: data,
        barColors: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC24A', '#FF5722', '#607D8B', '#E91E63', '#00BCD4', '#795548'
        ],
      };
    } else {
      const selectedZoneId = parseInt(selectedZone);
      const zoneDataItem = zoneData.find(item => item.zoneId === selectedZoneId);

      const data = hourlyLabels.map((label, hourIndex) => {
        const hourData = zoneDataItem?.data.find(item => {
          const hourStr = item.hour.split(' ')[1]?.split(':')[0];
          return parseInt(hourStr) === hourIndex;
        });
        return hourData?.value || 0;
      });

      return {
        type: 'bar',
        labels: hourlyLabels,
        datasets: [{ data }],
        zoneName: zoneDataItem?.zoneName || '',
      };
    }
  };

  const chartData = generateChartData();
  const dynamicChartWidth = Math.max(
    hourlyLabels.length * barWidth + 60,
    screenWidth
  );

  const thumbWidth = Math.max((screenWidth / dynamicChartWidth) * screenWidth, 30);
  const maxScroll = Math.max(dynamicChartWidth - screenWidth, 0);
  const maxThumbTravel = Math.max(screenWidth - thumbWidth, 0);
  const thumbTranslateX = scrollX.interpolate({
    inputRange: [0, maxScroll || 1],
    outputRange: [0, maxThumbTravel || 0],
    extrapolate: "clamp",
  });

  return (
    <View>
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

        <View style={styles.zoneToggleWrapper}>
          <Pressable
            style={[
              styles.zoneButton,
              selectedView === 'all' && styles.zoneButtonActive,
              { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
            ]}
            onPress={() => setSelectedView('all')}
          >
            <Text style={[styles.zoneButtonText, selectedView === 'all' && styles.zoneButtonTextActive]}>
              All Zones
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.zoneButton,
              selectedView === 'single' && styles.zoneButtonActive,
              { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
            ]}
            onPress={() => setSelectedView('single')}
          >
            <Text style={[styles.zoneButtonText, selectedView === 'single' && styles.zoneButtonTextActive]}>
              Select Zone
            </Text>
          </Pressable>
        </View>

        <TouchableOpacity style={styles.downloadButton}>
          <Feather name="download" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {selectedView === 'single' && chartData.type === 'bar' 
            ? `${chartData.zoneName} Hourly Consumption` 
            : 'Hourly Consumption'}
        </Text>
        <View style={styles.scrollContainer}>
          {selectedView === 'all' && chartData.type === 'stacked' ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View style={{ marginLeft: -20 }}>
                  <StackedBarChart
                    data={{
                      labels: chartData.labels,
                      legend: chartData.legend,
                      data: chartData.data,
                      barColors: chartData.barColors,
                    }}
                    width={screenWidth * 2.2}
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      formatYLabel: (y) => parseInt(y).toString(),
                      color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                      style: { borderRadius: 8 },
                      propsForLabels: {
                        fontSize: 10,
                        textAnchor: 'middle',
                        alignmentBaseline: 'central',
                      },
                      propsForBackgroundLines: { strokeWidth: 0},
                      barPercentage: 0.9,
                    }}
                    hideLegend
                    fromZero
                    withHorizontalLabels
                    withVerticalLabels 
                    segments={3}
                    style={{
                      marginVertical: 8,
                      marginRight: 20,
                      paddingLeft: 20, // Added padding to shift bars to the right
                    }}
                  />
                </View>
              </ScrollView>

              <View style={styles.legendContainer}>
                {zoneMetadata.map((zone, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: chartData.barColors[index] }]} />
                    <Text style={styles.legendText}>{zone.name}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : selectedView === 'single' && chartData.type === 'bar' ? (
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
                style={{ marginBottom: 10 }}
              >
                <View style={{ marginLeft: -40 }}>
                  <BarChart
                    data={{
                      labels: chartData.labels,
                      datasets: chartData.datasets,
                    }}
                    width={dynamicChartWidth}
                    height={chartHeight}
                    yAxisLabel=""
                    yAxisSuffix=""
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    showValuesOnTopOfBars={true}
                    yLabelsOffset={-1}
                    chartConfig={barChartConfig}
                    fromZero
                    style={{ borderRadius: 6 }}
                  />
                </View>
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
                >
                  {zoneMetadata.map((zone) => (
                    <Picker.Item
                      label={zone.name}
                      value={zone.id.toString()}
                      key={zone.id}
                    />
                  ))}
                </Picker>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
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
  zoneButton: {
    paddingVertical: 3,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  zoneButtonActive: {
    backgroundColor: '#2563eb',
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
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#59CD73',
    borderRadius: 8,
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  scrollContainer: {
    overflow: 'hidden',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#333',
  },
  pickerContainer: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  scrollBarTrack: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginHorizontal: 2,
    marginBottom: 2,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  scrollBarThumb: {
    height: 4,
    backgroundColor: '#007bff',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});