import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';
import { Picker } from '@react-native-picker/picker';

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

const ZONE_COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
  "#FF9F40", "#B5E61D", "#F46A60", "#2C82C9", "#F9C846", "#A47AE2"
];

// Dummy data generator for a zone
function generateZoneData(type: 'kWh' | 'kVAh', zoneIdx: number) {
  return Array.from({ length: 24 }, (_, i) => ({
    x: i < 10 ? `0${i}` : `${i}`,
    y: type === 'kWh'
      ? Math.floor(Math.random() * 30 + 10 + zoneIdx * 2)
      : Math.floor(Math.random() * 30 + 25 + zoneIdx * 3),
  }));
}

type ZonesSelectProps = {
  selectedUnit?: 'kWh' | 'kVAh';
};

export default function ZonesSelect({ selectedUnit = 'kWh' }: ZonesSelectProps) {
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);

  const data = useMemo(
    () => generateZoneData(selectedUnit, selectedZoneIdx),
    [selectedUnit, selectedZoneIdx]
  );

  return (
    <View style={styles.container}>
      {/* Dropdown */}
      <View style={styles.dropdownWrapper}>
        <Picker
          selectedValue={selectedZoneIdx}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedZoneIdx(itemValue)}
          mode="dropdown"
        >
          {ZONES.map((zone, idx) => (
            <Picker.Item
              key={zone.name}
              label={`${zone.name} (${zone.subName})`}
              value={idx}
              color="#222"
            />
          ))}
        </Picker>
      </View>

      {/* Bar Chart for Selected Zone */}
      <View>
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
          <VictoryBar
            data={data}
            style={{
              data: { fill: ZONE_COLORS[selectedZoneIdx] }
            }}
            barWidth={18}
          />
        </VictoryChart>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 8,
    minHeight: 350,
  },
  dropdownWrapper: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 44,
    fontSize: 15,
  },
});