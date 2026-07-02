import React from 'react';
import { View, Text, Image } from 'react-native';

import LoginImage from '../../assets/Sprout.png';

const Login = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image source={LoginImage} style={{ height: 300, width: 300 }} />
      <Text>Login</Text>
    </View>
  );
};

export default Login;