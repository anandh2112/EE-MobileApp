import React from 'react';
import { Tabs } from 'expo-router';
import { Image, Pressable } from 'react-native';
import type { PressableProps } from 'react-native';

// Custom tab bar button without ripple effect
function NoRippleTabBarButton(props: PressableProps) {
  return (
    <Pressable {...props} android_ripple={null} style={props.style}>
      {props.children}
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      detachInactiveScreens={true}
      screenOptions={{
        lazy: true,
        tabBarShowLabel: true,
        headerShown: false,
        tabBarActiveTintColor: 'green',
        tabBarLabelStyle: { fontSize: 10, marginTop: 4 },
        tabBarStyle: {
          height: 80,
          paddingTop: 12,
          paddingBottom: 8,
          borderTopWidth: 0.5,
          borderTopColor: '#eee',
          backgroundColor: '#fff',
          elevation: 6,
        },
        tabBarItemStyle: {
          backgroundColor: 'transparent',
        },
        tabBarButton: (props) => <NoRippleTabBarButton {...props} />,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images-user/home-2.png')
                  : require('@/assets/images-user/home-1.png')
              }
              style={styles.icon}
              resizeMode='contain'
            />
          ),
        }}
      />
      <Tabs.Screen
        name='analytics'
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images-user/analytics-2.png')
                  : require('@/assets/images-user/analytics-1.png')
              }
              style={styles.icon}
              resizeMode='contain'
            />
          ),
        }}
      />
      <Tabs.Screen
        name='insights'
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images-user/insight-2.png')
                  : require('@/assets/images-user/insight-1.png')
              }
              style={styles.icon}
              resizeMode='contain'
            />
          ),
        }}
      />
      <Tabs.Screen
        name='notifications'
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images-user/notifications-2.png')
                  : require('@/assets/images-user/notifications-1.png')
              }
              style={styles.icon}
              resizeMode='contain'
            />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images-user/profile-2.png')
                  : require('@/assets/images-user/profile-1.png')
              }
              style={styles.icon}
              resizeMode='contain'
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = {
  icon: {
    width: 34,
    height: 34,
    marginTop: 8,
    marginBottom: 10,
  },
};
