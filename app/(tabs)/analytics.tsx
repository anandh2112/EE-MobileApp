import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
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

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<TabKey>('eLog');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  const tabLayouts = useRef<{ x: number; width: number }[]>([]).current;

  const handleTabPress = (index: number) => {
    setActiveTab(tabs[index].key);
    const layout = tabLayouts[index];

    if (layout) {
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
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
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
                  activeTab === tab.key && styles.activeTabText,
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

        {/* Tab content */}
        <View style={{ flex: 1 }}>
          <View style={{ display: activeTab === 'eLog' ? 'flex' : 'none', flex: 1 }}>
            <ELog startDate={start} endDate={end} />
          </View>
          <View style={{ display: activeTab === 'Zones' ? 'flex' : 'none', flex: 1 }}>
            <Zones startDate={start} endDate={end} />
          </View>
          <View style={{ display: activeTab === 'Peak' ? 'flex' : 'none', flex: 1 }}>
            <Peakanalysis />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    marginTop: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 14,
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
