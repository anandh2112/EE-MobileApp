import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, addDays, subDays, differenceInCalendarDays, isAfter } from 'date-fns';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const tooltipWidth = 140;
const tooltipHeight = 56;
const tooltipMargin = 8;

const heatmapGridWidth = 36 * 24;
const minScrollWidth = screenWidth - 70;
const scrollableWidth = Math.max(heatmapGridWidth, minScrollWidth);

type TooltipData = {
  value: number;
  hour: string;
  date: string;
  top: number;
  left: number;
} | null;

const today = new Date();

export default function HeatMap() {
  const [startDate, setStartDate] = useState<Date>(today);
  const [showPicker, setShowPicker] = useState(false);
  const [tooltipData, setTooltipData] = useState<TooltipData>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [heatmapLayout, setHeatmapLayout] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [data, setData] = useState<number[][]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const scrollViewRef = useRef<any>(null);

  const scrollX = useRef(new Animated.Value(0)).current;
  const thumbWidth = (screenWidth / scrollableWidth) * screenWidth;
  const maxScroll = scrollableWidth - screenWidth;
  const maxThumbTravel = screenWidth - thumbWidth;

  const thumbTranslateX = scrollX.interpolate({
    inputRange: [0, maxScroll > 0 ? maxScroll : 1],
    outputRange: [0, maxThumbTravel > 0 ? maxThumbTravel : 1],
    extrapolate: 'clamp',
  });

  const windowStart = subDays(startDate, 14);
  const windowEnd = startDate;
  const numDays = differenceInCalendarDays(windowEnd, windowStart) + 1;

  const yLabels = Array.from({ length: numDays }, (_, i) =>
    i === 0 || i === numDays - 1
      ? format(addDays(windowStart, i), 'MMM d')
      : format(addDays(windowStart, i), 'd')
  );
  const yDates = Array.from({ length: numDays }, (_, i) =>
    format(addDays(windowStart, i), 'yyyy-MM-dd')
  );
  const xLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Fetch data when startDate changes
  useEffect(() => {
    const start = format(windowStart, 'yyyy-MM-dd');
    const end = format(addDays(windowEnd, 1), 'yyyy-MM-dd');
    const fetchConsumptionData = async () => {
      try {
        const res = await axios.get('https://mw.elementsenergies.com/api/ehconsumption', {
          params: {
            startDate: start,
            endDate: end,
          },
        });

        const rawData = res.data.consumptionData;

        // Initialize empty grid
        const newData: number[][] = Array.from({ length: numDays }, () => Array(24).fill(0));

        // Fill data
        rawData.forEach((item: { day: string; hour: number; total_consumption: number }) => {
          const dayIndex = yDates.indexOf(item.day);
          if (dayIndex !== -1 && item.hour >= 0 && item.hour < 24) {
            newData[dayIndex][item.hour] = item.total_consumption;
          }
        });

        setData(newData);
      } catch (err) {
        console.error('Error fetching heatmap data:', err);
        setData(Array.from({ length: numDays }, () => Array(24).fill(0)));
      }
    };

    fetchConsumptionData();
  }, [startDate]);

  const downloadExcel = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      if (!data || data.length === 0) {
        Alert.alert("No Data", "There is no data available to export.");
        return;
      }

      // Prepare data for Excel
      const headerRow = [
        `Start: ${format(windowStart, 'yyyy-MM-dd')}`,
        `End: ${format(windowEnd, 'yyyy-MM-dd')}`,
        "",
      ];

      const columnHeaders = ["Date", "Hour", "Energy Consumed (kWh)"];
      
      const formattedData = data.flatMap((row, rowIndex) => 
        row.map((value, colIndex) => [
          yDates[rowIndex],
          `${colIndex}:00`,
          parseFloat(value.toString()),
        ])
      );

      const dataForExcel = [headerRow, columnHeaders, ...formattedData];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
      XLSX.utils.book_append_sheet(workbook, worksheet, "EnergyConsumption");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
      const fileName = `Heat_Map_${format(windowStart, 'yyyy_MM_dd')}_to_${format(windowEnd, 'yyyy_MM_dd')}.xlsx`;
      
      if (Platform.OS === 'android') {
        // For Android - save directly to Downloads folder
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (!permissions.granted) {
          Alert.alert("Permission Denied", "Storage permission is required to save the file.");
          return;
        }

        const directoryUri = permissions.directoryUri;
        
        await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri, 
          fileName, 
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
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
        
        // On iOS, we can't directly save to Downloads, so we'll show a success message
        Alert.alert("Success", "File saved to app's document directory");
      }
    } catch (error) {
      console.error("Error generating Excel file:", error);
      Alert.alert("Error", "Failed to generate Excel file");
    } finally {
      setIsDownloading(false);
    }
  };

  const colorValues = [
    '#066A06', '#298F35', '#4DB458', '#6AC96A', '#8EDC7F', '#B1EF98', '#BBF558',
    '#DAEF2A', '#F9E900', '#FFF400', '#FFE300', '#FFC200', '#FFA100', '#FF8100',
    '#FF5F00', '#FF3F00', '#FF1000',
  ];

  const getColor = (value: number) => {
    if (value <= 29) return '#066A06';
    if (value <= 58) return '#298F35';
    if (value <= 87) return '#4DB458';
    if (value <= 116) return '#6AC96A';
    if (value <= 145) return '#8EDC7F';
    if (value <= 174) return '#B1EF98';
    if (value <= 203) return '#BBF558';
    if (value <= 232) return '#DAEF2A';
    if (value <= 261) return '#F9E900';
    if (value <= 290) return '#FFF400';
    if (value <= 319) return '#FFE300';
    if (value <= 348) return '#FFC200';
    if (value <= 377) return '#FFA100';
    if (value <= 406) return '#FF8100';
    if (value <= 435) return '#FF5F00';
    if (value <= 464) return '#FF3F00';
    return '#FF1000';
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (date) {
      setStartDate(isAfter(date, today) ? today : date);
    }
  };

  const handleIosDone = () => {
    setShowPicker(false);
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  let tooltipAbsolute: { top: number; left: number } | null = null;
  if (tooltipData) {
    let intendedTop = (heatmapLayout.y || 0) + (tooltipData.top || 0);
    let intendedLeft = (heatmapLayout.x || 0) + (tooltipData.left || 0) - scrollOffset;

    let left = intendedLeft;
    if (left + tooltipWidth + tooltipMargin > screenWidth) {
      left = screenWidth - tooltipWidth - tooltipMargin;
    }
    if (left < tooltipMargin) {
      left = tooltipMargin;
    }
    let top = intendedTop;
    if (top + tooltipHeight + tooltipMargin > screenHeight) {
      top = screenHeight - tooltipHeight - tooltipMargin;
    }
    if (top < tooltipMargin) {
      top = tooltipMargin;
    }
    tooltipAbsolute = { top, left };
  }

  function isPressInsideTooltip(evt: any) {
    if (!tooltipAbsolute) return false;
    const { pageX, pageY } = evt.nativeEvent;
    const { left, top } = tooltipAbsolute;
    return (
      pageX >= left &&
      pageX <= left + tooltipWidth &&
      pageY >= top &&
      pageY <= top + tooltipHeight
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Energy Heat Map</Text>
          <View style={styles.headerButtonRow}>
            <TouchableOpacity onPress={showDatePicker} style={styles.iconButton}>
              <Icon name="calendar" size={20} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.downloadButton, isDownloading && styles.disabledButton]}
              onPress={downloadExcel}
              disabled={isDownloading}
            >
              <Icon name="download" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heatmapWrapper}>
          <View style={styles.yAxis}>
            {yLabels.map((label, index) => (
              <Text key={index} style={styles.yLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View
            style={{ flex: 1 }}
            onLayout={e => setHeatmapLayout(e.nativeEvent.layout)}
          >
            <Animated.ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 2 }}
              contentContainerStyle={{ minWidth: scrollableWidth }}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                {
                  useNativeDriver: false,
                  listener: (e: { nativeEvent: { contentOffset: { x: number } } }) => {
                    setScrollOffset(e.nativeEvent.contentOffset.x);
                  },
                }
              )}
            >
              <View>
                <View style={styles.heatmapGrid}>
                  {data.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                      {row.map((value, colIndex) => (
                        <TouchableOpacity
                          key={colIndex}
                          onPress={() =>
                            setTooltipData({
                              value,
                              hour: xLabels[colIndex],
                              date: yDates[rowIndex],
                              top: rowIndex * 20 + 6,
                              left: colIndex * 36 + 6,
                            })
                          }
                        >
                          <View
                            style={[
                              styles.cell,
                              { backgroundColor: getColor(value) },
                            ]}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
                <View style={styles.xAxis}>
                  {xLabels.map((label, index) => (
                    <View key={index} style={styles.xLabelContainer}>
                      <Text style={styles.xLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.ScrollView>

            <View style={styles.scrollBarTrack}>
              <Animated.View
                style={[
                  styles.scrollBarThumb,
                  {
                    width: thumbWidth,
                    transform: [{ translateX: thumbTranslateX }],
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.legendFullContainer}>
          <Text style={styles.legendHeading}>Energy (kWh)</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendBar}>
              {colorValues.map((color, idx) => (
                <View
                  key={idx}
                  style={[styles.legendBlock, { backgroundColor: color }]}
                />
              ))}
            </View>
            <View style={styles.legendLabelsRow}>
              <Text style={styles.legendLabel}>0</Text>
              <Text style={styles.legendLabel}>100</Text>
              <Text style={styles.legendLabel}>200</Text>
              <Text style={styles.legendLabel}>300</Text>
              <Text style={styles.legendLabel}>400</Text>
              <Text style={styles.legendLabel}>500</Text>
            </View>
          </View>
        </View>
      </View>

      {Platform.OS === 'ios' && showPicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showPicker}
          onRequestClose={handleIosDone}
        >
          <Pressable style={styles.iosPickerBackdrop} onPress={handleIosDone} />
          <View style={styles.iosPickerModal}>
            <DateTimePicker
              value={startDate}
              mode="date"
              maximumDate={today}
              display="spinner"
              onChange={(event, date) => {
                if (date) setStartDate(isAfter(date, today) ? today : date);
              }}
              style={styles.iosPicker}
            />
            <TouchableOpacity style={styles.iosDoneButton} onPress={handleIosDone}>
              <Text style={styles.iosDoneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          maximumDate={today}
          display="default"
          onChange={handleDateChange}
        />
      )}

      {tooltipData && tooltipAbsolute && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={e => {
              if (!isPressInsideTooltip(e)) setTooltipData(null);
            }}
          >
            <View style={{ flex: 1 }} />
          </Pressable>
          <View
            style={[
              styles.tooltip,
              {
                position: 'absolute',
                top: tooltipAbsolute.top,
                left: tooltipAbsolute.left,
                width: tooltipWidth,
                height: tooltipHeight,
              },
            ]}
            pointerEvents="box-none"
          >
            <Text style={styles.tooltipText}>
              Date : {tooltipData.date}
            </Text>
            <Text style={styles.tooltipText}>
              Hour : {tooltipData.hour}
            </Text>
            <Text style={styles.tooltipText}>
              Consumption : {tooltipData.value} kWh
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    marginRight: 8,
    padding: 2,
  },
  downloadButton: {
    backgroundColor: "#007bff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginTop: 2,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  heatmapWrapper: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  yAxis: {
    marginRight: 8,
    alignItems: 'flex-end',
  },
  yLabel: {
    fontSize: 10,
    color: '#666',
    height: 20,
  },
  heatmapGrid: {
    flexDirection: 'column',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 36,
    height: 20,
    margin: 0,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  xLabelContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLabel: {
    fontSize: 10,
    color: '#666',
  },
  scrollBarTrack: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginHorizontal: 2,
    marginBottom: 2,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  scrollBarThumb: {
    height: 4,
    backgroundColor: '#007bff',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  legendFullContainer: {
    marginTop: 8,
    marginBottom: 0,
    alignItems: 'stretch',
    paddingHorizontal: 2,
  },
  legendHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    alignSelf: 'flex-start',
    marginBottom: 1,
    marginLeft: 4,
  },
  legendContainer: {
    marginTop: 2,
    marginBottom: 0,
    alignItems: 'stretch',
    paddingHorizontal: 0,
  },
  legendBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 0,
    marginBottom: 0,
  },
  legendBlock: {
    flex: 1,
    height: 10,
  },
  legendLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 0,
    marginTop: 1,
  },
  legendLabel: {
    fontSize: 8,
    color: '#666',
    width: 20,
    textAlign: 'center',
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 6,
    borderRadius: 6,
    zIndex: 100,
    elevation: 6,
    minWidth: 110,
    maxWidth: 160,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 10,
  },
  iosPicker: {
    backgroundColor: 'white',
    width: '100%',
  },
  iosPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosPickerModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 7,
  },
  iosDoneButton: {
    marginTop: 8,
    backgroundColor: '#007bff',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 8,
  },
  iosDoneButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});