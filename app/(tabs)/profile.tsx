import React from "react";
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarWrapper}>
        <TouchableOpacity activeOpacity={0.7} style={styles.avatarTouchable}>
          <Image
            source={{ uri: "https://plus.unsplash.com/premium_photo-1683543124615-fb42e42c6201?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
            style={styles.avatar}
          />
          <View style={styles.editIcon}>
            <Ionicons name="pencil" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} placeholder="First Name" />

        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} placeholder="Last Name" />

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} placeholder="Username" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneRow}>
          <TextInput
            style={[styles.input, styles.countryCode]}
            placeholder="+91"
            editable={false}
          />
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="1234567890"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.changePwdBtn}>
          <Text style={styles.changePwdText}>Change</Text>
          <Ionicons name="lock-closed" size={16} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 0,
    minHeight: "100%",
  },
  avatarWrapper: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 16,
    position: "relative",
    zIndex: 2,
  },
  avatarTouchable: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#5561f2",
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 30,
    paddingHorizontal: 24,
    width: "90%",
    marginTop: -14,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#212121",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  countryCode: {
    width: 70,
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
  },
  changePwdBtn: {
    marginTop: 28,
    backgroundColor: "#1d3557",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  changePwdText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});