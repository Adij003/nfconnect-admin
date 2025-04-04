import React from 'react';
import {
  Image,
  Linking,
  View,
  ScrollView,
  Text,
  StyleSheet,
  Platform,
  Keyboard,
  Dimensions,
  Alert,
} from 'react-native';
import {Appbar, List, TextInput, Button} from 'react-native-paper';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import {version} from '../../../package.json';

const generalText = `
NfcConnect has been a project for Cybersecurity course 

Any kind of contributions and suggestions are always welcome!
`;

function SettingsScreen(props) {
  const [nfcStatus, setNfcStatus] = React.useState(null);
  const [feedback, setFeedback] = React.useState('');
  const [keyboardPadding, setKeyboardPadding] = React.useState(0);
  const scrollPosRef = React.useRef(0);

  React.useEffect(() => {
    function onNfcStateChanged(evt = {}) {
      const {state} = evt;
      setNfcStatus(state === 'on');
    }

    async function checkNfcState() {
      setNfcStatus(await NfcManager.isEnabled());
      NfcManager.setEventListener(NfcEvents.StateChanged, onNfcStateChanged);
    }

    if (Platform.OS === 'android') {
      checkNfcState();
    }

    return () => {
      if (Platform.OS === 'android') {
        NfcManager.setEventListener(NfcEvents.StateChanged, null);
      }
    };
  }, []);

  return (
    <>
      <Appbar.Header style={{backgroundColor: '#00abff'}}>
        <Appbar.BackAction onPress={() => props.navigation.goBack()} />
        <Text style={{marginLeft: 10, fontSize: 18}}>About This App</Text>
      </Appbar.Header>
      <ScrollView style={[styles.wrapper]}>
        <View style={styles.topBanner}>
          <Text style={{lineHeight: 16}}>{generalText}</Text>
        </View>
        <List.Section>
          {Platform.OS === 'android' && (
            <>
              <List.Item
                title="NFC Status"
                description={
                  nfcStatus === null ? '---' : nfcStatus ? 'ON' : 'OFF'
                }
              />
              <List.Item
                title="NFC Settings"
                description="Jump to System NFC Settings"
                onPress={() => {
                  NfcManager.goToNfcSetting();
                }}
              />
            </>
          )}
          {/* <List.Item title="Version" description={version} /> */}
          {/* <List.Item
            title="Repository"
            description="https://github.com/revtel/react-native-nfc-rewriter"
            onPress={() => {
              Linking.openURL(
                'https://github.com/revtel/react-native-nfc-rewriter',
              );
            }}
          /> */}
          <List.Subheader>Creators</List.Subheader>
          {/* <List.Item 
            title="Revteltech 忻旅科技"
            left={() => (
              <Image
                source={require('../../../images/revicon_512.png')}
                style={styles.maintainerIcon}
                resizeMode="contain"
              />
            )}
            description="https://www.revtel.tech/en"
            onPress={() => {
              Linking.openURL('https://www.revtel.tech/en');
            }}
          /> */}
          {/* <List.Item
            title="NFC To GO"
            left={() => (
              <Image
                source={require('../../../images/n2g_512.png')}
                style={styles.maintainerIcon}
                resizeMode="contain"
              />
            )}
            description="https://www.nfctogo.com"
            onPress={() => {
              Linking.openURL('https://www.nfctogo.com');
            }}
          /> */}
          <List.Item title = "Ashish Jadhawar" description="21bcs015" />
          <List.Item title = "Adi Jain" description="21bcs003" />
          <List.Item title = "Chaytali Jawalekar" description="21bcs026" />
          <List.Item title = "Rithwik Reddy" description="21bcs028" />
        </List.Section>
        <Button
          mode="contained"
          style={{margin: 20}}
          onPress={() => {
            Linking.openURL('mailto:21bcs015@iiitdwd.ac.in');
          }}>
          Contact Us
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topBanner: {
    borderRadius: 6,
    margin: 10,
    paddingHorizontal: 15,
    backgroundColor: '#00abff',
  },
  maintainerIcon: {
    width: 54,
    height: 54,
    overflow: 'hidden',
    borderRadius: 4,
  },
});

export default SettingsScreen;
