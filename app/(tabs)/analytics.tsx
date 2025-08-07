import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import TopBar from '@/components/topbar';
import ELog from '@/components/elog';
import Zones from '@/components/zones';
import Peakanalysis from '@/components/peakanalysis';
import AnComp from '@/components/an-comp';

const tabs = [
  { label: 'eLog', key: 'eLog' },
  { label: 'Zones', key: 'Zones' },
  { label: 'Peak Analysis', key: 'Peak' },
] as const;

type TabKey = typeof tabs[number]['key'];

type AnalyticsSearchParams = {
  initialTab?: string;
  startDate?: string;
  endDate?: string;
  meterId?: string;
};

export default function Analytics() {
  const params = useLocalSearchParams<AnalyticsSearchParams>();
  const { initialTab, startDate, endDate, meterId } = params;

  const [activeTab, setActiveTab] = useState<TabKey>(
    initialTab === 'Zones' ? 'Zones' : 'eLog'
  );
  const [start, setStart] = useState(startDate || '');
  const [end, setEnd] = useState(endDate || '');
  const [shouldForceZonesTab, setShouldForceZonesTab] = useState(false);

  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const tabLayouts = useRef<{ x: number; width: number }[]>([]).current;

  useEffect(() => {
    if (meterId) {
      setActiveTab('Zones');
      setShouldForceZonesTab(true);
    } else if (initialTab) {
      setActiveTab(initialTab === 'Zones' ? 'Zones' : 'eLog');
      setShouldForceZonesTab(false);
    }

    if (startDate) setStart(startDate);
    if (endDate) setEnd(endDate);
  }, [initialTab, startDate, endDate, meterId]);

  useEffect(() => {
    const tabIndex = tabs.findIndex(tab => tab.key === activeTab);
    if (tabIndex >= 0 && tabLayouts[tabIndex]) {
      const layout = tabLayouts[tabIndex];
      Animated.parallel([
        Animated.spring(underlineX, {
          toValue: layout.x,
          useNativeDriver: false,
        }),
        Animated.spring(underlineWidth, {
          toValue: layout.width,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [activeTab, tabLayouts]);

  const handleTabPress = (index: number) => {
    const newTab = tabs[index].key;
    setActiveTab(newTab);
    setShouldForceZonesTab(false);
  };

  const onTabLayout = (event: LayoutChangeEvent, index: number) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts[index] = { x, width };

    if (tabs[index].key === activeTab) {
      underlineX.setValue(x);
      underlineWidth.setValue(width);
    }
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    setStart(startDate);
    setEnd(endDate);
  };

  const displayTab = shouldForceZonesTab ? 'Zones' : activeTab;

  return (
    <View style={styles.pageContainer}>
      <TopBar />

      <View style={styles.content}>
        <Text style={styles.heading}>Analytics</Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => handleTabPress(index)}
              onLayout={(e) => onTabLayout(e, index)}
            >
              <Text
                style={[
                  styles.tabText,
                  displayTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}

          <Animated.View
            style={[
              styles.underline,
              {
                left: underlineX,
                width: underlineWidth,
              },
            ]}
          />
        </View>

        {/* Date Picker */}
        <AnComp onDateChange={handleDateChange} />

        {/* Tab Content */}
        <View style={{ flex: 1 }}>
          <View style={{ display: displayTab === 'eLog' ? 'flex' : 'none', flex: 1 }}>
            <ELog startDate={start} endDate={end} />
          </View>
          <View style={{ display: displayTab === 'Zones' ? 'flex' : 'none', flex: 1 }}>
            <Zones startDate={start} endDate={end} meterId={meterId} />
          </View>
          <View style={{ display: displayTab === 'Peak' ? 'flex' : 'none', flex: 1 }}>
            <Peakanalysis startDate={start} endDate={end} meterId={meterId} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    paddingTop: 0,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('1%'),
    marginTop: hp('1.5%'),
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
    marginBottom: hp('1%'),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
  },
  tabText: {
    fontSize: wp('3.6%'),
    fontWeight: '500',
    color: '#777',
  },
  activeTabText: {
    color: '#00A86B',
    fontWeight: '600',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#00A86B',
  },
});
