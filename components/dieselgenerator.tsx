import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import moment from 'moment-timezone';
import { BarChart } from 'react-native-chart-kit';

interface DieselGenProps {
  startDateTime: string;
  endDateTime: string;
}

export default function DieselGen({ startDateTime, endDateTime }: DieselGenProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [dgData, setDgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(moment().tz('Asia/Kolkata'));
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDG, setSelectedDG] = useState<'DG1' | 'DG2'>('DG1');

  // Calculate responsive sizes
  const responsiveFontSize = windowWidth < 400 ? 12 : 14;
  const chartWidth = windowWidth * 0.85;
  const chartHeight = windowHeight * 0.3;

  const getStatus = useCallback((backendTimestamp: string | null) => {
    if (!backendTimestamp) return 'N/A';
    const parsedTime = moment.tz(backendTimestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
    const diffSeconds = Math.abs(currentTime.diff(parsedTime, 'seconds'));
    return diffSeconds <= 3 ? 'Running' : 'Off';
  }, [currentTime]);

  const getStatusColor = (status: string) => {
    return status === 'Running' ? 'green' : 'red';
  };

  useEffect(() => {
    if (!startDateTime || !endDateTime) return;

    const fetchDgDetails = async () => {
      try {
        const response = await fetch(
          `https://mw.elementsenergies.com/api/dgdc?startDateTime=${startDateTime}&endDateTime=${endDateTime}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setDgData(data);
      } catch (err) {
        console.error('Failed to fetch DG details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDgDetails();
  }, [startDateTime, endDateTime]);

  const dg1 = dgData && dgData[13] ? dgData[13] : { total_kW: null, timestamp: null };
  const dg2 = dgData && dgData[14] ? dgData[14] : { total_kW: null, timestamp: null };

  const details = {
    status: getStatus(selectedDG === 'DG1' ? dg1.timestamp : dg2.timestamp),
    energy: selectedDG === 'DG1' ? 233.2 : 182.5,
    voltage: 240,
    current: 0,
    runtime: 60,
    updated: selectedDG === 'DG1' ? dg1.timestamp : dg2.timestamp,
  };

  const chartData = {
    labels: ['09:00', '13:00', '17:00', '18:00', '19:00'],
    datasets: [
      {
        data: selectedDG === 'DG1' ? [0, 0, 105, 80, 48] : [0, 0, 90, 60, 32],
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
    barPercentage: 0.7, // Increased bar width
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    barRadius: 4,
    style: {
      borderRadius: 8,
    },
    formatYLabel: (value: any) => `${value}`, // Ensure Y-axis labels are visible
  };

  const handleToggleDG = useCallback((dg: 'DG1' | 'DG2') => {
    setSelectedDG(dg);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDetails(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.heading, { fontSize: responsiveFontSize + 2 }]}>Diesel Generators</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.row}>
            {/* DG1 */}
            <View style={styles.genBox}>
              <Image
                source={require('../assets/images-user/diesel.png')}
                style={[styles.image, { width: windowWidth * 0.15, height: windowWidth * 0.15 }]}
                resizeMode="contain"
              />
              <Text style={[styles.name, { fontSize: responsiveFontSize }]}>DG1</Text>
              <Text style={[styles.label, { fontSize: responsiveFontSize - 1 }]}>
                Status:{' '}
                <Text style={[styles.status, { color: getStatusColor(getStatus(dg1.timestamp)) }]}>
                  {getStatus(dg1.timestamp)}
                </Text>
              </Text>
              <Text style={[styles.label, { fontSize: responsiveFontSize - 1 }]}>
                Power Output: <Text style={styles.value}>{dg1.total_kW != null ? `${dg1.total_kW} kW` : 'N/A'}</Text>
              </Text>
              <Text style={[styles.label, { fontSize: responsiveFontSize - 1 }]}>
                Last Updated:{' '}
                <Text style={styles.value}>
                  {dg1.timestamp
                    ? moment
                        .tz(dg1.timestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata')
                        .format('YYYY-MM-DD HH:mm:ss')
                    : 'N/A'}
                </Text>
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSelectedDG('DG1');
                  setShowDetails(true);
                }}
              >
                <Text style={[styles.buttonText, { fontSize: responsiveFontSize - 1 }]}>View Details</Text>
              </TouchableOpacity>
            </View>

            {/* DG2 */}
            <View style={styles.genBox}>
              <Image
                source={require('../assets/images-user/diesel.png')}
                style={[styles.image, { width: windowWidth * 0.15, height: windowWidth * 0.15 }]}
                resizeMode="contain"
              />
              <Text style={[styles.name, { fontSize: responsiveFontSize }]}>DG2</Text>
              <Text style={[styles.label, { fontSize: responsiveFontSize - 1 }]}>
                Status:{' '}
                <Text style={[styles.status, { color: getStatusColor(getStatus(dg2.timestamp)) }]}>
                  {getStatus(dg2.timestamp)}
                </Text>
              </Text>
              <Text style={[styles.label, { fontSize: responsiveFontSize - 1 }]}>
                Power Output: <Text style={styles.value}>{dg2.total_kW != null ? `${dg2.total_kW} kW` : 'N/A'}</Text>
              </Text>
              <Text style={[styles.label, { fontSize: responsiveFontSize - 1 }]}>
                Last Updated:{' '}
                <Text style={styles.value}>
                  {dg2.timestamp
                    ? moment
                        .tz(dg2.timestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata')
                        .format('YYYY-MM-DD HH:mm:ss')
                    : 'N/A'}
                </Text>
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSelectedDG('DG2');
                  setShowDetails(true);
                }}
              >
                <Text style={[styles.buttonText, { fontSize: responsiveFontSize - 1 }]}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Modal */}
      <Modal 
        visible={showDetails} 
        transparent 
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.tooltipBox, { width: windowWidth * 0.9 }]}>
            <View style={styles.tooltipHeader}>
              <Text style={[styles.tooltipTitle, { fontSize: responsiveFontSize + 2 }]}>Energy Generation</Text>
              <View style={styles.toggleContainer}>
                {['DG1', 'DG2'].map((dg) => (
                  <TouchableOpacity
                    key={dg}
                    onPress={() => handleToggleDG(dg as 'DG1' | 'DG2')}
                    style={[
                      styles.toggleButton, 
                      selectedDG === dg ? styles.toggleSelected : styles.toggleUnselected
                    ]}
                  >
                    <Text style={selectedDG === dg ? styles.toggleSelectedText : styles.toggleUnselectedText}>
                      {dg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.chartContainer, { 
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 8,
            }]}>
              <BarChart
                data={chartData}
                width={chartWidth - 40} // Adjusted for padding
                height={chartHeight}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1}
                fromZero
                chartConfig={chartConfig}
                showBarTops={false}
                withCustomBarColorFromData={false}
                flatColor={true}
                style={{
                  marginLeft: -20, // Adjust to show Y-axis labels
                }}
              />
            </View>

            {/* Summary Details */}
            <View style={styles.detailsBox}>
              <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>
                <Text style={styles.detailLabel}>Status:</Text> <Text style={{ color: getStatusColor(details.status) }}>{details.status}</Text>
              </Text>
              <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>
                <Text style={styles.detailLabel}>Energy Generation:</Text> {details.energy} kWh
              </Text>
              <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>
                <Text style={styles.detailLabel}>Voltage:</Text> {details.voltage} V
              </Text>
              <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>
                <Text style={styles.detailLabel}>Current:</Text> {details.current} A
              </Text>
              <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>
                <Text style={styles.detailLabel}>Total Runtime:</Text> {details.runtime} minutes
              </Text>
              <Text style={[styles.detail, { fontSize: responsiveFontSize - 1 }]}>
                <Text style={styles.detailLabel}>Last Updated:</Text> {details.updated ? moment(details.updated).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}
              </Text>
            </View>

            <Pressable onPress={handleCloseModal} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { fontSize: responsiveFontSize }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
  },
  heading: { fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  genBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  image: { marginBottom: 8 },
  name: { fontWeight: 'bold', marginBottom: 4 },
  label: { textAlign: 'center', marginBottom: 2, fontWeight: 'bold' },
  value: { fontWeight: 'normal' },
  button: {
    marginTop: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  status: {},

  // Modal
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
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tooltipTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  toggleSelected: {
    backgroundColor: '#fff',
  },
  toggleUnselected: {
    backgroundColor: 'transparent',
  },
  toggleSelectedText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  toggleUnselectedText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  chartContainer: {
    overflow: 'hidden',
    marginHorizontal: -8, // Extend to edges
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
  detailLabel: {
    fontWeight: 'bold',
    color: '#4B5563',
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