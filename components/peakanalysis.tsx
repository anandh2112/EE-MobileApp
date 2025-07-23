import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

export default function Peakanalysis() {
  const [selectedUnit] = useState<'kVAh' | 'kWh'>('kVAh');
  const animation = useRef(new Animated.Value(0)).current;

  const toggleButtonWidth = 60;
  const toggleButtonHeight = 18;
  const toggleCircleWidth = 28;
  const toggleCircleHeight = 18;
  const toggleCircleRadius = 14;

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, toggleButtonWidth - toggleCircleWidth],
  });

  const [zoneToggle, setZoneToggle] = useState<'all' | 'single'>('all');

  const toggleSwitch = () => {};

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth * 5;

  // Zone data (11 zones)
  const zones = [
    { "name": "PLATING", "subName": "C-49" },
    { "name": "DC+ CB + CNC", "subName": "C-50" }, 
    { "name": "SCOTCH BUFFING", "subName": "C-50" },
    { "name": "BUFFING", "subName": "C-49" },
    { "name": "SPRAY+EPL-I", "subName": "C-50" },
    { "name": "SPRAY+ EPL-II", "subName": "C-49" },
    { "name": "RUMBLE", "subName": "C-50" },
    { "name": "AIR COMPRESSOR", "subName": "C-49" },
    { "name": "TERRACE", "subName": "C-49" },
    { "name": "TOOL ROOM", "subName": "C-50" },
    { "name": "ADMIN BLOCK", "subName": "C-50" }
  ];

  // Hourly labels (00 to 23)
  const hourlyLabels = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));

  // Generate random data for 11 zones across 24 hours
  const generateRandomData = () => {
    return zones.map(() => 
      Array(24).fill(0).map(() => Math.floor(Math.random() * 100) + 20)
    );
  };

  const zoneColors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
    "#FF9F40", "#8AC24A", "#FF5722", "#607D8B", "#E91E63",
    "#00BCD4"
  ];

  const lineChartData = {
    labels: hourlyLabels,
    datasets: zones.map((zone, index) => ({
      data: generateRandomData()[index],
      color: (opacity = 1) => zoneColors[index],
      strokeWidth: 2,
      withDots: true,
    }))
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "1",
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
              zoneToggle === 'all' && styles.zoneButtonActive,
              { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }
            ]}
            onPress={() => setZoneToggle('all')}
          >
            <Text style={[
              styles.zoneButtonText,
              zoneToggle === 'all' && styles.zoneButtonTextActive
            ]}>
              All Zones
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.zoneButton,
              zoneToggle === 'single' && styles.zoneButtonActive,
              { borderTopRightRadius: 8, borderBottomRightRadius: 8 }
            ]}
            onPress={() => setZoneToggle('single')}
          >
            <Text style={[
              styles.zoneButtonText,
              zoneToggle === 'single' && styles.zoneButtonTextActive
            ]}>
              Select Zone
            </Text>
          </Pressable>
        </View>

        <TouchableOpacity style={styles.downloadButton}>
          <Feather name="download" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Card with LineChart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Hourly Peak Analysis</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          <LineChart
            data={lineChartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 12,
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
        </ScrollView>
        
        {/* Custom legend */}
        <View style={styles.legendContainer}>
          {zones.map((zone, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, {backgroundColor: zoneColors[index]}]} />
              <Text style={styles.legendText}>{zone.name}</Text>
            </View>
          ))}
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
  disabledToggle: {
    opacity: 0.5,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#333',
  },
  toggleLabelDisabled: {
    color: '#888',
  },
  toggleButton: {
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: '#ccc',
    position: 'relative',
    paddingHorizontal: 0, // Remove horizontal padding for no gap
    overflow: 'hidden',
  },
  toggleButtonDisabled: {
    opacity: 0.5,
  },
  toggleCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    // width, height, borderRadius, backgroundColor set dynamically
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
  chartCard: {
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
    marginHorizontal: 0,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  scrollContent: {
    paddingRight: 16,
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
});