import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

// Navigation type definition
type RootStackParamList = {
  Dashboard: undefined;
  SignUp: undefined;
  SignIn: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SignIn"
>;

const SignInScreen: React.FC = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ User signed in:", userCredential.user.uid);
      navigation.navigate("Dashboard");
    } catch (error: any) {
      Alert.alert("Login Failed", "Invalid email or password.");
      console.error("Login error:", error.message);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/NEU_Main_Campus%2C_Central_Avenue%2C_New_Era%2C_Quezon_City.jpg/330px-NEU_Main_Campus%2C_Central_Avenue%2C_New_Era%2C_Quezon_City.jpg",
      }}
      style={styles.background}
      imageStyle={{ opacity: 0.85 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Log In</Text>

        <TextInput
          placeholder="Your Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Your Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don’t have an account?{" "}
            <Text
              style={styles.signupLink}
              onPress={() => navigation.navigate("SignUp")}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

// 👇 STYLE GOES HERE
const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center", // Align content vertically centered
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.85)", // Semi-transparent background for readability
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5, // Adds a shadow effect for better visibility
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#002f6c",
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2980b9",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  signupContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#333",
  },
  signupLink: {
    color: "#004aad",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});

export default SignInScreen;
