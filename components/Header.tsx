import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const Header: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.topBar}>
      <Image
        source={{
          uri: 'https://img.icons8.com/color/48/000000/user-male-circle--v1.png',
        }}
        style={styles.profileIcon}
      />
      <Text style={styles.title}>InternQuest</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Image
          source={{
            uri: 'https://img.icons8.com/ios-filled/50/000000/menu--v1.png',
          }}
          style={styles.menuIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
});

export default Header;
