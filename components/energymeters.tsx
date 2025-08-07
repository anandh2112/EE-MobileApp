import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import axios from 'axios';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 70) * 0.48;

type ZoneDetail = {
  name: string;
  category?: string;
};

type ZoneDetails = {
  [key in 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12]: ZoneDetail;
} & {
  12: Omit<ZoneDetail, 'category'>;
};

type MeterData = {
  id: number;
  consumption: number;
};

const zoneDetails: ZoneDetails = {
  1: { name: 'PLATING', category: 'C-49' },
  2: { name: 'DIE CASTING+CB+CNC', category: 'C-50' },
  3: { name: 'SCOTCH BUFFING', category: 'C-50' },
  4: { name: 'BUFFING', category: 'C-49' },
  5: { name: 'SPRAY+EPL-I', category: 'C-50' },
  6: { name: 'SPRAY+ EPL-II', category: 'C-49' },
  7: { name: 'RUMBLE', category: 'C-50' },
  8: { name: 'AIR COMPRESSOR', category: 'C-49' },
  9: { name: 'TERRACE', category: 'C-49' },
  10: { name: 'TOOL ROOM', category: 'C-50' },
  11: { name: 'ADMIN BLOCK', category: 'C-50' },
  12: { name: 'TRANSFORMER' },
};

const getZoneInfo = (id: number) => {
  if (id === 0) return { name: 'TOTAL CONSUMPTION', category: null };
  const zoneId = id as keyof ZoneDetails;
  if (zoneDetails[zoneId]) {
    return zoneDetails[zoneId];
  }
  return { name: 'Unknown Zone', category: 'N/A' };
};

const EnergyMeterCard = ({
  id,
  consumption,
  startDateTime,
  endDateTime,
}: {
  id: number;
  consumption: number;
  startDateTime: string;
  endDateTime: string;
}) => {
  const router = useRouter();
  const zoneInfo = getZoneInfo(id);

  return (
    <View style={styles.subCard}>
      {zoneInfo.category ? (
        <View style={styles.zoneBadge}>
          <Text style={styles.zoneText}>{zoneInfo.name}</Text>
          <Text style={styles.blockText}>Block: {zoneInfo.category}</Text>
        </View>
      ) : (
        <View style={[styles.extraBadge, { backgroundColor: '#FF7F1A' }]}>
          <Text style={styles.extraBadgeText}>{zoneInfo.name}</Text>
        </View>
      )}
      <Text style={styles.kwhText}>{consumption.toFixed(1)} kVAh</Text>
      <Text style={styles.label}>Consumption</Text>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/analytics',
            params: {
              initialTab: 'Zones',
              startDate: startDateTime,
              endDate: endDateTime,
              ...(id !== 0 && { meterId: id.toString() }), // Only include meterId if not total consumption
            },
          });
        }}
      >
        <Text style={styles.detailsLink}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

interface EnergyMetersProps {
  startDateTime: string;
  endDateTime: string;
}

export default function EnergyMeters({ startDateTime, endDateTime }: EnergyMetersProps) {
  const [energyMeters, setEnergyMeters] = useState<MeterData[]>([]);
  const [totalConsumption, setTotalConsumption] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!startDateTime || !endDateTime) return;

    const fetchData = async () => {
      try {
        const response = await axios.get('https://mw.elementsenergies.com/api/econsumption', {
          params: { startDateTime, endDateTime },
        });

        const apiData = response.data.consumptionData.map(
          (entry: { energy_meter_id: number; consumption: string }) => ({
            id: entry.energy_meter_id,
            consumption: parseFloat(entry.consumption),
          })
        );

        const defaultMeters: MeterData[] = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          consumption: 0,
        }));

        const mergedData = defaultMeters.map((defaultMeter) => {
          const matched = apiData.find((item: { id: number }) => item.id === defaultMeter.id);
          return matched ? matched : defaultMeter;
        });

        setEnergyMeters(mergedData);

        try {
          const totalRes = await axios.get('https://mw.elementsenergies.com/api/mcapcons', {
            params: { startDateTime, endDateTime },
          });
          setTotalConsumption(totalRes.data?.consumption ?? 0);
        } catch (err) {
          console.warn('Failed to fetch total consumption. Defaulting to 0.');
          setTotalConsumption(0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [startDateTime, endDateTime]);

  const allMeters = [
    ...energyMeters.filter((meter) => meter.id !== 12),
    { id: 0, consumption: totalConsumption },
    ...energyMeters.filter((meter) => meter.id === 12),
  ];

  const zonePages = [];
  for (let i = 0; i < allMeters.length; i += 8) {
    zonePages.push(allMeters.slice(i, i + 8));
  }

  const handleDotPress = (index: number) => {
    if (scrollRef.current) {
      // @ts-ignore
      scrollRef.current.scrollTo({ x: index * (width - 50), animated: true });
      setCurrentPage(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Energy Meters</Text>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const page = Math.round(event.nativeEvent.contentOffset.x / (width - 50));
                setCurrentPage(page);
              },
            }
          )}
          scrollEventThrottle={16}
        >
          {zonePages.map((page, pageIndex) => (
            <View key={pageIndex} style={styles.page}>
              {page.map((meter, index) => (
                <EnergyMeterCard
                  key={index}
                  id={meter.id}
                  consumption={meter.consumption}
                  startDateTime={startDateTime}
                  endDateTime={endDateTime}
                />
              ))}
            </View>
          ))}
        </Animated.ScrollView>
        <View style={styles.paginationContainer}>
          {zonePages.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleDotPress(idx)}
              activeOpacity={0.6}
            >
              <View
                style={[
                  styles.paginationDot,
                  currentPage === idx && styles.paginationDotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
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
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginBottom: 8,
  },
  page: {
    width: width - 50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: CARD_WIDTH,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  zoneBadge: {
    backgroundColor: '#27C26C',
    width: '100%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 4,
  },
  zoneText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('2.5%'),
    textAlign: 'center',
  },
  blockText: {
    color: '#fff',
    fontSize: wp('2.2%'),
  },
  extraBadge: {
    width: '100%',
    height: 35,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('2.5%'),
    textAlign: 'center',
  },
  kwhText: {
    paddingTop: 6,
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#222',
  },
  label: {
    fontSize: wp('3%'),
    color: '#888',
    marginTop: 2,
  },
  detailsLink: {
    fontSize: wp('3%'),
    color: '#007BFF',
    marginTop: 6,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DDD',
    marginHorizontal: 6,
  },
  paginationDotActive: {
    backgroundColor: '#007BFF',
  },
});