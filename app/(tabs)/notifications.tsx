import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import TopBar from '@/components/topbar';
import DateTimePicker from '@/components/datepicker';
import { useDateTime } from '@/components/datetimecontext';
import axios from 'axios';

interface AlertItem {
  id: string;
  type: string;
  date: string;
  time: string;
  alert?: string;
  limit: string;
  value: string;
  minute?: string;
}

export default function Notification() {
  const { startDate, endDate, format } = useDateTime();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedRange, setLastFetchedRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const formattedStart = format(startDate);
    const formattedEnd = format(endDate);

    // Prevent re-fetching if the date range is the same
    if (
      lastFetchedRange &&
      lastFetchedRange.start === formattedStart &&
      lastFetchedRange.end === formattedEnd
    ) {
      return;
    }

    const fetchAlertData = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get('https://mw.elementsenergies.com/api/apd', {
          params: { 
            startDateTime: formattedStart, 
            endDateTime: formattedEnd 
          },
        });

        const peakAlerts = response.data.peakDemandAboveThreshold.map(
          (item: { minute: string; total_kVA: any; }, index: number) => ({
            id: `peak-${index}`,
            type: 'Peak Demand',
            date: item.minute.split(' ')[0],
            time: item.minute.split(' ')[1].substring(0, 5),
            limit: '596 kVA',
            value: `${item.total_kVA} kVA`,
            minute: item.minute,
          })
        );

        const dgAlerts: AlertItem[] = [];
        response.data.dgActivations.forEach(
          (event: { status: string; timestamp: string; meter: number; kWh: number; startKWh?: number; }, index: number) => {
            const { status, timestamp, meter, kWh, startKWh } = event;
            const dgNumber = meter === 13 ? 1 : 2;
            const baseData = {
              id: `dg-${index}`,
              type: 'Diesel Generator',
              date: timestamp.split('T')[0],
              time: new Date(timestamp).toISOString().split('T')[1].substring(0, 5),
              limit: 'N/A',
            };
            if (status === "DG started") {
              dgAlerts.push({
                ...baseData,
                value: `${kWh.toFixed(2)} kWh`,
                alert: `DG${dgNumber} Started`
              });
            }
            if (status === "DG stopped" && startKWh !== undefined) {
              const unitsRun = (kWh - startKWh).toFixed(2);
              dgAlerts.push({
                ...baseData,
                value: `${kWh.toFixed(2)} kWh (Units: ${unitsRun})`,
                alert: `DG${dgNumber} Ended`
              });
            }
          }
        );

        const combinedData = [...peakAlerts, ...dgAlerts]
          .sort((a, b) => {
            const aKey = `${a.date} ${a.time}`;
            const bKey = `${b.date} ${b.time}`;
            return aKey.localeCompare(bKey);
          })
          .map((item, index) => ({
            ...item,
            id: `${index}-${item.id}`
          }));

        setAlerts(combinedData);
        setLastFetchedRange({ start: formattedStart, end: formattedEnd });
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlertData();
  }, [startDate, endDate, format, lastFetchedRange]);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  };

  const renderItem = ({ item }: { item: AlertItem }) => (
    <TouchableOpacity style={styles.notificationCard} activeOpacity={0.7}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.alert || item.type}</Text>
        <Text style={styles.notificationMessage}>Limit: {item.limit}</Text>
        <Text style={styles.notificationMessage}>Value: {item.value}</Text>
      </View>
      <View style={styles.notificationTimeContainer}>
        <Text style={styles.notificationTimeDate}>
          {item.minute
            ? formatDisplayDate(item.minute.split(' ')[0])
            : formatDisplayDate(item.date)}
        </Text>
        <Text style={styles.notificationTimeHour}>
          {item.minute
            ? item.minute.split(' ')[1].substring(0, 5)
            : item.time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <Text style={styles.heading}>Alerts</Text>
      <DateTimePicker />
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No alerts found for selected period</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  heading: { fontSize: 22, fontWeight: 'bold', marginTop: 24, marginBottom: 12, marginLeft: 18 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  notificationCard: {
    backgroundColor: '#F6F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 2,
  },
  notificationContent: { flex: 1, paddingRight: 12 },
  notificationTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#222B45' },
  notificationMessage: { fontSize: 14, color: '#6B7B8C' },
  notificationTimeContainer: { alignItems: 'flex-end' },
  notificationTimeDate: { fontSize: 12, color: '#A0A4A8' },
  notificationTimeHour: { fontSize: 12, color: '#A0A4A8' },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#A0A4A8' },
});
