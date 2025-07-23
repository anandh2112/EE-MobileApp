import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type LandingHeaderProps = {
  // You may keep these props for future use, but they're not needed for toggling anymore
  facilityExpanded: boolean;
  setFacilityExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LandingHeader({ facilityExpanded, setFacilityExpanded }: LandingHeaderProps) {
  return (
    <View>
      {/* Background Image with Facility Info Card */}
      <View style={styles.bgImageWrapper}>
        <ImageBackground
          source={require('../assets/images-user/bg-image1.png')}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          <View style={styles.topOverlayRow}>
            {/* Facility Info (Always Expanded) */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.facilityButton, styles.facilityButtonExpanded]}>
                <View style={styles.facilityExpandedContent}>
                  <Image 
                    source={require('../assets/images-user/pin.png')}
                    style={{ width: 18, height: 18, marginRight: 6, marginTop: 2 }}
                  />
                  <View>
                    <Text style={styles.facilityTitle}>Metalware Corporation</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bgImageWrapper: {
    position: 'relative',
    width: '100%',
  },
  imageBackground: {
    height: hp('38%'),
    width: '100%',
  },
  imageStyle: {
    height: '83%',
    width: '100%',
    marginTop: hp('7%'),
  },
  topOverlayRow: {
    position: 'absolute',
    top: hp('1%'),
    left: wp('4%'),
    right: wp('4%'),
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  facilityButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 1,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 10,
    minWidth: 10,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  facilityButtonExpanded: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: wp('10%'),
    minHeight: 10,
    alignItems: 'flex-start',
  },
  facilityExpandedContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  facilityTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '400',
    color: '#222',
    marginBottom: 2,
  },
  facilitySubText: {
    fontSize: wp('3.3%'),
    color: '#888',
    fontWeight: '400',
    marginBottom: 1,
  },
});