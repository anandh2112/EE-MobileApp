import React from 'react';
import { View, Image, Pressable, StyleSheet, Text } from 'react-native';

const tabs = [
  { title: 'Home', icon1: require('@/assets/images-user/home-1.png'), icon2: require('@/assets/images-user/home-2.png') },
  { title: 'Analytics', icon1: require('@/assets/images-user/analytics-1.png'), icon2: require('@/assets/images-user/analytics-2.png') },
  { title: 'Insights', icon1: require('@/assets/images-user/insight-1.png'), icon2: require('@/assets/images-user/insight-2.png') },
  { title: 'Notifications', icon1: require('@/assets/images-user/notifications-1.png'), icon2: require('@/assets/images-user/notifications-2.png') },
  { title: 'Profile', icon1: require('@/assets/images-user/profile-1.png'), icon2: require('@/assets/images-user/profile-2.png') },
];

export default function CustomTabBar({ index, setIndex }: { index: number; setIndex: (i: number) => void }) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab, i) => (
        <Pressable key={tab.title} onPress={() => setIndex(i)} style={styles.tab}>
          <Image
            source={index === i ? tab.icon2 : tab.icon1}
            style={{ width: 30, height: 30, marginBottom: 4 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 10, color: index === i ? 'green' : '#777' }}>{tab.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    elevation: 6,
  },
  tab: {
    alignItems: 'center',
  },
});
