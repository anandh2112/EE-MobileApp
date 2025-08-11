import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import moment from 'moment-timezone';
import DGDetailsModal from './dgdetailsmodal';

interface DieselGenProps {
  startDateTime: string;
  endDateTime: string;
}

export default function DieselGen({ startDateTime, endDateTime }: DieselGenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [dgData, setDgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(moment().tz('Asia/Kolkata'));
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDG, setSelectedDG] = useState<'DG1' | 'DG2'>('DG1');
  const [modalData, setModalData] = useState<any>(null);

  const responsiveFontSize = windowWidth < 400 ? 12 : 14;

  const getStatus = useCallback(
    (backendTimestamp: string | null) => {
      if (!backendTimestamp) return 'N/A';
      const parsedTime = moment.tz(backendTimestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
      const diffSeconds = Math.abs(currentTime.diff(parsedTime, 'seconds'));
      return diffSeconds <= 3 ? 'Running' : 'Off';
    },
    [currentTime]
  );

  const getStatusColor = (status: string) => {
    return status === 'Running' ? 'green' : 'red';
  };

  useEffect(() => {
    if (!startDateTime || !endDateTime) return;

    const fetchDgDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://mw.elementsenergies.com/api/dgdc?startDateTime=${startDateTime}&endDateTime=${endDateTime}`
        );
        const data = await response.json();
        setDgData(data);
        
        // Fetch modal data upfront
        const [dg1Response, dg2Response] = await Promise.all([
          fetch(`https://mw.elementsenergies.com/api/dgd?startDateTime=${startDateTime}&endDateTime=${endDateTime}&DGNo=13`),
          fetch(`https://mw.elementsenergies.com/api/dgd?startDateTime=${startDateTime}&endDateTime=${endDateTime}&DGNo=14`)
        ]);
        
        const [dg1Data, dg2Data] = await Promise.all([dg1Response.json(), dg2Response.json()]);
        
        setModalData({
          DG1: dg1Data,
          DG2: dg2Data
        });
      } catch (err) {
        console.error('Failed to fetch DG details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDgDetails();
  }, [startDateTime, endDateTime]);

  const dg1 = dgData?.[13] ?? { total_kW: null, timestamp: null };
  const dg2 = dgData?.[14] ?? { total_kW: null, timestamp: null };

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
                Power Output:{' '}
                <Text style={styles.value}>
                  {dg1.total_kW != null ? `${dg1.total_kW} kW` : 'N/A'}
                </Text>
              </Text>
              <Text style={[styles.label, { fontSize: responsiveFontSize - 1 }]}>
                Last Updated:{' '}
                <Text style={styles.value}>
                  {dg1.timestamp
                    ? moment.tz(dg1.timestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
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
                Power Output:{' '}
                <Text style={styles.value}>
                  {dg2.total_kW != null ? `${dg2.total_kW} kW` : 'N/A'}
                </Text>
              </Text>
              <Text style={[styles.label, { fontSize: responsiveFontSize - 1 }]}>
                Last Updated:{' '}
                <Text style={styles.value}>
                  {dg2.timestamp
                    ? moment.tz(dg2.timestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
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

      {/* Modal Component */}
      <DGDetailsModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        dgNo={selectedDG === 'DG1' ? 13 : 14}
        modalData={modalData}
        onDGToggle={(newDG) => setSelectedDG(newDG === 13 ? 'DG1' : 'DG2')}
      />
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
});