import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VictoryChart, VictoryStack, VictoryBar, VictoryAxis, VictoryLegend, VictoryTheme } from 'victory-native';

const ZONES = [
  { name: "PLATING", subName: "C-49" },
  { name: "DIE CASTING + CHINA BUFFING + CNC", subName: "C-50" },
  { name: "SCOTCH BUFFING", subName: "C-50" },
  { name: "BUFFING", subName: "C-49" },
  { name: "SPRAY+EPL-I", subName: "C-50" },
  { name: "SPRAY+ EPL-II", subName: "C-49" },
  { name: "RUMBLE", subName: "C-50" },
  { name: "AIR COMPRESSOR", subName: "C-49" },
  { name: "TERRACE", subName: "C-49" },
  { name: "TOOL ROOM", subName: "C-50" },
  { name: "ADMIN BLOCK", subName: "C-50" }
];

// 11 colors for the 11 zones
const ZONE_COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
  "#FF9F40", "#B5E61D", "#F46A60", "#2C82C9", "#F9C846", "#A47AE2"
];

// Dummy data generator
function generateDummyData(type: 'kWh' | 'kVAh') {
  // 24 hours for x-axis
  const hours = Array.from({ length: 24 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));

  // For each zone, create an array of 24 values
  return ZONES.map((zone, zoneIdx) => {
    return hours.map((hour, hourIdx) => ({
      x: hour,
      y:
        // Different pattern for kWh and kVAh for demonstration
        type === 'kWh'
          ? Math.floor(Math.random() * 30 + 10 + zoneIdx * 2)
          : Math.floor(Math.random() * 30 + 25 + zoneIdx * 3),
    }));
  });
}

type ZonesAllProps = {
  selectedUnit?: 'kWh' | 'kVAh';
};

export default function ZonesAll({ selectedUnit = 'kWh' }: ZonesAllProps) {
  // Memoize data so it doesn't change on every render!
  const data = useMemo(() => generateDummyData(selectedUnit), [selectedUnit]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal contentContainerStyle={{ minWidth: 600 }}>
        <VictoryChart
          width={700}
          height={300}
          domainPadding={{ x: 16, y: 16 }}
          padding={{ top: 32, left: 64, right: 24, bottom: 64 }}
          theme={VictoryTheme.material}
        >
          <VictoryAxis
            label="Hour"
            style={{
              axisLabel: { padding: 30, fontSize: 14 },
              tickLabels: { fontSize: 10, angle: -45 }
            }}
            tickValues={Array.from({ length: 24 }, (_, i) => (i < 10 ? `0${i}` : `${i}`))}
          />
          <VictoryAxis
            dependentAxis
            label={selectedUnit === "kVAh" ? "Consumption (kVAh)" : "Consumption (kWh)"}
            style={{
              axisLabel: { padding: 36, fontSize: 14 },
              tickLabels: { fontSize: 10 }
            }}
          />
          <VictoryStack colorScale={ZONE_COLORS}>
            {data.map((zoneData, idx) => (
              <VictoryBar key={idx} data={zoneData} />
            ))}
          </VictoryStack>
        </VictoryChart>
      </ScrollView>

      {/* Legends */}
      <View style={styles.legendsContainer}>
        {ZONES.map((zone, idx) => (
          <View key={zone.name} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: ZONE_COLORS[idx] }]} />
            <Text style={styles.legendLabel}>
              {zone.name} <Text style={{ color: "#666", fontSize: 11 }}>({zone.subName})</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 8,
    minHeight: 400,
  },
  legendsContainer: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginBottom: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  legendLabel: {
    fontSize: 13,
    color: '#222',
  },
});