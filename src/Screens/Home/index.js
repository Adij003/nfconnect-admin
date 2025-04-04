import React, { useEffect } from 'react';

import {
  View,
  Text,
  Image,
  Dimensions,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import NfcProxy from '../../NfcProxy';
import NfcManager, { NfcEvents, NfcTech } from 'react-native-nfc-manager';
import { Button, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import qs from 'query-string';
import supabase from '../../database/supabaseClient';

function HomeScreen(props) {
  const { navigation } = props;
  const [enabled, setEnabled] = React.useState(null);
  const padding = 40;
  // const width = Dimensions.get('window').width - 2 * padding;
  const width = Dimensions.get('window').width - 0.5 * padding; // Reduces the subtraction, increasing width

  // const width = Dimensions.get('window').width - 2 * padding + 20; // Adds 20 pixels to the width


  React.useEffect(() => {
    async function initNfc() {
      try {
        setEnabled(await NfcProxy.isEnabled());

        function onBackgroundTag(bgTag) {
          navigation.navigate('Main', {
            screen: 'TagDetail',
            params: { tag: bgTag },
          });
        }

        function onDeepLink(url, launch) {
          try {
            const customScheme = [
              'com.nfcadmin.app://', // Android
              'com.revteltech.nfcopenrewriter://', // iOS
            ].find((scheme) => {
              return scheme === url.slice(0, scheme.length);
            });

            if (!customScheme) {
              return;
            }

            url = url.slice(customScheme.length);
            let action = url;
            let query = '';
            let splitIdx = url.indexOf('?');

            if (splitIdx > -1) {
              action = url.slice(0, splitIdx);
              query = url.slice(splitIdx);
            }

            const params = qs.parse(query);
            if (action === 'share') {
              const sharedRecord = JSON.parse(params.data);
              if (sharedRecord.payload?.tech === NfcTech.Ndef) {
                navigation.navigate('Main', {
                  screen: 'NdefWrite',
                  params: { savedRecord: sharedRecord },
                });
              } else if (sharedRecord.payload?.tech === NfcTech.NfcA) {
                navigation.navigate('Main', {
                  screen: 'CustomTransceive',
                  params: { savedRecord: sharedRecord },
                });
              } else if (sharedRecord.payload?.tech === NfcTech.NfcV) {
                navigation.navigate('Main', {
                  screen: 'CustomTransceive',
                  params: { savedRecord: sharedRecord },
                });
              } else if (sharedRecord.payload?.tech === NfcTech.IsoDep) {
                navigation.navigate('Main', {
                  screen: 'CustomTransceive',
                  params: { savedRecord: sharedRecord },
                });
              } else {
                console.warn('unrecognized share payload tech');
              }
            }
          } catch (ex) {
            console.warn('fail to parse deep link', ex);
          }
        }

        // Get the initial launching tag
        const bgTag = await NfcManager.getBackgroundTag();
        if (bgTag) {
          onBackgroundTag(bgTag);
        } else {
          const link = await Linking.getInitialURL();
          console.warn('DEEP LINK', link);
          if (link) {
            onDeepLink(link, true);
          }
        }

        // Listen to other background tags after the app launched
        NfcManager.setEventListener(
          NfcEvents.DiscoverBackgroundTag,
          onBackgroundTag
        );

        // Listen to the NFC on/off state on Android
        if (Platform.OS === 'android') {
          NfcManager.setEventListener(NfcEvents.StateChanged, ({ state } = {}) => {
            NfcManager.cancelTechnologyRequest().catch(() => 0);
            if (state === 'off') {
              setEnabled(false);
            } else if (state === 'on') {
              setEnabled(true);
            }
          });
        }

        Linking.addEventListener('url', (event) => {
          if (event.url) {
            onDeepLink(event.url, false);
          }
        });
      } catch (ex) {
        console.warn(ex);
        Alert.alert('ERROR', 'Fail to initialize NFC', [{ text: 'OK' }]);
      }
    }

    initNfc();
  }, [navigation]);

  function renderNfcButtons() {
    return (
      <View
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          right: 0,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <Button
          mode="contained"
          onPress={async () => {
            const tag = await NfcProxy.readTag();
            if (tag) {
              navigation.navigate('Main', { screen: 'TagDetail', params: { tag } });
            }
          }}
          style={{ width }}>
          SCAN NFC TAG FOR ADMIN TESTING
        </Button>
      </View>
    );
  }

  function renderNfcNotEnabled() {
    return (
      <View
        style={{
          alignItems: 'stretch',
          alignSelf: 'center',
          width,
        }}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>
          Your NFC is not enabled. Please first enable it and hit CHECK AGAIN button.
        </Text>

        <Button
          mode="contained"
          onPress={() => NfcProxy.goToNfcSetting()}
          style={{ marginBottom: 10 }}>
          GO TO NFC SETTINGS
        </Button>

        <Button
          mode="outlined"
          onPress={async () => {
            setEnabled(await NfcProxy.isEnabled());
          }}>
          CHECK AGAIN
        </Button>
      </View>
    );
  }

  useEffect(() => {
    try {
      console.log(new URL("https://example.com").hostname);
    } catch (error) {
      console.error("URL API not working:", error);
    }
  }, []);



  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView />
      <View style={{ flex: 1, padding }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={require('../../../images/nfc-logo.jpeg')}
            style={{ width: 250, height: 250 }}
            resizeMode="contain"
          />
          <Text
            style={{
              padding: 20,
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#A9A9A9',
            }}>
            NFC Connect Admin
          </Text>
        </View>

        {/* Settings Button */}
        <IconButton
          icon={() => <Icon name="cog" size={32} />}
          style={styles.settingIcon}
          onPress={() => {
            navigation.navigate('Settings');
          }}
        />

        {/* Manage Room Access Button (FIXED) */}
        <View style={styles.manageRoomContainer}>
          <IconButton
            icon={() => <Icon name="plus" size={24} />}
            onPress={() => {
              navigation.navigate('Main', { screen: 'AddRoom' });
            }}
          />
          <Text style={styles.manageRoomText}>Manage Room Access </Text>
        </View>

        {renderNfcButtons()}
      </View>
    </>
  );

}

const styles = StyleSheet.create({
  settingIcon: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 0,
    right: 20,
  },
  manageRoomContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 0,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageRoomText: {
    fontSize: 14,
    marginLeft: -10,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
