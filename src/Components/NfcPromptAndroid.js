import React from 'react';
import {Image, Text, View, Animated, StyleSheet, Modal} from 'react-native';
import {Button} from 'react-native-paper';
import NfcManager from 'react-native-nfc-manager';
import {useOutlet} from 'reconnect.js';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from '../database/supabaseClient';



function NfcPromptAndroid(props) {
  const [visible, setVisible] = React.useState(false);
  const animValue = React.useRef(new Animated.Value(0)).current;
  const [_data, _setData] = useOutlet('androidPrompt');
  const {visible: _visible, message = ''} = _data || {};

  const navigation = useNavigation();


  React.useEffect(() => {
    if (_visible) {
      setVisible(true);
      Animated.timing(animValue, {
        duration: 300,
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animValue, {
        duration: 200,
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    }
  }, [_visible, animValue]);

  // function ProceedToMFA() {
  //   setTimeout(() => {
  //     NfcManager.cancelTechnologyRequest().catch(() => 0);
  //   }, 200);
  //   _setData({visible: false, message});
  // }

  // const rnBiometrics = new ReactNativeBiometrics();
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true, // Optional: Allows using device credentials as fallback
  });
  

  async function ProceedToMFA() {
    try {
      setTimeout(() => {
        NfcManager.cancelTechnologyRequest().catch(() => 0);
      }, 200);
      _setData({ visible: false, message });
  
      // Check if Biometrics is available
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
  
      if (!available) {
        Alert.alert('Error', 'Biometric authentication is not available on this device.');
        return;
      }
  
      const promptMessage = biometryType === 'FaceID' ? 'Authenticate using Face ID' : 'Authenticate using Fingerprint';
  
      // Perform biometric authentication
      const { success } = await rnBiometrics.simplePrompt({ promptMessage });
  
      if (success) {
        Alert.alert('Success', 'User authenticated successfully.');
        console.log("Navigating to MyRecordsTab with entryData:", entryData);
        navigation.navigate('MyRecordsTab', { entryData });
        const { data, error } = await supabase.from('entries').insert([
          {
            room_no: entryData.roomNo,
            user_name: entryData.user,
            entry_date: entryData.entryDate,
            entry_time: entryData.entryTime,
          },
        ]);
  
        if (error) {
          console.error('Supabase Insert Error:', error);
          Alert.alert('Database Error', 'Failed to store entry data.');
        } else {
          console.log('Entry stored successfully:', data);
          Alert.alert('Success', 'Entry data stored successfully.');
  
          // Navigate after storing data
          navigation.navigate('MyRecordsTab', { entryData });
        }

      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication was canceled or failed.');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Error', 'Biometric authentication failed: ' + error.message);
    }
  }
  

  

  const bgAnimStyle = {
    backgroundColor: 'rgba(0,0,0,0.3)',
    opacity: animValue,
  };

  const promptAnimStyle = {
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };

  const currentDate = new Date().toLocaleDateString();
// const currentTime = new Date().toLocaleTimeString();
const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
console.log(currentTime);

const entryData = {
  roomNo: "C102",
  user: "Adi Jain",
  entryDate: currentDate,
  entryTime: currentTime,
};
 

return (
  <Modal transparent={true} visible={visible}>
    <View style={[styles.wrapper]}>
      <View style={{ flex: 1 }} />

      <Animated.View style={[styles.prompt, promptAnimStyle]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Image
            source={require("../../images/nfc-512.png")}
            style={{ width: 120, height: 120, padding: 20 }}
            resizeMode="contain"
          />

          <Text>Tag Scanned</Text>
          <Text>Room No: {entryData.roomNo}</Text>
          <Text>User: {entryData.user}</Text>
          <Text>Entry Date: {entryData.entryDate}</Text>
          <Text>Entry Time: {entryData.entryTime}</Text>
        </View>

        <Button mode="contained" onPress={ProceedToMFA}>
          Tag Scanned Proceed to MFA
        </Button>
      </Animated.View>

      <Animated.View style={[styles.promptBg, bgAnimStyle]} />
    </View>
  </Modal>
);

}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  promptBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  prompt: {
    height: 300,
    alignSelf: 'stretch',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    zIndex: 2,
  },
});

export default NfcPromptAndroid;