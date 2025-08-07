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
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import moment from 'moment-timezone';

interface Props {
  visible: boolean;
  onClose: () => void;
  startDateTime: string;
  endDateTime: string;
  dgNo: 13 | 14;
}

export default function DGDetailsModal({
  visible,
  onClose,
  startDateTime,
  endDateTime,
  dgNo,
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

  useEffect(() => {
    if (!visible) return;

    const fetchDGDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://mw.elementsenergies.com/api/dgd?startDateTime=${startDateTime}&endDateTime=${endDateTime}&DGNo=${dgNo}`
        );
        const data = await response.json();

        if (data?.dgd?.energyProduced !== undefined) {
          setEnergyProduced(data.dgd.energyProduced);
        } else {
          setEnergyProduced(0);
        }

        const meterInfo = data.dgdcv?.[dgNo];
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

        if (data?.dgdrt?.[dgNo]) {
          setRuntime(data.dgdrt[dgNo].runningTimeMinutes);
        } else {
          setRuntime(null);
        }

        const hourlyData = data?.hrly_kwh_diff?.[dgNo];
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
        console.error('Failed to fetch DG modal data:', error);
        setEnergyProduced(0);
        setConsumptionData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDGDetails();
  }, [startDateTime, endDateTime, dgNo, visible]);

  const getStatusColor = (status: string) => {
    return status === 'Running' ? 'green' : 'red';
  };

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
          <Text style={[styles.tooltipTitle, { fontSize: responsiveFontSize + 2 }]}>Energy Generation</Text>

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
  tooltipTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
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
