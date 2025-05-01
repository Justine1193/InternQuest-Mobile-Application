import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  useColorScheme,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Profile: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

type Props = {
  setIsLoggedIn: (value: boolean) => void;
};

const SignInScreen: React.FC<Props> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = {
    background: isDark ? "#121212" : "#fff",
    text: isDark ? "#fff" : "#333",
    border: isDark ? "#444" : "#ccc",
    buttonText: "#fff",
    buttonBg: "#004d40",
    link: "#0077cc",
  };

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ User signed in:", userCredential.user.uid);
      setIsLoggedIn(true);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error: any) {
      Alert.alert("Login Failed", "Invalid email or password.");
      console.error("Login error:", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Image
          source={require("../assets/InternQuest_with_text.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <View style={[styles.inputContainer, { borderColor: theme.border }]}>
          <Icon name="email-outline" size={20} style={[styles.icon, { color: theme.text }]} />
          <TextInput
            placeholder="Enter email"
            placeholderTextColor={isDark ? "#888" : "#aaa"}
            style={[styles.input, { color: theme.text }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
        <View style={[styles.inputContainer, { borderColor: theme.border }]}>
          <Icon name="lock-outline" size={20} style={[styles.icon, { color: theme.text }]} />
          <TextInput
            placeholder="Enter password"
            placeholderTextColor={isDark ? "#888" : "#aaa"}
            style={[styles.input, { color: theme.text }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              style={{ color: theme.text }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Text style={[styles.forgotPassword, { color: theme.link }]}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin} style={[styles.button, { backgroundColor: theme.buttonBg }]}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: theme.text }]}>
            Don’t have an account?{" "}
            <Text
              style={[styles.signupLink, { color: theme.link }]}
              onPress={() => navigation.navigate("SignUp")}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    padding: 20,
  }, 
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 0,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 0,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: "right",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  signupContainer: {
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});

export default SignInScreen;
