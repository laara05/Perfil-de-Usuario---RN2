import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, View, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    photo: null,
    phone: '',
    address: '',
    documentScan: null,
  });

  // autenticación de google
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: '881020710896-v1d8r3go1ejb2k8trfqhmtj5fmae4dtn.apps.googleusercontent.com',
    redirectUri: 'mi-app://auth',
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      setUser(authentication);
    }
  }, [googleResponse]);

  // autenticación de facebook
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'facebook-app-id',
    redirectUri: 'mi-app://auth',
  });

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      setUser(authentication);
    }
  }, [fbResponse]);

  // autenticación de Apple 
  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      setUser(credential);
    } catch (error) {
      console.error('Error iniciando sesión con Apple', error);
    }
  };

  // función para seleccionar una foto
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Se necesita acceso a la galería para seleccionar una imagen");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setProfile({ ...profile, photo: result.uri });
    }
  };

  // obtener la ubicación
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert("Permiso para acceder a la ubicación denegado.");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setProfile({ ...profile, address: `Lat: ${location.coords.latitude}, Lon: ${location.coords.longitude}` });
  };

  // escanear un documento (la galería como ejemplo)
  const scanDocument = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Se necesita acceso a la galería para escanear un documento");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setProfile({ ...profile, documentScan: result.uri });
    }
  };

  // guardar el perfil
  const saveProfile = () => {
    Alert.alert("Perfil actualizado", "Tu información de perfil se guardò exitosamente.");
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {!user ? (
        <>
          <Button
            disabled={!googleRequest}
            title="Login con Google"
            onPress={() => {
              googlePromptAsync();
            }}
          />
          <Button
            disabled={!fbRequest}
            title="Login con Facebook"
            onPress={() => {
              fbPromptAsync();
            }}
          />
          {AppleAuthentication.isAvailableAsync() && (
            <Button
              title="Login con Apple"
              onPress={handleAppleLogin}
            />
          )}
        </>
      ) : (
        <>
          <Text>Usuario autenticado</Text>

          {/* formulario para actualizar el perfil */}
          <TextInput
            placeholder="Nombre"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
          />

          <Button title="Seleccionar foto" onPress={pickImage} />
          {profile.photo && <Image source={{ uri: profile.photo }} style={{ width: 100, height: 100, marginTop: 10 }} />}

          <TextInput
            placeholder="Teléfono"
            value={profile.phone}
            keyboardType="phone-pad"
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
          />

          <Button title="Obtener ubicación" onPress={getLocation} />
          {profile.address && <Text>Ubicación: {profile.address}</Text>}

          <Button title="Escanear documento" onPress={scanDocument} />
          {profile.documentScan && <Image source={{ uri: profile.documentScan }} style={{ width: 100, height: 100, marginTop: 10 }} />}

          <Button title="Guardar perfil" onPress={saveProfile} />
        </>
      )}
    </View>
  );
}