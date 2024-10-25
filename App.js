import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, Text, View, TextInput, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';

export default function App() {
  const [cep1, setCep1] = useState('');
  const [cep2, setCep2] = useState('');
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getCoordinates(cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados para o CEP: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.erro) {
        throw new Error('CEP inválido');
      }
  
      const address = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`;
      console.log("Endereco:")
      console.log(address);
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
      console.log("Retorno:")
      if (!geoResponse.ok) {
        throw new Error(`Erro ao buscar coordenadas: ${geoResponse.statusText}`);
      }
      
      const geoData = await geoResponse.json();
      if (geoData.length === 0) {
        throw new Error('Endereço não encontrado');
      }
  
      return {
        lat: parseFloat(geoData[0].lat),
        lon: parseFloat(geoData[0].lon),
      };
    } catch (error) {
      Alert.alert("Erro", error.message);
      return null;
    }
  }
  

  function calculateDistance() {
    if (!cep1 || !cep2) {
      Alert.alert("Atenção", "Por favor, preencha os dois CEPs.");
      return;
    }
    setLoading(true);
    Promise.all([getCoordinates(cep1), getCoordinates(cep2)])
      .then(([coord1, coord2]) => {
        if (coord1 && coord2) {
          const dist = getDistance(coord1.lat, coord1.lon, coord2.lat, coord2.lon);
          setDistance(dist);
        } else {
          setDistance(null);
        }
      })
      .finally(() => setLoading(false));
  }

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  }

  return (
      <ImageBackground source={require('./map3.jpg')} style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Cálculo de Distância entre CEPs</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o primeiro CEP"
            keyboardType="numeric"
            value={cep1}
            onChangeText={setCep1}
          />
          <TextInput
            style={styles.input}
            placeholder="Digite o segundo CEP"
            keyboardType="numeric"
            value={cep2}
            onChangeText={setCep2}
          />
          <TouchableOpacity onPress={calculateDistance} style={styles.button}>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Calcular distância</Text>
            )}
          </TouchableOpacity>
          {distance !== null && (
            <View>
              <Text>A distância entre os CEPs é {distance.toFixed(2)} km.</Text>
            </View>
          )}
        </View>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    width: 300,
    alignSelf: 'center',
    height: 300,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  titulo: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
