import React from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleProp, ViewStyle } from 'react-native';

type Props = {
  style?: StyleProp<ViewStyle>;
  latitude?: number;
  longitude?: number;
  title?: string;
  description?: string;
};

export default function MapPreview({ style, latitude, longitude, title, description }: Props) {
  const region: Region = {
    latitude: typeof latitude === 'number' ? latitude : 14.5995,
    longitude: typeof longitude === 'number' ? longitude : 120.9842,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <MapView
      style={style as any}
      initialRegion={region}
      scrollEnabled={false}
      zoomEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title={title} description={description} />
    </MapView>
  );
}

