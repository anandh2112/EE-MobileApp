import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import moment from 'moment-timezone';

interface Props {
  visible: boolean;
  onClose: () => void;
  dgNo: 13 | 14;
  modalData: any;
  onDGToggle: (newDG: 13 | 14) => void;
}

export default function DGDetailsModal({
  visible,
  onClose,
  dgNo,
  modalData,
  onDGToggle,
}: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const responsiveFontSize = windowWidth < 400 ? 12 : 14;
  const chartWidth = windowWidth * 0.85;
  const chartHeight = windowHeight * 0.3;

  const [loading, setLoading] = useState(true);
  const [energyProduced, setEnergyProduced] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('Off');
  const [vlnValue, setVlnValue] = useState<number | null>(null);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  const [toggleAnim] = useState(new Animated.Value(dgNo === 13 ? 0 : 1));

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: dgNo === 13 ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [dgNo]);

  useEffect(() => {
    if (!modalData) return;

    setLoading(true);
    try {
      const currentDGData = modalData[dgNo === 13 ? 'DG1' : 'DG2'];
      
      if (currentDGData?.dgd?.energyProduced !== undefined) {
        setEnergyProduced(currentDGData.dgd.energyProduced);
      } else {
        setEnergyProduced(0);
      }

      const meterInfo = currentDGData.dgdcv?.[dgNo];
      if (meterInfo) {
        setVlnValue(meterInfo.avg_vln_value);
        setCurrentValue(meterInfo.avg_current_value);
        setTimestamp(meterInfo.timestamp);
      } else {
        setVlnValue(null);
        setCurrentValue(null);
        setTimestamp(null);
      }

      if (meterInfo?.timestamp) {
        const now = moment.tz("Asia/Kolkata");
        const last = moment.tz(meterInfo.timestamp, "Asia/Kolkata");
        const diffSeconds = now.diff(last, "seconds");
        setStatus(diffSeconds <= 180 ? "Running" : "Off");
      } else {
        setStatus("Off");
      }

      if (currentDGData?.dgdrt?.[dgNo]) {
        setRuntime(currentDGData.dgdrt[dgNo].runningTimeMinutes);
      } else {
        setRuntime(null);
      }

      const hourlyData = currentDGData?.hrly_kwh_diff?.[dgNo];
      if (hourlyData) {
        const formatted = Object.entries(hourlyData).map(([ts, kWh]) => ({
          y: kWh,
          originalTimestamp: ts,
        }));
        setConsumptionData(formatted);
      } else {
        setConsumptionData([]);
      }
    } catch (error) {
      console.error('Failed to process DG modal data:', error);
      setEnergyProduced(0);
      setConsumptionData([]);
    } finally {
      setLoading(false);
    }
  }, [modalData, dgNo]);

  const getStatusColor = (status: string) => {
    return status === 'Running' ? 'green' : 'red';
  };

  const handleToggleDG = () => {
    const newDG = dgNo === 13 ? 14 : 13;
    onDGToggle(newDG);
  };

  const togglePosition = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50], // Adjust based on your toggle width
  });

  const chartData = {
    labels: consumptionData.map((d) => moment(d.originalTimestamp, "YYYY-MM-DD HH:mm:ss").format("HH:mm")),
    datasets: [
      {
        data: consumptionData.map((d) => d.y),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: () => `#3B82F6`,
    labelColor: () => '#333',
    propsForBackgroundLines: {
      stroke: '#e5e7eb',
      strokeWidth: 0,
    },
    propsForVerticalLabels: {
      fontSize: responsiveFontSize - 2,
    },
    propsForHorizontalLabels: {
      fontSize: responsiveFontSize - 2,
    },
    fillShadowGradient: '#3B82F6',
    fillShadowGradientOpacity: 1,
    barPercentage: 0.7,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    barRadius: 4,
    style: {
      borderRadius: 8,
    },
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={[styles.tooltipBox, { width: windowWidth * 0.9 }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.tooltipTitle, { fontSize: responsiveFontSize + 2 }]}>
              Energy Generation
            </Text>
            <View style={styles.toggleContainer}>
              <Pressable onPress={handleToggleDG} style={styles.toggleWrapper}>
                <Animated.View style={[styles.toggleButton, { transform: [{ translateX: togglePosition }] }]} />
                <View style={styles.toggleOption}>
                  <Text style={[
                    styles.toggleText, 
                    dgNo === 13 && styles.toggleTextActive
                  ]}>DG1</Text>
                </View>
                <View style={styles.toggleOption}>
                  <Text style={[
                    styles.toggleText, 
                    dgNo === 14 && styles.toggleTextActive
                  ]}>DG2</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <View style={styles.chartContainer}>
                <BarChart
                  data={chartData}
                  width={chartWidth - 40}
                  height={chartHeight}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yAxisInterval={1}
                  fromZero
                  chartConfig={chartConfig}
                  showBarTops={false}
                  withCustomBarColorFromData={false}
                  flatColor={true}
                  style={{ marginLeft: -20 }}
                />
              </View>

              <View style={styles.detailsBox}>
                <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>Status: <Text style={{ color: getStatusColor(status) }}>{status}</Text></Text>
                <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>Energy Generation: {energyProduced ?? 'N/A'} kWh</Text>
                <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>Voltage: {vlnValue ?? 'N/A'} V</Text>
                <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>Current: {currentValue ?? 'N/A'} A</Text>
                <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>Total Runtime: {runtime ?? 'N/A'} minutes</Text>
                <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>Last Updated: {timestamp ? moment(timestamp).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</Text>
              </View>
            </>
          )}

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { fontSize: responsiveFontSize }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    maxWidth: 500,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tooltipTitle: {
    fontWeight: 'bold',
  },
  toggleContainer: {
    width: 100, // Total width of the toggle
    height: 30, // Height of the toggle
  },
  toggleWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 15,
    padding: 2,
    position: 'relative',
  },
  toggleButton: {
    position: 'absolute',
    width: 50, // Half of the toggle container width
    height: 26, // Slightly less than toggle wrapper height
    backgroundColor: '#3B82F6',
    borderRadius: 13,
    top: 2,
    left: 2,
  },
  toggleOption: {
    width: 50, // Half of the toggle container width
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  toggleTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white', // White color for selected option
  },
  chartContainer: {
    overflow: 'hidden',
    marginHorizontal: -8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
  },
  detailsBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  detail: {
    marginBottom: 6,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#E11D48',
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});