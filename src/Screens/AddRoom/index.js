import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Card, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function AddRoomScreen() {
  const [roomName, setRoomName] = useState('');
  const [accessType, setAccessType] = useState('Students'); // Default selection
  const [rooms, setRooms] = useState([]); // Stores added rooms
  const [showForm, setShowForm] = useState(false); // Toggle for form visibility

  useEffect(() => {
    loadRooms();
  }, []);

  // Load stored rooms from AsyncStorage
  const loadRooms = async () => {
    try {
      const storedRooms = await AsyncStorage.getItem('rooms');
      if (storedRooms) {
        setRooms(JSON.parse(storedRooms));
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  // Save rooms to AsyncStorage
  const saveRooms = async (updatedRooms) => {
    try {
      await AsyncStorage.setItem('rooms', JSON.stringify(updatedRooms));
    } catch (error) {
      console.error('Failed to save rooms:', error);
    }
  };

  // Function to add a room
  const handleAddRoom = () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Room name cannot be empty!');
      return;
    }

    const newRoom = {
      id: Date.now().toString(),
      name: roomName,
      access: accessType,
      enabled: true, // Default switch state
    };

    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    saveRooms(updatedRooms);

    setRoomName('');
    setAccessType('Students');
    setShowForm(false); // Hide form after adding
  };

  // Toggle switch state for room access
  const toggleRoomStatus = (roomId) => {
    const updatedRooms = rooms.map((room) =>
      room.id === roomId ? { ...room, enabled: !room.enabled } : room
    );
    setRooms(updatedRooms);
    saveRooms(updatedRooms);
  };

  return (
    <View style={styles.container}>
      {/* Header Title */}
      <Text style={styles.headerTitle}>Manage Room Access</Text>

      {/* Room List Display */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.roomCard}>
            <View style={styles.roomContent}>
              <View>
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.roomAccess}>Access: {item.access}</Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleRoomStatus(item.id)}
                color="#007AFF"
                style={styles.switchStyle}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.noRoomsText}>No rooms added yet.</Text>}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}>
        <Icon name={showForm ? 'close' : 'plus'} size={24} color="white" />
      </TouchableOpacity>

      {/* Add Room Form (Visible only when showForm is true) */}
      {showForm && (
        <View style={styles.addRoomForm}>
          <TextInput
            placeholder="Enter Room Name"
            value={roomName}
            onChangeText={setRoomName}
            style={styles.input}
          />

          <View style={styles.accessTypeContainer}>
            {['Students', 'Teachers', 'All'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.accessButton,
                  accessType === type && styles.accessButtonSelected,
                ]}
                onPress={() => setAccessType(type)}>
                <Text
                  style={[
                    styles.accessButtonText,
                    accessType === type && styles.accessButtonTextSelected,
                  ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button mode="contained" onPress={handleAddRoom} style={styles.submitButton}>
            Add Room
          </Button>
        </View>
      )}
    </View>
  );
}

// Styles (Light Mode, Clean & Modern)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noRoomsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  roomCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3, // For shadow effect
    padding: 15,
  },
  roomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Align items properly
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roomAccess: {
    fontSize: 14,
    color: '#555',
  },
  switchStyle: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], // Slightly bigger toggle
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addRoomForm: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
    paddingVertical: 8,
    marginBottom: 10,
  },
  accessTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  accessButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  accessButtonSelected: {
    backgroundColor: '#007AFF',
  },
  accessButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  accessButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
  },
});

export default AddRoomScreen;
