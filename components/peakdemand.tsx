import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;
const chartWidth =1500;
const chartHeight = 250;
const TOOLTIP_WIDTH = 130;
const TOOLTIP_HEIGHT = 45;
const CHART_SEGMENTS = 4;

function getDynamicYAxisLabels(dataArr: number[], steps: number) {
  if (!dataArr || dataArr.length === 0) return [];
  const max = Math.max(...dataArr);
  let axisMax: number;
  if (max > 1000) axisMax = Math.ceil(max / 100) * 100;
  else if (max > 500) axisMax = Math.ceil(max / 50) * 50;
  else axisMax = Math.ceil(max / 10) * 10;
  const labels: number[] = [];
  for (let i = 0; i <= steps; i++) {
    labels.push(Math.round(axisMax - (axisMax / steps) * i));
  }
  labels[labels.length - 1] = 0;
  return labels;
}

interface PeakDemandBlock {
  time: string;
  value: string;
  timestamp: string;
}

interface Props {
  startDateTime: string;
  endDateTime: string;
}

const PeakDemand: React.FC<Props> = ({ startDateTime, endDateTime }) => {
  const [peakDemandData, setPeakDemandData] = useState<PeakDemandBlock[]>([]);
  const [selectedDot, setSelectedDot] = useState<{
    value: number;
    x: number;
    y: number;
    index: number;
  } | null>(null);

  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedDot) {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = setTimeout(() => {
        setSelectedDot(null);
      }, 5000);
    }
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }
    };
  }, [selectedDot]);

  useEffect(() => {
    if (!startDateTime || !endDateTime) return;

    const fetchData = async () => {
      try {
        const url = `https://mw.elementsenergies.com/api/opeakdemandmb?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;
        const res = await axios.get(url);
        setPeakDemandData(res.data.peakDemandBlocks || []);
      } catch (error) {
        console.error('Failed to fetch peak demand data:', error);
      }
    };

    fetchData();
  }, [startDateTime, endDateTime]);

  const scrollX = useRef(new Animated.Value(0)).current;
  const thumbWidth = (screenWidth / chartWidth) * screenWidth;
  const maxScroll = chartWidth - screenWidth;
  const maxThumbTravel = screenWidth - thumbWidth;
  const thumbTranslateX = scrollX.interpolate({
    inputRange: [0, maxScroll > 0 ? maxScroll : 1],
    outputRange: [0, maxThumbTravel > 0 ? maxThumbTravel : 0],
    extrapolate: 'clamp',
  });

  const upperCeiling = Array(peakDemandData.length).fill(745);
  const lowerCeiling = Array(peakDemandData.length).fill(596);
  const values = peakDemandData.map((item) => parseFloat(item.value));

  // Format time into labels for even-indexed entries
  const formattedLabels = peakDemandData.map((item, index) => {
    if (index % 2 === 0) {
      return moment(item.timestamp).format('HH');
    }
    return '';
  });

  const data = {
    labels: formattedLabels,
    datasets: [
      {
        data: values,
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
      },
      {
        data: upperCeiling,
        withDots: false,
        color: () => `rgba(255, 0, 0, 1)`,
      },
      {
        data: lowerCeiling,
        withDots: false,
        color: () => `rgba(255, 165, 0, 1)`,
      },
    ],
  };

  const getTooltipPosition = (dot: { x: number; y: number } | null) => {
    if (!dot) return { left: 0, top: 0 };
    let left = dot.x - TOOLTIP_WIDTH / 2;
    if (left < 0) left = 0;
    if (left > chartWidth - TOOLTIP_WIDTH) left = chartWidth - TOOLTIP_WIDTH;
    let top = dot.y - TOOLTIP_HEIGHT - 8;
    if (top < 0) top = 0;
    return { left, top };
  };

  const getLabel = (index: number) => {
    const block = peakDemandData[index];
    return block ? `${block.timestamp}` : '';
  };

  const allData = [...values, ...upperCeiling, ...lowerCeiling];
  const yAxisLabels = getDynamicYAxisLabels(allData, CHART_SEGMENTS);

  const onDownloadPress = () => {
    alert('Download feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Peak Demand</Text>
          <TouchableOpacity style={styles.downloadButton} onPress={onDownloadPress}>
            <Feather name="download" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
              contentContainerStyle={{ minWidth: chartWidth }}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
            >
              <View style={{ width: chartWidth, marginLeft: -20 }}>
                <LineChart
                  data={data}
                  width={chartWidth}
                  height={chartHeight}
                  fromZero
                  segments={CHART_SEGMENTS}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#1C7ED6',
                    },
                    propsForBackgroundLines: {
                      strokeWidth: 1,
                      stroke: '#e3e3e3',
                    },
                  }}
                  verticalLabelRotation={0} // Keep labels horizontal
                  withShadow={false}
                  bezier={false}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  withInnerLines={false}
                  onDataPointClick={({ value, x, y, index }) =>
                    setSelectedDot({ value, x, y, index })
                  }
                />
                {selectedDot && (
                  <View
                    style={{
                      position: 'absolute',
                      ...getTooltipPosition(selectedDot),
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      width: TOOLTIP_WIDTH,
                      height: TOOLTIP_HEIGHT,
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11 }}>
                      {getLabel(selectedDot.index)}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                      {selectedDot.value} kVA
                    </Text>
                  </View>
                )}
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
          </View>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItemWithValue}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: 'rgba(255, 0, 0, 1)' }]}
              />
              <Text style={styles.legendLabel}>Upper Ceiling</Text>
            </View>
            <Text style={styles.legendValue}>745 kVA</Text>
          </View>
          <View style={styles.legendItemWithValue}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: 'rgba(255, 165, 0, 1)' }]}
              />
              <Text style={styles.legendLabel}>Lower Ceiling</Text>
            </View>
            <Text style={styles.legendValue}>596 kVA</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PeakDemand;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  downloadButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    marginRight: 0,
  },
  legendColor: {
    width: 16,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    color: '#222',
  },
  legendItemWithValue: {
    alignItems: 'center',
    marginRight: 16,
  },
  legendValue: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
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
