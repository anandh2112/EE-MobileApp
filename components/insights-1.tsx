import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from '@expo/vector-icons';

const insights = [
  {
    icon: <Ionicons name="flash" size={18} color="#fff" />,
    color: '#FF6B6B',
    title: 'Energy Usage Spike',
    message: '⚠️ Spike detected in East wing. Check HVAC leakage?',
    details:
      'Energy consumption has exceeded the expected limit in the East wing. Investigate HVAC systems and lighting for potential leakage or faults.',
  },
  {
    icon: <MaterialIcons name="wb-sunny" size={18} color="#fff" />,
    color: '#FEC84D',
    title: "India's Hottest May",
    message: '🌍 India just faced a record-shattering heatwave this May.',
    details:
      'This May was the hottest on record across many regions in India. Consider adjusting energy schedules and water usage accordingly.',
  },
  {
    icon: <FontAwesome5 name="tint" size={16} color="#fff" />,
    color: '#38BDF8',
    title: '30% Water Lost',
    message:
      "💧 Bengaluru is losing around one third of it's water in transit.",
    details:
      'Water audit reports indicate significant pipeline leakage and unaccounted losses. Infrastructure updates are recommended.',
  },
  {
    icon: <Entypo name="leaf" size={18} color="#fff" />,
    color: '#4ADE80',
    title: 'Morning Eco Tip',
    message:
      '🌿 Indoor plants can reduce temperature and improve air quality.',
    details:
      'Try placing snake plants or pothos near windows. They help reduce CO₂ levels and improve indoor environment naturally.',
  },
];

export default function Insights1() {
  const [selectedInsight, setSelectedInsight] = useState<null | typeof insights[0]>(null);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {insights.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: item.color }]}>
              {item.icon}
            </View>
            <View style={styles.textContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <TouchableOpacity onPress={() => setSelectedInsight(item)}>
                <Text style={styles.readMore}>Read more</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal Dialog */}
      <Modal
        visible={selectedInsight !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedInsight(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedInsight(null)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{selectedInsight?.title}</Text>
            <Text style={styles.modalDetails}>{selectedInsight?.details}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedInsight(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 1,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#111',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
  },
  readMore: {
    fontSize: 12,
    color: '#00A86B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  modalDetails: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#00A86B',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
