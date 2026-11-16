import React, { useState } from 'react';
import { StyleSheet, Text, Image, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';

import LoginImage from '../../assets/Sprout.png';

// log in screen, the first thing the user sees when opening the app
export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // true while the sign in is "working", swaps the button text for a spinner

  // runs when the user taps Sign In
  // no db integration yet, so for now it only checks that both fields are filled in and then moves to home
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please Fill in all fields.');
      return;
    }

    // fake loading time, this is where the real log in call to the backend will go
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace("Home"); // replace so the back button does not go back to login
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={LoginImage} style={styles.logoImage} />
        <Text style={styles.logoText}> SPROUT</Text>
      </View>

      <TextInput
        style={styles.inputBar}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.inputBar}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>
    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  container: { // styling for the page, making sure everything is centered
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  inputBar: { // styling for both input bars
    width: '100%',
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  loginButton: { // for the login button, might change from green to a different color depending how i am feeling
    width: '100%',
    height: 50,
    backgroundColor: '#009e2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: { // make sure the logo is centered
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  logoImage: { // the sprout logo
    height: 300,
    width: 300,
  },

  logoText: { // app name, sits on top of the bottom of the logo
    position: 'absolute',
    bottom: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d7a3a',
    letterSpacing: 2,
  },

  buttonText: { // text inside the login button
    color: '#fff',
    fontWeight: '600',
  },
});
