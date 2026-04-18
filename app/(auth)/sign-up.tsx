import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const signUp = () => {
  return (
    <View>
      <Text>sign-up</Text>
      <Link href="/(auth)/sign-in"> Already have Account? , SignIn</Link>
    </View>
  );
};

export default signUp;
