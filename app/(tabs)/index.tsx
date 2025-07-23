import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import LandingHeader from '../../components/landing-top';
import LandingMetrics from '../../components/landing-bottom';
import Datepicker from '@/components/datepicker';
import HourlyEnergy from '../../components/hourlyenergy';
import EnergyMeters from '../../components/energymeters';
import PeakDemand from '../../components/peakdemand';
import HeatMap from '../../components/heatmap';
import DieselGen from '@/components/dieselgenerator';
import Solar from '@/components/solar';
import BatteryStorage from '@/components/battery';
import EVChargers from '@/components/ev';
import TopBar from '@/components/topbar';

const { height: screenHeight } = Dimensions.get('window');
const containerHeight = screenHeight * 0.78;

export default function Index() {
  const [facilityExpanded, setFacilityExpanded] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' });

  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // prevent overlapping animation calls
    if (!isAnimating.current) {
      if (scrollY > 100 && !isVisible) {
        isAnimating.current = true;
        setIsVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => (isAnimating.current = false));
      } else if (scrollY <= 100 && isVisible) {
        isAnimating.current = true;
        setIsVisible(false);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => (isAnimating.current = false));
      }
    }
  };

  const scrollToTop = () => {
    // fallback smooth scroll for Android < 9
    if (Platform.OS === 'android') {
      let scrollY = 0;
      const interval = setInterval(() => {
        scrollRef.current?.scrollTo({ y: scrollY, animated: true });
        scrollY -= 50;
        if (scrollY <= 0) {
          clearInterval(interval);
        }
      }, 10);
    } else {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16} // optimal value for smooth UX
      >
        <View style={styles.container}>
          <TopBar />

          <View style={[styles.landingRoot, { height: containerHeight }]}>
            <View style={styles.datepickerContainer}>
              <Datepicker
                onDateChange={(start, end) =>
                  setSelectedDates({ start, end })
                }
              />
            </View>

            <View style={styles.headerContainer}>
              <LandingHeader
                facilityExpanded={facilityExpanded}
                setFacilityExpanded={setFacilityExpanded}
              />
            </View>

            <View style={styles.metricsContainer}>
              <LandingMetrics
                startDateTime={selectedDates.start}
                endDateTime={selectedDates.end}
              />
            </View>
          </View>

          <HourlyEnergy
            startDateTime={selectedDates.start}
            endDateTime={selectedDates.end}
          />

          <EnergyMeters
            startDateTime={selectedDates.start}
            endDateTime={selectedDates.end}
          />

          <PeakDemand />
          <HeatMap />

          <DieselGen
            startDateTime={selectedDates.start}
            endDateTime={selectedDates.end}
          />

          <Solar />
          <BatteryStorage />
          <EVChargers />
        </View>
      </ScrollView>

      <Animated.View style={[styles.scrollTopButton, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={scrollToTop} style={styles.innerButton}>
          <AntDesign name="up" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  landingRoot: {
    width: '100%',
    backgroundColor: 'white',
  },
  headerContainer: {
    flex: 3.8,
  },
  metricsContainer: {
    flex: 3,
  },
  datepickerContainer: {
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 20,
  },
  innerButton: {
    backgroundColor: '#0d9488',
    borderRadius: 30,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});
