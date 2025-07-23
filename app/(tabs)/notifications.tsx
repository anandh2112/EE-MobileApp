import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import TopBar from '@/components/topbar';

const notifications = [
  {
    id: '1',
    title: 'Welcome!',
    message: 'Thank you for joining our app. Explore all the new features.',
    time: 'Just now'
  },
  {
    id: '2',
    title: 'Update Available',
    message: 'A new version of the app is available. Please update to enjoy the latest features.',
    time: '10m ago'
  },
  {
    id: '3',
    title: 'Reminder',
    message: 'Don\'t forget to check out today\'s special offers!',
    time: '1h ago'
  },
  // Add more sample notifications as needed
];

export default function Notification() {
  const renderItem = ({ item }: { item: typeof notifications[0] }) => (
    <TouchableOpacity style={styles.notificationCard} activeOpacity={0.7}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <Text style={styles.heading}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 18,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
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
  notificationContent: {
    flex: 1,
    paddingRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222B45',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7B8C',
  },
  notificationTime: {
    fontSize: 12,
    color: '#A0A4A8',
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0A4A8',
  },
});