import React, { useState } from 'react';
import { StyleSheet, Text, Image , TextInput, TouchableOpacity, View, Alert, ActivityIndicator, TextInputComponent } from 'react-native';

import LoginImage from '../../assets/Sprout.png';

export default function LoginBar() {
    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');
    const [loading , setLoading] = useState(false);


const handleLogin = () => {
    if(!email || !password) {
        Alert.alert('Error' , 'Please Fill in all fields.');
        return;
    }

    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        Alert.alert('Success');
    } , 1500);
};

return(
    <View style={ styles.container }>
        <View style={styles.logoContainer}>
        <Image source={LoginImage} style={{ height: 300, width: 300 }} />
        <Text style={styles.logoText}> SPROUT</Text>
        </View>

      <TextInput style={styles.inputBar} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.inputBar} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} autoCapitalize='none' />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                    // fill the screen
    padding: 20,
    justifyContent: 'center',   // center vertically
    alignItems: 'center',       // center horizontally
    backgroundColor: '#fff',
  },
  logo: {
    height: 200,
    width: 200,
    marginBottom: 30,
    resizeMode: 'contain',      // scale image cleanly inside its box
  },
  inputBar: {
    width: '100%',              // now needed since alignItems:center shrinks children
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#009e2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 30,
},
logoText: {
  position: 'absolute',
  bottom: 20,                  // tweak this number to slide up/down
  fontSize: 32,
  fontWeight: 'bold',
  color: '#2d7a3a',            // whatever color reads well on your image
  letterSpacing: 2,
},
  buttonText: { color: '#fff', fontWeight: '600' },
});