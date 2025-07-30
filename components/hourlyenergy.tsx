import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Feather } from "@expo/vector-icons";
import axios from "axios";

const screenWidth = Dimensions.get("window").width;
const chartHeight = 260;
const barWidth = 50; // Adjust bar width for uniform spacing

const chartConfig = {
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

type MetricKey = "kVAh" | "kWh" | "INR";

interface HourlyEnergyProps {
  startDateTime: string;
  endDateTime: string;
}

export default function HourlyEnergy({
  startDateTime,
  endDateTime,
}: HourlyEnergyProps) {
  const [energyData, setEnergyData] = useState<number[]>([]);
  const [xAxisLabels, setXAxisLabels] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("kVAh");

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = "";
        if (selectedMetric === "kWh") endpoint = "hconsumption";
        else if (selectedMetric === "kVAh") endpoint = "hkVAhconsumption";
        else if (selectedMetric === "INR") endpoint = "hcostconsumption";

        const response = await axios.get(
          `https://mw.elementsenergies.com/api/${endpoint}`,
          {
            params: { startDateTime, endDateTime },
          }
        );

        const rawData = response.data?.consumptionData || {};
        const sortedEntries = Object.entries(rawData)
          .map(([timestamp, value]) => ({
            hour: new Date(timestamp).getHours(),
            value: parseFloat(value as string) || 0,
            timestamp,
          }))
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        const labels = sortedEntries.map((entry) => entry.hour.toString());
        const data = sortedEntries.map((entry) => entry.value);

        setXAxisLabels(labels);
        setEnergyData(data);
      } catch (error) {
        console.error("Error fetching energy data:", error);
        setEnergyData([]);
        setXAxisLabels([]);
      }
    };

    if (startDateTime && endDateTime) fetchData();
  }, [startDateTime, endDateTime, selectedMetric]);

  const dynamicChartWidth = Math.max(
    energyData.length * barWidth + 60,
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

  const metricOptions: { key: MetricKey; label: string }[] = [
    { key: "kVAh", label: "kVAh" },
    { key: "kWh", label: "kWh" },
    { key: "INR", label: "INR (₹)" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Hourly Energy Consumption</Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Feather name="download" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          {metricOptions.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedMetric(key)}
              style={[
                styles.toggleButton,
                selectedMetric === key && styles.activeButton,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedMetric === key && styles.activeText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {energyData.length > 0 ? (
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
                    labels: xAxisLabels,
                    datasets: [{ data: energyData }],
                  }}
                  width={dynamicChartWidth}
                  height={chartHeight}
                  yAxisLabel=""
                  yAxisSuffix=""
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  showValuesOnTopOfBars={true}
                  yLabelsOffset={-1}
                  chartConfig={{
                    ...chartConfig,
                    decimalPlaces: 0,
                  }}
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
          </>
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
  },
  downloadButton: {
    backgroundColor: "#007bff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#007bff",
  },
  toggleText: {
    color: "#000",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },
  scrollBarTrack: {
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    marginHorizontal: 2,
    marginBottom: 2,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  scrollBarThumb: {
    height: 4,
    backgroundColor: "#007bff",
    borderRadius: 2,
    position: "absolute",
    top: 0,
    left: 0,
  },
  noDataText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
  },
});
