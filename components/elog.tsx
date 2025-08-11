import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment-timezone';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

type ZoneData = {
  zone: number;
  min: {
    kVAh: number;
    kWh: number;
    timestamp: string;
  };
  max: {
    kVAh: number;
    kWh: number;
    timestamp: string;
  };
};

type ELogProps = {
  startDate: string;
  endDate: string;
};

type ZoneInfo = {
  name: string;
  category: string;
};

type MeterToZoneMap = {
  [key: number]: ZoneInfo;
};

const meterToZoneMap: MeterToZoneMap = {
  1: { name: "PLATING", category: "C-49" },
  2: { name: "DIE CASTING + CHINA BUFFING + CNC", category: "C-50" },
  3: { name: "SCOTCH BUFFING", category: "C-50" },
  4: { name: "BUFFING", category: "C-49" },
  5: { name: "SPRAY+EPL-I", category: "C-50" },
  6: { name: "SPRAY+ EPL-II", category: "C-49" },
  7: { name: "RUMBLE", category: "C-50" },
  8: { name: "AIR COMPRESSOR", category: "C-49" },
  9: { name: "TERRACE", category: "C-49" },
  10: { name: "TOOL ROOM", category: "C-50" },
  11: { name: "ADMIN BLOCK", category: "C-50" },
  12: { name: "TRANSFORMER", category: "" },
  13: { name: "DIESEL GENERATOR - 1", category: "" },
  14: { name: "DIESEL GENERATOR - 2", category: "" },
};

