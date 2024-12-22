import React, { useEffect } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = () => {
  const [devices, setDevices] = React.useState([]);

  useEffect(() => {
    BleManager.start({ showAlert: false });

    const handleDiscoverPeripheral = (peripheral) => {
      setDevices((prevDevices) => {
        if (!prevDevices.some((dev) => dev.id === peripheral.id)) {
          return [...prevDevices, peripheral];
        }
        return prevDevices;
      });
    };

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

    return () => {
      bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    };
  }, []);

  const startScan = () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          BleManager.scan([], 5, true).then(() => {
            console.log('Scanning...');
          });
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              BleManager.scan([], 5, true).then(() => {
                console.log('Scanning...');
              });
            } else {
              console.log('Permission denied');
            }
          });
        }
      });
    } else {
      BleManager.scan([], 5, true).then(() => {
        console.log('Scanning...');
      });
    }
  };

  return (
    <View>
      <Button title="Scan for BLE Devices" onPress={startScan} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name || 'Unnamed device'}</Text>
            <Text>{item.id}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default App;