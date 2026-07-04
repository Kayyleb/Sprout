import React, { useState } from 'react';
import { StyleSheet, Text, Image , TextInput , TouchableOpacity, View, Alert, ActivityIndicator, TextInputComponent } from 'react-native';

import LoginImage from '../../assets/Sprout.png';


export default function Login({navigation}) {
    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');
    const [loading , setLoading] = useState(false);
    const [guest] = useState('');


const handleLogin = () => {
    if(!email || !password) {
        Alert.alert('Error' , 'Please Fill in all fields.');
        return;
    }

    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        navigation.replace("Home");
    } , 1500);
};

return(
    <View style={ styles.container }>
        <View style={styles.logoContainer}>
        <Image source={LoginImage} style={{ height: 300, width: 300 }} />
        <Text style={styles.logoText}> SPROUT</Text>
        </View>

      <TextInput style={styles.inputBar} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
        autoCapitalize="none" />

      <TextInput style={styles.inputBar} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry={true} 
        autoCapitalize='none' />

      <TouchableOpacity style={styles.loginButton} 
      onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  container: { // styling for gthe page, making sure everything is centered
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
  loginButton: { // for the login button, might change from green tom a different color depening how i am feeling
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
logoText: {
  position: 'absolute',
  bottom: 20,           
  fontSize: 32,
  fontWeight: 'bold',
  color: '#2d7a3a',    
  letterSpacing: 2,
},
  buttonText: { color: '#fff', fontWeight: '600' },
});