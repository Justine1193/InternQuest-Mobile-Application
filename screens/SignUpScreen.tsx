import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type NavigationProp = StackNavigationProp<RootStackParamList, "SignUp">;

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const handleSignUp = async () => {
    if (!email || !confirmEmail || !password || !confirmPassword) {
      Alert.alert("Please fill in all fields.");
      return;
    }

    if (email !== confirmEmail) {
      Alert.alert("Emails do not match.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await set(ref(db, `users/${user.uid}`), {
        email,
        password,
      });

      Alert.alert("Success", "Account created!");
      navigation.navigate("SetupAccount");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Image
        source={require("../assets/InternQuest.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Create your Account here!!</Text>


      <View style={styles.inputWrapper}>
        <Icon name="email-outline" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Enter email"
          style={styles.input}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Icon name="email-check-outline" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Confirm email"
          style={styles.input}
          value={confirmEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setConfirmEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Icon name="lock-outline" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Enter password"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <Icon name="lock-check-outline" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Confirm password"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text style={styles.loginLink} onPress={() => navigation.navigate("SignIn")}>
            Sign In
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0077cc",
    textAlign: "center",
    marginTop: 0,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#0077cc",
    paddingVertical: 14,
    borderRadius: 6,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
  loginContainer: {
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#555",
  },
  loginLink: {
    fontWeight: "bold",
    color: "#0077cc",
  },
});

export default SignUpScreen;
