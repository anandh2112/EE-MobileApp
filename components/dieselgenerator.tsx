import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import moment from 'moment-timezone';

interface DieselGenProps {
  startDateTime: string;
  endDateTime: string;
}

export default function DieselGen({ startDateTime, endDateTime }: DieselGenProps) {
  const [dgData, setDgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(moment().tz('Asia/Kolkata'));

  // Helper to compute status
  const getStatus = (backendTimestamp: string | null) => {
    if (!backendTimestamp) return 'N/A';
    const parsedTime = moment.tz(backendTimestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
    const diffSeconds = Math.abs(currentTime.diff(parsedTime, 'seconds'));
    return diffSeconds <= 3 ? 'Running' : 'Off';
  };

  // Helper to get color
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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Diesel Generators</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.row}>
            {/* DG1 */}
            <View style={styles.genBox}>
              <Image
                source={require('../assets/images-user/diesel.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.name}>DG1</Text>
              <Text style={styles.label}>
                Status:{' '}
                <Text style={[styles.status, { color: getStatusColor(getStatus(dg1.timestamp)) }]}>
                  {getStatus(dg1.timestamp)}
                </Text>
              </Text>
              <Text style={styles.label}>
                Power Output:{' '}
                <Text style={styles.value}>
                  {dg1.total_kW != null ? `${dg1.total_kW} kW` : 'N/A'}
                </Text>
              </Text>
              <Text style={styles.label}>
                Last Updated:{' '}
                <Text style={styles.value}>
                  {dg1.timestamp
                    ? moment
                        .tz(dg1.timestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata')
                        .format('YYYY-MM-DD HH:mm:ss')
                    : 'N/A'}
                </Text>
              </Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>

            {/* DG2 */}
            <View style={styles.genBox}>
              <Image
                source={require('../assets/images-user/diesel.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.name}>DG2</Text>
              <Text style={styles.label}>
                Status:{' '}
                <Text style={[styles.status, { color: getStatusColor(getStatus(dg2.timestamp)) }]}>
                  {getStatus(dg2.timestamp)}
                </Text>
              </Text>
              <Text style={styles.label}>
                Power Output:{' '}
                <Text style={styles.value}>
                  {dg2.total_kW != null ? `${dg2.total_kW} kW` : 'N/A'}
                </Text>
              </Text>
              <Text style={styles.label}>
                Last Updated:{' '}
                <Text style={styles.value}>
                  {dg2.timestamp
                    ? moment
                        .tz(dg2.timestamp, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata')
                        .format('YYYY-MM-DD HH:mm:ss')
                    : 'N/A'}
                </Text>
              </Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

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
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  status: {},
  value: {
    fontWeight: 'normal',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
