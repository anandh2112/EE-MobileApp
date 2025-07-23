import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

export default function TopBar() {
  const [toggleImage, setToggleImage] = useState(true);

  return (
    <View style={styles.topRow}>
      <Image
        source={require('../assets/images-user/icon.png')}
        style={styles.logo}
      />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="grey"
          style={styles.input}
        />
      </View>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setToggleImage(!toggleImage)}
      >
        <Image
          source={
            toggleImage
              ? require('../assets/images-user/dark.png')
              : require('../assets/images-user/light.png')
          }
          style={styles.toggleImage}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  toggleButton: {
    marginLeft: 10,
  },
  toggleImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
