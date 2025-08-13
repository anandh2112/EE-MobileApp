import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import TopBar from '@/components/topbar';
import Insights1 from '@/components/insights-1';

const tabs = ['My Building', 'Market Trends', 'Eco Tips'];

export default function InsightsTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const bubbleX = useRef(new Animated.Value(0)).current;
  const bubbleWidth = useRef(new Animated.Value(0)).current;

  const tabLayouts = useRef<{ x: number; width: number }[]>([]).current;

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    const layout = tabLayouts[index];

    if (layout) {
      Animated.parallel([
        Animated.spring(bubbleX, {
          toValue: layout.x,
          useNativeDriver: false,
        }),
        Animated.spring(bubbleWidth, {
          toValue: layout.width,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const onTabLayout = (event: LayoutChangeEvent, index: number) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts[index] = { x, width };

    if (index === activeTab) {
      bubbleX.setValue(x);
      bubbleWidth.setValue(width);
    }
  };

  return (
    <View style={styles.screen}>
      <TopBar />

      <View style={styles.container}>
        <Text style={styles.heading}>Insights</Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {/* Animated Bubble */}
          <Animated.View
            style={[
              styles.bubble,
              {
                left: bubbleX,
                width: bubbleWidth,
              },
            ]}
          />

          {tabs.map((tab, index) => (
            <Pressable
              key={index}
              style={styles.tab}
              onPress={() => handleTabPress(index)}
              onLayout={(e) => onTabLayout(e, index)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === index && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab content */}
        <View style={{ flex: 1, paddingTop: hp('1.5%') }}>
          {activeTab === 0 && <Insights1 />}
          {activeTab === 1 && (
            <Text style={styles.placeholder}>Market Trends coming soon...</Text>
          )}
          {activeTab === 2 && (
            <Text style={styles.placeholder}>Eco Tips coming soon...</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: wp('4%'),
    paddingTop: 0,
    flex: 1,
    backgroundColor: '#fff',
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
    position: 'relative',
    backgroundColor: '#F5F5F5',
    borderRadius: wp('4%'),
    padding: wp('0.5%'), // reduced padding for sleekness
    height: hp('4.5%'), // reduced height for even sleeker look
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp('4%'),
  },
  tabText: {
    fontSize: wp('3.4%'),
    fontWeight: '500',
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  bubble: {
    position: 'absolute',
    top: hp('0.25%'), // reduced vertical margin for thinner bubble
    bottom: hp('0.25%'),
    backgroundColor: '#00A86B',
    borderRadius: wp('4%'),
  },
  placeholder: {
    paddingTop: hp('3%'),
    textAlign: 'center',
    color: '#888',
    fontSize: wp('3.5%'),
  },
});
