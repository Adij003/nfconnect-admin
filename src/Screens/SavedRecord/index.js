import * as React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import supabase from '../../database/supabaseClient';

function SavedRecordScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true)

  // Function to fetch data
  async function fetchEntries() {
    setLoading(true); // Show loading while fetching data
    try {
      const { data, error } = await supabase
        .from('entries')  // Table name
        .select('*');      // Fetch all columns

      if (error) {
        throw error;
      }

      setTimeout(() => {
        setEntries(data || []);
        setLoading(false);
      }, 1500); // Simulating a delay
    } catch (err) {
      console.error('Error fetching entries:', err.message);
      setError(err.message);
      setLoading(false);
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchEntries();
  }, []);

  // Refresh button handler
  const handleRefresh = () => {
    fetchEntries();
  };

  return (
    <View style={styles.container}>
      {/* Refresh Button */}
    

      <Text style={styles.title}>All User History</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshText}>Refresh</Text>
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
    backgroundColor: 'white',  // White background
    borderColor: 'black',      // Black border
    borderWidth: 1,            // Thin border
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  
  refreshText: {
    color: 'black',            // Black text
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
