import * as React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import supabase from '../../database/supabaseClient';
import { Button } from 'react-native-paper';

function SavedRecordScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false); // Track locked state

  async function fetchEntries() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_name', 'Adi Jain'); // Optional: filter for one user

      if (error) throw error;

      setEntries(data || []);
      if (data?.length > 0) {
        setIsLocked(data[0].isLocked); // Initialize toggle based on current value
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleRefresh = () => {
    fetchEntries();
  };

  const toggleLockUser = async () => {
    const newValue = !isLocked;

    try {
      const { error } = await supabase
        .from('entries')
        .update({ isLocked: newValue })
        .eq('user_name', 'Adi Jain');

      if (error) throw error;

      setIsLocked(newValue);      // Update UI toggle immediately
      fetchEntries();             // Re-fetch to reflect update
    } catch (err) {
      setError(`Failed to update lock state: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User History: Adi Jain</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      {/* Lock User Toggle Button */}
      <TouchableOpacity
        style={[
          styles.lockButton,
          { backgroundColor: isLocked ? '#ff4d4d' : '#4CAF50' }
        ]}
        onPress={toggleLockUser}
      >
        <Text style={styles.lockButtonText}>
          {isLocked ? 'Unlock User' : 'Lock User'}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : entries.length > 0 ? (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>User: {item.user_name}</Text>
              <Text style={styles.cardText}>Room No: {item.room_no}</Text>
              <Text style={styles.cardText}>Entry Date: {item.entry_date}</Text>
              <Text style={styles.cardText}>Entry Time: {item.entry_time}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noEntryText}>No entry records found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  lockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  noEntryText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default SavedRecordScreen;