export default function ELog({ startDate, endDate }: ELogProps) {
  const [selectedUnit, setSelectedUnit] = useState<'kVAh' | 'kWh'>('kVAh');
  const animation = useRef(new Animated.Value(0)).current;
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [zoneToggle] = useState<'all' | 'single'>('all'); // fixed to 'all' as disabled
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Use the props instead of hardcoded dates
      const effectiveStartDate = startDate || moment().subtract(1, 'days').format('YYYY-MM-DD 00:00');
      const effectiveEndDate = endDate || moment().format('YYYY-MM-DD 00:00');

      try {
        const response = await axios.get('https://mw.elementsenergies.com/api/meterreading', {
          params: { 
            startDateTime: effectiveStartDate, 
            endDateTime: effectiveEndDate 
          },
        });
        setZones(response.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Only fetch if dates are available
    fetchData();
  }, [startDate, endDate]);

  const downloadExcel = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      if (!zones.length) {
        Alert.alert("No Data", "There is no data available to export.");
        return;
      }

      // Prepare data for Excel
      const headerRow = [`Start: ${startDate}`, `End: ${endDate}`, "", "", ""];
      const columnHeaders = ["Zone", "Timestamp", "kVAh", "kWh"];
      const rows: any[][] = [];

      zones.forEach((zone) => {
        const zoneMeta = meterToZoneMap[zone.zone] || { name: `Zone ${zone.zone}`, category: "" };
        const zoneName = zoneMeta.name;
        const category = zoneMeta.category;
        const zoneDisplay = category ? `${zoneName} (${category})` : zoneName;

        rows.push([
          zoneDisplay,
          `Start: ${zone.min?.timestamp || "N/A"}`,
          zone.min?.kVAh ?? "N/A",
          zone.min?.kWh ?? "N/A",
        ]);
        rows.push([
          "",
          `End: ${zone.max?.timestamp || "N/A"}`,
          zone.max?.kVAh ?? "N/A",
          zone.max?.kWh ?? "N/A",
        ]);
      });

      const dataForExcel = [headerRow, columnHeaders, ...rows];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Meter Readings");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
      const fileName = `Meter_Readings_${moment(startDate).format("YYYYMMDD_HHmm")}_to_${moment(endDate).format("YYYYMMDD_HHmm")}.xlsx`;
      
      if (Platform.OS === 'android') {
        // For Android - save directly to Downloads folder
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (!permissions.granted) {
          Alert.alert("Permission Denied", "Storage permission is required to save the file.");
          return;
        }

        const directoryUri = permissions.directoryUri;
        
        await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, excelBuffer, {
              encoding: FileSystem.EncodingType.Base64,
            });
            Alert.alert("Success", "File saved to Downloads folder");
          })
          .catch(error => {
            console.error("Error saving file:", error);
            Alert.alert("Error", "Failed to save file");
          });
      } else {
        // For iOS - use document directory
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        Alert.alert("Success", "File saved to app's document directory");
      }
    } catch (error) {
      console.error("Error generating Excel file:", error);
      Alert.alert("Error", "Failed to generate Excel file");
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleButtonWidth = wp('15%');
  const toggleButtonHeight = hp('2.2%');
  const toggleCircleWidth = wp('7%');
  const toggleCircleHeight = hp('2.2%');
  const toggleCircleRadius = wp('3.5%');

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, toggleButtonWidth - toggleCircleWidth],
  });

  const toggleSwitch = () => {
    const newUnit = selectedUnit === 'kVAh' ? 'kWh' : 'kVAh';
    setSelectedUnit(newUnit);
    Animated.timing(animation, {
      toValue: newUnit === 'kVAh' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Toggle and Zone Toggle */}
      <View style={styles.bottomRow}>
        <View style={styles.toggleWrapper}>
          <Text style={styles.toggleLabel}>kVAh</Text>
          <Pressable
            style={[styles.toggleButton, { width: toggleButtonWidth, height: toggleButtonHeight }]}
            onPress={toggleSwitch}
          >
            <Animated.View
              style={[
                styles.toggleCircle,
                {
                  width: toggleCircleWidth,
                  height: toggleCircleHeight,
                  borderRadius: toggleCircleRadius,
                  transform: [{ translateX }],
                  backgroundColor: selectedUnit === 'kVAh' ? 'red' : '#59CD73',
                },
              ]}
            />
          </Pressable>
          <Text style={styles.toggleLabel}>kWh</Text>
        </View>

        {/* Disabled Zone Toggle */}
        <View style={[styles.zoneToggleWrapper, styles.disabledZoneToggle]}>
          <Pressable
            style={[
              styles.zoneButton,
              zoneToggle === 'all' && styles.zoneButtonActive,
              { borderTopLeftRadius: wp('2%'), borderBottomLeftRadius: wp('2%') },
            ]}
            disabled
          >
            <Text
              style={[
                styles.zoneButtonText,
                zoneToggle === 'all' && styles.zoneButtonTextActive,
              ]}
            >
              All Zones
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.zoneButton,
              zoneToggle === 'single' && styles.zoneButtonActive,
              { borderTopRightRadius: wp('2%'), borderBottomRightRadius: wp('2%') },
            ]}
            disabled
          >
            <Text
              style={[
                styles.zoneButtonText,
                zoneToggle === 'single' && styles.zoneButtonTextActive,
              ]}
            >
              Select Zone
            </Text>
          </Pressable>
        </View>

        <TouchableOpacity 
          style={[styles.downloadButton, isDownloading && styles.disabledButton]}
          onPress={downloadExcel}
          disabled={isDownloading}
        >
          <Feather name="download" size={wp('4%')} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE ZONE CARDS */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: hp('3%') }}>
        {zones.map((zone, index) => {
          const startValue = zone.min[selectedUnit];
          const endValue = zone.max[selectedUnit];
          const consumed = endValue - startValue;

          const zoneMeta = meterToZoneMap[zone.zone] || { name: `Zone ${zone.zone}`, category: '' };
          const zoneName = zoneMeta.name;
          const subName = zoneMeta.category;

          return (
            <View style={styles.card} key={`zone-${zone.zone}`}>
              <View style={styles.headingWrapper}>
                <View style={styles.headingContainer}>
                  <Text style={styles.heading}>{zoneName}</Text>
                  {subName ? <Text style={styles.subHeading}>{subName}</Text> : null}
                </View>
              </View>
              <View style={styles.table}>
                <View style={styles.column}>
                  <View style={styles.cell}>
                    <Text style={styles.label}>Start Date & Time:</Text>
                    <Text style={styles.value}>{zone.min.timestamp}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.cell}>
                    <Text style={styles.label}>End Date & Time:</Text>
                    <Text style={styles.value}>{zone.max.timestamp}</Text>
                  </View>
                </View>
                <View style={styles.column}>
                  <View style={styles.cell}>
                    <Text style={styles.kwhValue}>
                      {startValue.toFixed(1)}{' '}
                      <Text
                        style={[
                          styles.kwhUnit,
                          { color: selectedUnit === 'kVAh' ? 'red' : '#59CD73' },
                        ]}
                      >
                        {selectedUnit}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.cell}>
                    <Text style={styles.kwhValue}>
                      {endValue.toFixed(1)}{' '}
                      <Text
                        style={[
                          styles.kwhUnit,
                          { color: selectedUnit === 'kVAh' ? 'red' : '#59CD73' },
                        ]}
                      >
                        {selectedUnit}
                      </Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.consumptionColumn}>
                  <View style={styles.consumptionBox}>
                    <Text style={styles.consumedValue}>
                      {consumed.toFixed(1)}{' '}
                      <Text
                        style={[
                          styles.kwhUnit,
                          { color: selectedUnit === 'kVAh' ? 'red' : '#59CD73' },
                        ]}
                      >
                        {selectedUnit}
                      </Text>
                    </Text>
                    <Text style={styles.consumptionLabel}>consumption</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginTop: hp('1%'),
    borderRadius: wp('2.5%'),
    borderWidth: 1,
    borderColor: '#ccc',
  },
  headingWrapper: {
    alignItems: 'center',
  },
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#08223B',
    width: wp('75%'),
    paddingVertical: hp('0.7%'),
    borderBottomRightRadius: wp('4.5%'),
    borderBottomLeftRadius: wp('4.5%'),
    alignItems: 'center',
    gap: wp('2%'),
  },
  heading: {
    color: '#fff',
    fontSize: wp('3%'),
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  subHeading: {
    color: '#ccc',
    fontSize: wp('2.5%'),
    fontFamily: 'Poppins',
  },
  table: {
    padding: wp('0.5%'),
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  cell: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: hp('0.5%'),
  },
  label: {
    fontSize: wp('2.5%'),
    color: '#777',
    fontFamily: 'Poppins',
  },
  value: {
    fontSize: wp('2.5%'),
    color: '#777',
    fontFamily: 'Poppins',
  },
  kwhValue: {
    fontSize: wp('3.5%'),
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  kwhUnit: {
    color: 'red',
    fontSize: wp('3%'),
    fontFamily: 'Poppins',
  },
  consumptionColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consumptionBox: {
    alignItems: 'center',
  },
  consumedValue: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins',
  },
  consumptionLabel: {
    fontSize: wp('3%'),
    color: '#888',
    fontFamily: 'Poppins',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    gap: wp('2.5%'),
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('3%'),
    backgroundColor: '#59CD73',
    borderRadius: wp('2%'),
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
  },
  toggleLabel: {
    fontSize: wp('3%'),
    color: '#333',
    fontFamily: 'Poppins',
  },
  toggleButton: {
    borderRadius: wp('3.5%'),
    justifyContent: 'center',
    backgroundColor: '#ccc',
    position: 'relative',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  toggleCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  zoneToggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: wp('2%'),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledZoneToggle: {
    opacity: 0.4,
  },
  zoneButton: {
    paddingVertical: hp('0.4%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fff',
  },
  zoneButtonActive: {
    backgroundColor: 'gray',
  },
  zoneButtonText: {
    color: '#212121',
    fontSize: wp('3%'),
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  zoneButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});