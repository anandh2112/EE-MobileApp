import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LandingHeader from './landing-top';
import LandingMetrics from './landing-bottom';
import AnComp from '@/components/datepicker';

const { height: screenHeight } = Dimensions.get('window');
const containerHeight = screenHeight * 0.78;

export default function Landing() {
  const [facilityExpanded, setFacilityExpanded] = useState(false);

  return (
    <View style={[styles.root, { height: containerHeight }]}>
      <View style={styles.headerContainer}>
        <LandingHeader facilityExpanded={facilityExpanded} setFacilityExpanded={setFacilityExpanded} />
      </View>
      <AnComp />
      <View style={styles.metricsContainer}>
        <LandingMetrics />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    backgroundColor: 'white',
  },
  headerContainer: {
    flex: 4,
  },
  metricsContainer: {
    flex: 3,
  },
});
