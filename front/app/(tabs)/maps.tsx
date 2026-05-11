import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -23.1045,
          longitude: -48.9397,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        provider="google"
      >
       

        <Marker
          coordinate={{
            latitude: -23.1045,
            longitude: -48.9397,
          }}
          title="Bizungao Avaré"
          description="Centro da cidade"
        />

      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});